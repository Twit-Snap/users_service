import { Pool, QueryResult } from 'pg';
import { Admin, AdminWithPassword } from '../types/admin';
import { EntityAlreadyExistsError } from '../types/customErrors';

class AdminRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async create(adminData: AdminWithPassword): Promise<Admin> {
    const { username, email, password } = adminData;
    const query = `
      INSERT INTO admins (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING username, email
    `;
    try {
      const result: QueryResult = await this.pool.query(query, [username, email, password]);
      return result.rows[0] as Admin;
    } catch (error) {
        console.error(error);
        const errorAux = error as { code: string; constraint: string };
        if (errorAux.code === '23505') {
          // PostgreSQL unique constraint violation error code
          if (errorAux.constraint?.includes('admins_pkey')) {
            throw new EntityAlreadyExistsError('Username', 'Username is already in use');
          } else if (errorAux.constraint?.includes('email')) {
            throw new EntityAlreadyExistsError('Email', 'Email is already in use');
          }
        }
        // If it's not a unique constraint violation, re-throw the original error
        throw error;
    }
  }


  async findByEmailOrUsername(emailOrUsername: string): Promise<AdminWithPassword | null> {
    const query =
      'SELECT username, email, password, created_at AS "createdAt" FROM admins WHERE email = $1 OR username = $1';
    const result = await this.pool.query(query, [emailOrUsername]);
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0] as AdminWithPassword;
  }
}

export { AdminRepository };
