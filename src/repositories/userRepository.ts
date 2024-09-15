import { Pool, QueryResult } from 'pg';
import { CreateUserDto, User } from 'user';


class UserRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async getList(): Promise<User | null> {
    const query = 'SELECT id, username, email, created_at FROM users';
    try {
      const result: QueryResult = await this.pool.query(query);
      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0] as User;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }async get(id: number): Promise<User | null> {
    const query = 'SELECT id, username, email, created_at FROM users WHERE id = $1';
    try {
      const result: QueryResult = await this.pool.query(query, [id]);
      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0] as User;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async create(userData: CreateUserDto): Promise<User> {
    const { username, email, password } = userData;
    const query = `
      INSERT INTO users (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, created_at
    `;
    try {
      const result: QueryResult = await this.pool.query(query, [username, email, password]);
      return result.rows[0] as User;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
}

export { UserRepository, User, CreateUserDto };