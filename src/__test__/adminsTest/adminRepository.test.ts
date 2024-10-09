// import { Pool } from "pg";
// import { AdminRepository } from "../repositories/adminRepository";

// describe("AdminService - create admin", () => {
//   let adminService: AdminRepository;
//   let pool: jest.Mocked<Pool>;

//   //   let poolMocked: jest.Mocked<Pool>;

//   beforeAll(() => {
//     pool = {
//       query: jest.fn(),
//     } as unknown as jest.Mocked<Pool>;
//   });
//   beforeEach(() => {
//     adminService = new AdminRepository(pool);
//   });

//   it("should create a new admin successfully", async () => {
//     // Datos de prueba
//     const adminData = {
//       username: "admin1",
//       email: "admin1@example.com",
//       password: "securepassword",
//     };

//     // Simular la respuesta del query
//     pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // Para la verificación del username
//     pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // Para la verificación del username
//     pool.query.mockResolvedValueOnce({
//       rows: [{ username: "admin1", email: "admin1@example.com" }],
//       rowCount: 1,
//     }); // Para la inserción

//     const result = await adminService.create(adminData);
//     expect(result).toEqual({ username: "admin1", email: "admin1@example.com" });
//   });

//   it("should fail with repite username", async () => {
//     const adminData = {
//       username: "invalid_user",
//       email: "admin1@example.com",
//       password: "securepassword",
//     };

//     jest
//       .spyOn(pool, "query")
//       .mockResolvedValueOnce({ rows: [{ username: "admin1" }], rowCount: 1 });

//     await expect(adminService.create(adminData)).rejects.toThrow(
//       expect.objectContaining({
//         name: "InvalidCredentials", // Verifica el tipo de error
//         message: "invalid_user already exists", // Verifica el mensaje
//       })
//     );
//   });

//   it("should fail with repite email", async () => {
//     const adminData = {
//       username: "admin1",
//       email: "admin1@example.com",
//       password: "securepassword",
//     };

//     // Simula la respuesta de la consulta que indica que el username ya existe
//     pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // Para la verificación del username
//     const mockQuery = pool.query.mockResolvedValueOnce({
//       rows: [{ email: "admin1@example.com" }],
//       rowCount: 1,
//     });

//     await expect(adminService.create(adminData)).rejects.toThrow(
//       expect.objectContaining({
//         name: "InvalidCredentials", // Verifica el tipo de error
//         message: " admin1@example.com already exists", // Verifica el mensaje
//       })
//     );
//     mockQuery.mockRestore();
//   });
// });
