import { User } from 'user';
import { UserRepository } from '../../repositories/user/userRepository';
import { AdminService } from '../../services/adminService';
import { NotFoundError } from '../../types/customErrors';

jest.mock('../../repositories/adminRepository');
jest.mock('../../services/jwtService');
jest.mock('bcrypt');

describe('AdminService', () => {
  let service: AdminService;
  let dbServiceMock: jest.Mocked<UserRepository>;

  const aMockUser: User = {
    id: 1,
    username: 'aUser',
    email: 'aUser@example.com',
    name: 'aUser',
    lastname: 'aUserLastName',
    birthdate: new Date(),
    createdAt: new Date(),
    isPrivate: false
  };

  const anotherMockUser: User = {
    id: 1,
    username: 'anotherUser',
    email: 'anotherUser@example.com',
    name: 'anotherUser',
    lastname: 'anotherUserLastName',
    birthdate: new Date(),
    createdAt: new Date(),
    isPrivate: false
  };

  const mockUsers = [aMockUser, anotherMockUser];

  beforeEach(() => {
    dbServiceMock = {
      getList: jest.fn().mockResolvedValue(mockUsers),
      getByUsername: jest.fn().mockResolvedValue(aMockUser)
    } as unknown as jest.Mocked<UserRepository>;

    service = new AdminService(dbServiceMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserList', () => {
    it('should return a list of users', async () => {
      const has: string = '';
      const result = await service.getUserList({ has: has });
      expect(result).toEqual(mockUsers);
    });
  });

  describe('getUserByUsername', () => {
    it('should return a user', async () => {
      const result = await service.getUserByUsername(aMockUser.username);
      expect(result).toEqual(aMockUser);
    });

    it('should throw an error if user is not found', async () => {
      dbServiceMock.getByUsername.mockResolvedValue(null);
      await expect(service.getUserByUsername('nonExistentUser')).rejects.toThrow(NotFoundError);
    });
  });
});
