import { JWTService } from '../../services/jwtService';
import { UserService } from '../../services/userService';
import { AuthenticationError, BlockedError } from '../../types/customErrors';
import { JwtCustomPayload } from '../../types/jwt';
import { checkBlockedUser, decodeToken } from './authMiddleware';

// Mock the services
jest.mock('../../services/jwtService');
jest.mock('../../services/userService');

describe('Auth Functions', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('decodeToken', () => {
    const MockedJWTService = JWTService as jest.MockedClass<typeof JWTService>;

    it('should successfully decode a valid token', () => {
      const mockPayload: JwtCustomPayload = {
        userId: 1,
        type: 'user',
        username: 'test',
        email: 'test@gmail.com',
        phoneNumber: '+541112341234',
        verified: false
      };

      // Setup the mock implementation
      MockedJWTService.prototype.verify.mockReturnValue(mockPayload);

      const result = decodeToken('Bearer validToken');

      expect(result).toEqual(mockPayload);
      expect(MockedJWTService.prototype.verify).toHaveBeenCalledWith('validToken');
    });

    it('should throw AuthenticationError when no token is provided', () => {
      expect(() => decodeToken(undefined)).toThrow(AuthenticationError);
    });

    it('should throw AuthenticationError when authorization header is malformed', () => {
      expect(() => decodeToken('InvalidHeader')).toThrow(AuthenticationError);
    });

    it('should throw AuthenticationError when Bearer token is empty', () => {
      expect(() => decodeToken(undefined)).toThrow(AuthenticationError);
    });
  });

  describe('checkBlockedUser', () => {
    const MockedUserService = UserService as jest.MockedClass<typeof UserService>;

    it('should not throw error for admin users', async () => {
      const adminToken: JwtCustomPayload = {
        type: 'admin',
        username: 'test',
        email: 'test@gmail.com'
      };

      await expect(checkBlockedUser(adminToken)).resolves.not.toThrow();
      expect(MockedUserService.prototype.get).not.toHaveBeenCalled();
    });

    it('should not throw error for non-blocked users', async () => {
      const userToken: JwtCustomPayload = {
        userId: 1,
        type: 'user',
        username: 'test',
        email: 'test@gmail.com',
        phoneNumber: '+541112341234',
        verified: false
      };

      MockedUserService.prototype.get.mockResolvedValue({
        id: 1,
        isBlocked: false,
        username: 'test',
        email: 'test@gmail.com',
        name: 'test',
        lastname: 'test',
        birthdate: new Date('2000-02-02'),
        createdAt: new Date('2000-02-02'),
        isPrivate: false,
        verified: false,
        phoneNumber: '541112341234'
        // ... other user properties
      });

      await expect(checkBlockedUser(userToken)).resolves.not.toThrow();
      expect(MockedUserService.prototype.get).toHaveBeenCalledWith(1);
    });

    it('should throw BlockedError for blocked users', async () => {
      const userToken: JwtCustomPayload = {
        userId: 1,
        type: 'user',
        username: 'test',
        email: 'test@gmail.com',
        phoneNumber: '+541112341234',
        verified: false
      };

      MockedUserService.prototype.get.mockResolvedValue({
        id: 1,
        isBlocked: true,
        username: 'test',
        email: 'test@gmail.com',
        name: 'test',
        lastname: 'test',
        birthdate: new Date('2000-02-02'),
        createdAt: new Date('2000-02-02'),
        isPrivate: false,
        phoneNumber: '+541112341234',
        verified: false
        // ... other user properties
      });

      await expect(() => checkBlockedUser(userToken)).rejects.toThrow(BlockedError);
      expect(MockedUserService.prototype.get).toHaveBeenCalledWith(1);
    });

    it('should throw BlockedError when user is not found', async () => {
      const userToken: JwtCustomPayload = {
        userId: 1,
        type: 'user',
        username: 'test',
        email: 'test@gmail.com',
        phoneNumber: '+541112341234',
        verified: false
      };

      MockedUserService.prototype.get.mockResolvedValue(null);

      await expect(checkBlockedUser(userToken)).rejects.toThrow(BlockedError);
      expect(MockedUserService.prototype.get).toHaveBeenCalledWith(1);
    });

    it('should handle UserService errors', async () => {
      const userToken: JwtCustomPayload = {
        userId: 1,
        type: 'user',
        username: 'test',
        email: 'test@gmail.com',
        phoneNumber: '+541112341234',
        verified: false
      };

      const error = new Error('Service unavailable');
      MockedUserService.prototype.get.mockRejectedValue(error);

      await expect(checkBlockedUser(userToken)).rejects.toThrow(error);
      expect(MockedUserService.prototype.get).toHaveBeenCalledWith(1);
    });
  });
});
