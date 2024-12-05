import { FollowersResponse, FollowReturn, GetAllFollowsParams } from 'follow';
import { Pool } from 'pg';
import {
  GetUserParams,
  GetUsersListParams,
  Interest,
  IUserRepository,
  ModifiableUser,
  OnlyExpoToken,
  User,
  UserWithPassword
} from 'user';
import { UserRegisterRepository } from 'userAuth';
import { EntityAlreadyExistsError } from '../../types/customErrors';
import { userCamelColumnsToSnake } from '../../utils/user';
import { DatabasePool } from '../db';

export class UserRepository implements IUserRepository {
  private pool: Pool;
  private readonly selectUserFields = `id, username, email, name, lastname, birthdate, users.created_at AS "createdAt", sso_uid as "ssoUid", provider_id as "providerId", profile_picture as "profilePicture", is_private AS "isPrivate", is_blocked AS "isBlocked", expo_token AS "expoToken", phone_number AS "phoneNumber", verified, background_picture AS "backgroundPicture"`;
  private readonly reducedUserFields =
    'id, username, name, profile_picture AS "profilePicture", is_private AS "isPrivate", expo_token AS "expoToken", background_picture AS "backgroundPicture"';

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

  async getAmount(params: GetUsersListParams): Promise<number> {
    var offset = '';
    var queryParams: (number | string)[] = [];

    if (params.createdAt) {
      queryParams.push(params.createdAt);
      offset = `WHERE created_at ${params.equalDate ? '<=' : '<'} $${queryParams.length}::timestamptz ${params.equalDate ? ` + interval '0.999999 seconds'` : ''}`;
    }

    const query = `SELECT COUNT(*) FROM users ${offset}`;
    const result = await this.pool.query(query, queryParams);
    return result.rows[0];
  }

  async getList(params: GetUsersListParams): Promise<User[]> {
    var queryParams: (string | number)[] = [`%${params.has}%`];
    var offset = '';
    var limit = '';

    if (params.createdAt) {
      queryParams.push(params.createdAt);
      offset = ` AND created_at ${params.equalDate ? '<=' : '<'} $${queryParams.length}::timestamptz ${params.equalDate ? ` + interval '0.999999 seconds'` : ''}`;
    }

    if (params.limit) {
      queryParams.push(params.limit);
      queryParams.push(params.offset);
      limit = ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;
    }

    const query = `
    SELECT ${this.selectUserFields}
    FROM users
    WHERE (username ILIKE $1 OR name ILIKE $1)${offset}
    ORDER BY created_at DESC
    ${limit}`;

    const result = await this.pool.query<User>(query, queryParams);
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
    const {
      username,
      email,
      name,
      lastname,
      password,
      profilePicture,
      ssoProviderId,
      ssoUid,
      expoToken,
      phoneNumber
    } = userData;
    const birthdate = new Date(userData.birthdate).toISOString();

    const query = `
      INSERT INTO users (username, email, name, lastname, birthdate, password, profile_picture, sso_uid, provider_id, expo_token, phone_number)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
        ssoProviderId,
        expoToken,
        phoneNumber
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
        } else if (errorAux.constraint?.includes('phone_number')) {
          throw new EntityAlreadyExistsError('phoneNumber', 'Phone number is already in use');
        }
      }
      // If it's not a unique constraint violation, re-throw the original error
      throw error;
    }
  }

  async getByUsername(username: string, params?: GetUserParams) {
    const query = `SELECT ${params?.reduce ? this.reducedUserFields : this.selectUserFields} FROM users WHERE username = $1`;
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

  async getFollows(userId: number, params: GetAllFollowsParams): Promise<FollowersResponse[]> {
    var queryParams: (number | string)[] = [userId, `%${params.has}%`];

    const condition = params.byFollowers ? 'followedId = $1' : 'userId = $1';
    const join = params.byFollowers ? 'userId' : 'followedId';
    var offset = '';
    var limit = '';

    if (params.createdAt) {
      queryParams.push(params.createdAt);
      offset = ` AND follows.created_at < $${queryParams.length}`;
    }

    if (params.limit) {
      queryParams.push(Number(params.limit));
      limit = ` LIMIT $${queryParams.length}`;
    }

    const query = `
      SELECT id, username, name, follows.created_at AS "followCreatedAt"
      FROM follows
      INNER JOIN users ON follows.${join} = users.id
      WHERE ${condition}${offset} AND (username ILIKE $2 OR name ILIKE $2)
      ORDER BY follows.created_at DESC
      ${limit}
    `;

    try {
      const result = await this.pool.query<FollowersResponse>(query, queryParams);
      return result.rows;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getFollowsFullData(userId: number, params: GetAllFollowsParams): Promise<User[]> {
    var queryParams: (number | string)[] = [userId, `%${params.has}%`];

    const condition = params.byFollowers ? 'followedId = $1' : 'userId = $1';
    const join = params.byFollowers ? 'userId' : 'followedId';
    var offset = '';
    var limit = '';

    if (params.createdAt) {
      queryParams.push(params.createdAt);
      offset = ` AND follows.created_at < $${queryParams.length}`;
    }

    if (params.limit) {
      queryParams.push(Number(params.limit));
      limit = ` LIMIT $${queryParams.length}`;
    }

    const query = `
      SELECT ${this.selectUserFields}
      FROM follows
      INNER JOIN users ON follows.${join} = users.id
      WHERE ${condition}${offset} AND (username ILIKE $2 OR name ILIKE $2)
      ORDER BY follows.created_at DESC
      ${limit}
    `;

    try {
      const result = await this.pool.query<User>(query, queryParams);
      return result.rows;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async modifyUser(userId: number, newValues: ModifiableUser): Promise<User> {
    let queryParams: (string | number | boolean)[] = [userId];

    const setVars: string = Object.entries(newValues)
      .map(([key, val]) => {
        queryParams.push(val);
        const snakeKey = userCamelColumnsToSnake(key);
        return `${snakeKey} = $${queryParams.length}`;
      })
      .join(', ');

    const query = `
      UPDATE users
      SET ${setVars}
      WHERE id = $1
      RETURNING ${this.selectUserFields}
    `;

    try {
      const result = await this.pool.query<User>(query, queryParams);
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
        }
      }
      // If it's not a unique constraint violation, re-throw the original error
      throw error;
    }
  }

  async putExpoToken(userId: number, expoToken: string): Promise<void> {
    const query = `
      UPDATE users
      SET expo_token = $2
      WHERE id = $1
    `;

    try {
      await this.pool.query(query, [userId, expoToken]);
    } catch (error) {
      console.error(error);
      // If it's not a unique constraint violation, re-throw the original error
      throw error;
    }
  }

  async updateLocation(
    username: string,
    location: { latitude: number; longitude: number }
  ): Promise<void> {
    const query = `
      UPDATE users
      SET latitude = $1, longitude = $2
      WHERE username = $3
    `;
    await this.pool.query(query, [location.latitude, location.longitude, username]);
  }

  async getAllExpoTokens(senderId: number): Promise<OnlyExpoToken[]> {
    const query = `
      SELECT expo_token AS "expoToken"
      FROM users
      WHERE id <> $1 and expo_token IS NOT NULL
      `;

    const result = await this.pool.query(query, [senderId]);
    return result.rows;
  }

  async getAllInterests(): Promise<Interest[]> {
    const query = 'SELECT id, name, parent_id AS "parentId", emoji FROM interests';
    const result = await this.pool.query(query);
    return result.rows;
  }

  async getUserInterests(userId: number): Promise<Interest[]> {
    const query = `
      SELECT i.id, i.name, i.parent_id AS "parentId", i.emoji
      FROM user_interests ui
      JOIN interests i ON ui.interest_id = i.id
      WHERE ui.user_id = $1
    `;
    const result = await this.pool.query<Interest>(query, [userId]);
    return result.rows;
  }

  async associateInterestsToUser(userId: number, interests: number[]): Promise<boolean> {
    // in the service we check that interests is not empty and are numbers, so this is safe
    const valuesQuery = interests.map((interestId) => `(${userId}, ${interestId})`).join(', ');
    const query = `
      INSERT INTO user_interests (user_id, interest_id)
      VALUES ${valuesQuery}
      ON CONFLICT (user_id, interest_id) DO NOTHING
    `;
    const result = await this.pool.query(query);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async updatePassword(userId: number, password: string): Promise<void> {
    const query = `UPDATE users SET password = $1 WHERE id = $2`;
    await this.pool.query(query, [password, userId]);
  }
}
