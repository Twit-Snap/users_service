import { Pool, QueryResult } from 'pg';
import { CreateAdminDto, Admin } from 'admin';

class AdminRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }
    /*
    async getList(): Promise<Admin[] | null> {
        const query = 'SELECT username, email FROM users';
        const result: QueryResult = await this.pool.query(query);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows as Admin[];
    }
    */
    /*
    async get(username: string): Promise<Admin | null> {
        const query = 'SELECT username, email FROM users WHERE username = $1';
        const result: QueryResult = await this.pool.query(query, [username]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0] as Admin;
    }
    */

    async create(adminData: CreateAdminDto): Promise<Admin> {
        const { username, email, password } = adminData;
        const query = `
      INSERT INTO admins (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING username, email
    `;
        const result: QueryResult = await this.pool.query(query, [username, email, password]);
        return result.rows[0] as Admin;
    }
}

export { AdminRepository };
