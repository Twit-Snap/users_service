import { Pool, QueryResult } from 'pg';
import { Admin, AdminWithPassword } from '../types/admin';
import { AlreadyExistError } from '../types/customAdminErros';

class AdminRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async create(adminData: AdminWithPassword): Promise<Admin> {
    const { username, email, password } = adminData;
    await this.checkUsername(username, email);
    await this.checkEmail(username, email);

    const query = `
      INSERT INTO admins (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING username, email
    `;

    const result: QueryResult = await this.pool.query(query, [username, email, password]);
    return result.rows[0] as Admin;
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

  private async checkUsername(username: string, email: string) {
    const checkQuery = `SELECT username FROM admins WHERE username = $1`;
    const checkResult: QueryResult = await this.pool.query(checkQuery, [username]);

    const rowCount = checkResult.rowCount ?? 0;
    if (rowCount > 0) {
      throw new AlreadyExistError(username, email, 'Username is already in use');
    }
  }

  private async checkEmail(username: string, email: string) {
    const checkQuery = `SELECT email FROM admins WHERE email = $1`;
    const checkResult: QueryResult = await this.pool.query(checkQuery, [email]);

    const rowCount = checkResult.rowCount ?? 0;
    if (rowCount > 0) {
      throw new AlreadyExistError(username, email, 'Email is already in use');
    }
  }
}

export { AdminRepository };
