import { UserService } from '../../services/userService';
import { NotFoundError } from '../../types/customErrors';
import { UserRepository } from '../../repositories/userRepository';
import { PublicUser } from 'user';


jest.mock('../../repositories/userRepository');
jest.mock('../../services/jwtService');
jest.mock('bcrypt');
jest.mock('axios'); // Mock axios for external HTTP calls

describe('UserService', () => {
  let service: UserService;
  let dbServiceMock: jest.Mocked<UserRepository>;

  const username = 'usernameTest'

  const aMockUser: PublicUser = {
    username: username,
    name: 'user',
    birthdate: new Date(),
    createdAt: new Date(),
  }

  beforeEach(() => {

    dbServiceMock = {
      getByUsername: jest.fn().mockResolvedValue(aMockUser),
    } as unknown as jest.Mocked<UserRepository>;

    service = new UserService(dbServiceMock);

  });

  afterEach(() => {
    jest.clearAllMocks();
  });



  describe('getUserList', () => {
    it('should return a list of users', async () => {
      //const result = await service.getUserList();
      //expect(result).toEqual(mockUsers);
    });
  });

  describe('getPublicUserByUsername', () => {
    it('should return a user', async () => {

      const result = await service.getPublicUser(username);
      expect(result).toEqual(aMockUser);
    });

    it('should throw an error if user is not found', async () => {
      dbServiceMock.getByUsername.mockResolvedValue(null);
      await expect(service.getPublicUser('nonExistentUser')).rejects.toThrow(NotFoundError);
    });

  });



});