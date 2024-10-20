import { FollowersResponse, FollowReturn } from 'follow';
import { Pool } from 'pg';
import { IUserRepository, User, UserWithPassword } from 'user';
import { UserRegisterRepository } from 'userAuth';
import { EntityAlreadyExistsError } from '../../types/customErrors';
import { DatabasePool } from '../db';

export class UserRepository implements IUserRepository {
  private pool: Pool;
  private readonly selectUserFields = `id, username, email, name, lastname, birthdate, created_at AS "createdAt", sso_uid as "ssoUid", provider_id as "providerId", profile_picture as "profilePicture"`;

  constructor(pool?: Pool) {
    this.pool = pool || DatabasePool.getInstance();
  }
  async findByEmailOrUsername(emailOrUsername: string): Promise<UserWithPassword | null> {
    const query = `SELECT ${this.selectUserFields}, password FROM users WHERE email = $1 OR username = $1`;
    const result = await this.pool.query<UserWithPassword>(query, [emailOrUsername]);
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0];
  }
  async findBySSOuid(uid: string): Promise<User | null> {
    const query = `SELECT ${this.selectUserFields} FROM users WHERE sso_uid = $1`;
    const result = await this.pool.query<User>(query, [uid]);
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0];
  }

  async getList(has: string): Promise<User[]> {
    const query =
      'SELECT id, username, email, name, lastname, birthdate, created_at AS "createdAt" FROM users WHERE username LIKE $1';
    const result = await this.pool.query<User>(query, [`${has}%`]);
    return result.rows;
  }

  async get(id: number): Promise<User | null> {
    const query = `SELECT ${this.selectUserFields} FROM users WHERE id = $1`;
    const result = await this.pool.query<User>(query, [id]);
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0];
  }

  async create(userData: UserRegisterRepository): Promise<User> {
    const { username, email, name, lastname, password, profilePicture, ssoProviderId, ssoUid } =
      userData;
    const birthdate = new Date(userData.birthdate).toISOString();

    const query = `
      INSERT INTO users (username, email, name, lastname, birthdate, password, profile_picture, sso_uid, provider_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING ${this.selectUserFields}
    `;

    try {
      const result = await this.pool.query<User>(query, [
        username,
        email,
        name,
        lastname,
        birthdate,
        password,
        profilePicture,
        ssoUid,
        ssoProviderId
      ]);
      return result.rows[0];
    } catch (error) {
      console.error(error);
      const errorAux = error as { code: string; constraint: string };
      if (errorAux.code === '23505') {
        // PostgreSQL unique constraint violation error code
        if (errorAux.constraint?.includes('username')) {
          throw new EntityAlreadyExistsError('Username', 'Username is already in use');
        } else if (errorAux.constraint?.includes('email')) {
          throw new EntityAlreadyExistsError('Email', 'Email is already in use');
        } else if (errorAux.constraint?.includes('sso_uid')) {
          throw new EntityAlreadyExistsError('SSOUid', 'SSO UID is already in use');
        }
      }
      // If it's not a unique constraint violation, re-throw the original error
      throw error;
    }
  }

  async getByUsername(username: string) {
    const query = `SELECT ${this.selectUserFields} FROM users WHERE username = $1`;
    const result = await this.pool.query<User>(query, [username]);
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0];
  }

  async createFollow(userId: number, followId: number): Promise<FollowReturn> {
    const query = `
      INSERT INTO follows (userId, followedId)
      VALUES ($1, $2)
      RETURNING userId, followedId, created_at AS "createdAt"
    `;
    try {
      const result = await this.pool.query<FollowReturn>(query, [userId, followId]);
      return result.rows[0];
    } catch (error) {
      console.error(error);

      const errorAux = error as { code: string; constraint: string };
      if (errorAux.code === '23505') {
        // PostgreSQL unique constraint violation error code
        throw new EntityAlreadyExistsError('Follow', `(user, followed) key alredy exists`);
      }

      throw error;
    }
  }

  async deleteFollow(userId: number, followId: number): Promise<void> {
    const query = `
      DELETE FROM follows
      WHERE userId = $1 AND followedId = $2
    `;

    try {
      await this.pool.query<FollowReturn>(query, [userId, followId]);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getFollow(userId: number, followId: number): Promise<FollowReturn | undefined> {
    const query = `
      SELECT userId, followedId, created_at AS "createdAt"
      FROM follows
      WHERE userId = $1 AND followedId = $2
    `;

    try {
      const result = await this.pool.query<FollowReturn>(query, [userId, followId]);
      return result.rows[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getFollows(userId: number, byFollowers: boolean): Promise<FollowersResponse[]> {
    const condition = byFollowers ? 'followedId = $1' : 'userId = $1';
    const join = byFollowers ? 'userId' : 'followedId';

    const query = `
      SELECT id, username, name, follows.created_at AS followCreatedAt
      FROM follows
      INNER JOIN users ON follows.${join} = users.id
      WHERE ${condition}
      ORDER BY follows.created_at DESC
    `;

    try {
      const result = await this.pool.query<FollowersResponse>(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
