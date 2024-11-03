import bcrypt from 'bcrypt';
import { AdminRepository } from '../../repositories/admin/adminRepository';
import { AdminAuthService } from '../../services/adminAuthService';
import { JWTService } from '../../services/jwtService';
import { AuthenticationError } from '../../types/customErrors';

jest.mock('../../repositories/admin/adminRepository');
jest.mock('../../services/jwtService');
jest.mock('bcrypt');

describe('AdminAuthService', () => {
  let service: AdminAuthService;
  let dbServiceMock: jest.Mocked<AdminRepository>;
  let jwtServiceMock: jest.Mocked<JWTService>;

  const mockAdmin = {
    username: 'adminUser',
    email: 'admin@example.com'
  };

  const mockAdminWithPassword = {
    ...mockAdmin,
    password: 'plaintextPassword'
  };

  beforeEach(() => {
    dbServiceMock = {
      create: jest.fn().mockResolvedValue(mockAdmin),
      findByEmailOrUsername: jest.fn().mockResolvedValue(mockAdminWithPassword)
    } as unknown as jest.Mocked<AdminRepository>;

    jwtServiceMock = new JWTService() as jest.Mocked<JWTService>;
    service = new AdminAuthService(dbServiceMock, jwtServiceMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAdmin', () => {
    it('should create a new admin with hashed password and use add it to the DB', async () => {
      //Mock of bcrypt.hash
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const adminData = { ...mockAdminWithPassword };
      const result = await service.createAdmin(adminData);

      expect(bcrypt.hash).toHaveBeenCalledWith(adminData.password, 10);
      expect(result).toEqual(mockAdmin);
    });
  });

  describe('loginAdmin', () => {
    const adminDataWithPassword = {
      username: 'adminUser',
      email: 'admin@example.com',
      password: 'hashedPassword'
    };

    const adminData = {
      username: 'adminUser',
      email: 'admin@example.com'
    };

    it('should log in admin with valid credentials', async () => {
      jwtServiceMock.sign.mockReturnValue('mockedToken');
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await service.loginAdmin(adminData.email, 'validPassword');

      expect(result).toEqual({ ...adminData, token: 'mockedToken' });
    });

    it('should throw AuthenticationError for invalid admin', async () => {
      dbServiceMock.findByEmailOrUsername.mockResolvedValue(null);
      await expect(service.loginAdmin(adminData.email, 'validPassword')).rejects.toThrow(
        AuthenticationError
      );
    });

    it('should throw AuthenticationError for invalid password', async () => {
      // Simulate that an admin was found
      dbServiceMock.findByEmailOrUsername.mockResolvedValue(adminDataWithPassword);

      // Simulate that the password is incorrect
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.loginAdmin(adminData.email, 'wrongPassword')).rejects.toThrow(
        AuthenticationError
      );

      // Verify that the password was compared
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongPassword', adminDataWithPassword.password);
    });
  });
});
