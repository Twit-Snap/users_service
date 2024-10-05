import { UserService } from '../../services/userService';
import { NotFoundError } from '../../types/customErrors'
import { UserRepository } from '../../repositories/userRepository';
import { PublicUser } from 'user';


jest.mock('../../repositories/userRepository');
jest.mock('../../services/jwtService');
jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let dbServiceMock: jest.Mocked<UserRepository>;

  const aMockUser: PublicUser = {
    username: 'aUser',
    birthdate: new Date(),
    createdAt: new Date(),
  }
  //const mockUsers = [aMockUser, anotherMockUser];

  beforeEach(() => {

    dbServiceMock = {
      //getList: jest.fn().mockResolvedValue(mockUsers),
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
      const result = await service.getUserByUsername(aMockUser.username);
      expect(result).toEqual(aMockUser);
    });

    it('should throw an error if user is not found', async () => {
      dbServiceMock.getByUsername.mockResolvedValue(null);
      await expect(service.getUserByUsername('nonExistentUser')).rejects.toThrow(NotFoundError);
    });



  });

});