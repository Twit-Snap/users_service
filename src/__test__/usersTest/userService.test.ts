import { UserService } from '../../services/userService';
import { NotFoundError } from '../../types/customErrors'
import { UserRepository } from '../../repositories/userRepository';
import { PublicUserProfile } from 'user';
import axios from 'axios';


jest.mock('../../repositories/userRepository');
jest.mock('../../services/jwtService');
jest.mock('bcrypt');
jest.mock('axios'); // Mock axios for external HTTP calls

describe('UserService', () => {
  let service: UserService;
  let dbServiceMock: jest.Mocked<UserRepository>;

  const username = 'usernameTest'

  const aMockTwitUser = {
    id: 1,
    username: username,
    name: 'user',
  }

  const aMockTwit = {
    id: 1,
    createdAt: new Date(),
    user: aMockTwitUser,
    content: 'Hello word',
  }

  const aMockUserProfile: PublicUserProfile = {
    username: username,
    birthdate: new Date(),
    createdAt: new Date(),
    twits: [aMockTwit],
  }

  beforeEach(() => {

    dbServiceMock = {
      getByUsername: jest.fn().mockResolvedValue(aMockUserProfile),
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

      // Mock axios call to the tweet service
      (axios.get as jest.Mock).mockResolvedValue({
        data: {
          data: [aMockTwit],
        },
      });

      const result = await service.getUserPublicProfile(username);
      expect(result).toEqual(aMockUserProfile);
    });

    it('should throw an error if user is not found', async () => {
      dbServiceMock.getByUsername.mockResolvedValue(null);
      await expect(service.getUserPublicProfile('nonExistentUser')).rejects.toThrow(NotFoundError);
    });
  });



});