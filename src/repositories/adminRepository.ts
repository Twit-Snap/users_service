import { Pool, QueryResult } from 'pg';
import {AdminInfoDto, Admin} from 'admin';
import {AlreadyExistError, InvalidCredentialsError} from '../types/customAdminErros';

class AdminRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async create(adminData: AdminInfoDto): Promise<Admin> {

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

    async getAdminByEmail(email: string): Promise<AdminInfoDto> {

        const query = ` SELECT username, email, password FROM admins WHERE email = $1`;

        const result: QueryResult = await this.pool.query(query, [email]);
        if (result.rows.length === 0) {
            throw new InvalidCredentialsError("Invalid email");
        }
        return result.rows[0] as AdminInfoDto;
    }

    private async checkUsername(username: string, email: string) {
        const checkQuery = `SELECT username FROM admins WHERE username = $1`;
        const checkResult: QueryResult = await this.pool.query(checkQuery, [username]);

        const rowCount = checkResult.rowCount ?? 0;
        if (rowCount > 0) {
            throw new AlreadyExistError(username,email);
        }
    }

    private async checkEmail(username: string, email: string) {
        const checkQuery = `SELECT email FROM admins WHERE email = $1`;
        const checkResult: QueryResult = await this.pool.query(checkQuery, [email]);

        const rowCount = checkResult.rowCount ?? 0;
        if (rowCount > 0) {
            throw new AlreadyExistError(username,email);
        }
    }
}

export { AdminRepository };
