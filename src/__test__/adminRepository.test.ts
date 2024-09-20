import {createPool}  from '../repositories/db';
import { AdminRepository } from '../repositories/adminRepository'
import {Pool, QueryResult} from "pg";
import {InvalidCredentialsError} from "../types/customAdminErros";

describe('AdminService - create admin', () => {
    let adminService: AdminRepository;
    let pool: Pool

    beforeAll(() => {
        pool = createPool()
    })
    beforeEach(() => {
        adminService = new AdminRepository(pool);
    });

    it('should create a new admin successfully', async () => {
        // Datos de prueba
        const adminData = { username: 'admin1', email: 'admin1@example.com', password: 'securepassword' };

        // Simular la respuesta del query
        // @ts-ignore
        jest.spyOn(pool, 'query').mockResolvedValueOnce({ rows: [], rowCount: 0 }) // Para la verificación del username
        // @ts-ignore
        jest.spyOn(pool, 'query').mockResolvedValueOnce({ rows: [{ username: 'admin1', email: 'admin1@example.com' }], rowCount: 1 }); // Para la inserción


        const result = await adminService.create(adminData);
        expect(result).toEqual({ username: 'admin1', email: 'admin1@example.com' });
    });

    it('should fail with repite username', async () => {

        const adminData = { username: 'admin1', email: 'admin1@example.com', password: 'securepassword' };


        // Simula la respuesta de la consulta que indica que el username ya existe
        // @ts-ignore
        const mockQuery = jest.spyOn(pool, 'query').mockResolvedValueOnce({
            rows: [{ username: 'admin1', email: 'admin1@example.com' }],
            rowCount: 1,
        });

        await expect(adminService.create(adminData)).rejects.toThrow(InvalidCredentialsError);
        mockQuery.mockRestore();
    });

    it('should fail with repite email', async () => {

        const adminData = { username: 'admin1', email: 'admin1@example.com', password: 'securepassword' };


        // Simula la respuesta de la consulta que indica que el username ya existe
        // @ts-ignore
        const mockQuery = jest.spyOn(pool, 'query').mockResolvedValueOnce({
            rows: [{ username: 'admin1', email: 'admin1@example.com' }],
            rowCount: 1,
        });

        await expect(adminService.create(adminData)).rejects.toThrow(InvalidCredentialsError);
        mockQuery.mockRestore();
    });

});
