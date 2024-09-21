import { EntityAlreadyExistsError } from 'customErrors';
import { Pool, QueryResult } from 'pg';
import { IUserRepository, RegisterUserDto, User } from 'user';

class UserRepository implements IUserRepository{
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async getList(): Promise<User[] | null> {
    const query = 'SELECT id, username, email, created_at as createdAt FROM users';
    const result: QueryResult = await this.pool.query(query);
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows as User[];
  }

  async get(id: number): Promise<User | null> {
    const query = 'SELECT id, username, email, created_at as createdAt FROM users WHERE id = $1';
    const result: QueryResult = await this.pool.query(query, [id]);
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0] as User;
  }

  async create(userData: RegisterUserDto): Promise<User> {
    const { username, email, name, lastname, birthdate, password } = userData;
    const query = `
      INSERT INTO users (username, email, name, lastname, birthdate, password)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, username, email, name, lastname, birthdate, created_at as "createdAt"
    `;
    
    try {
      const result: QueryResult = await this.pool.query(query, [
        username,
        email,
        name,
        lastname,
        birthdate,
        password
      ]);
      return result.rows[0] as User;
    } catch (error) {
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

export { UserRepository };
