import { EntityAlreadyExistsError } from 'customErrors';
import { Pool, QueryResult } from 'pg';
import { IUserRepository, UserRegisterDto, User, UserWithPassword } from 'user';

export class UserRepository implements IUserRepository{
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }
  async findByEmailOrUsername(emailOrUsername: string): Promise<UserWithPassword | null> {
    const query = 'SELECT id, username, email, name, lastname, birthdate, password, created_at AS createdAt FROM users WHERE email = $1 OR username = $1';
    const result = await this.pool.query<UserWithPassword>(query, [emailOrUsername]);
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0];
  }

  async getList(): Promise<User[] | null> {
    const query = 'SELECT id, username, email, name, lastname, birthdate, created_at AS createdAt FROM users';
    const result = await this.pool.query<User>(query);
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows;
  }

  async get(id: number): Promise<User | null> {
    const query = 'SELECT id, username, email, name, lastname, birthdate, created_at AS createdAt FROM users WHERE id = $1';
    const result = await this.pool.query<User>(query, [id]);
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0];
  }

  async create(userData: UserRegisterDto): Promise<User> {
    const { username, email, name, lastname, birthdate, password } = userData;
    const query = `
      INSERT INTO users (username, email, name, lastname, birthdate, password)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, username, email, name, lastname, birthdate, created_at AS "createdAt"
    `;
    
    try {
      const result = await this.pool.query<User>(query, [
        username,
        email,
        name,
        lastname,
        birthdate,
        password
      ]);
      return result.rows[0];
    } catch (error) {
      console.error(error);
      const errorAux = error as { code: string, constraint: string };
      if (errorAux.code === '23505') { // PostgreSQL unique constraint violation error code
        if (errorAux.constraint?.includes('username')) {
          throw new EntityAlreadyExistsError('Username');
        } else if (errorAux.constraint?.includes('email')) {
          throw new EntityAlreadyExistsError('Email');
        }
      }
      // If it's not a unique constraint violation, re-throw the original error
      throw error;
    }
  }

}
