import axios from 'axios';
import { PublicUserProfile } from 'user';
import { UserRepository } from '../../repositories/user/userRepository';
import { UserService } from '../../services/userService';
import { NotFoundError, ServiceUnavailableError, ValidationError } from '../../types/customErrors';

jest.mock('../../repositories/user/userRepository');
jest.mock('../../services/jwtService');
jest.mock('bcrypt');
jest.mock('axios'); // Mock axios for external HTTP calls

describe('UserService', () => {
  let service: UserService;
  let dbServiceMock: jest.Mocked<UserRepository>;

  const username = 'usernameTest';

  const aMockTwitUser = {
    id: 1,
    username: username,
    name: 'user'
  };

  const aMockTwit = {
    id: 1,
    createdAt: new Date(),
    user: aMockTwitUser,
    content: 'Hello word'
  };

  const aMockUserProfile: PublicUserProfile = {
    username: username,
    birthdate: new Date(),
    createdAt: new Date(),
    twits: [aMockTwit]
  };

  beforeEach(() => {
    dbServiceMock = {
      getByUsername: jest.fn().mockResolvedValue(aMockUserProfile)
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
          data: [aMockTwit]
        }
      });

      const result = await service.getUserPublicProfile(username);
      expect(result).toEqual(aMockUserProfile);
    });

    it('should throw an error if user is not found', async () => {
      dbServiceMock.getByUsername.mockResolvedValue(null);
      await expect(service.getUserPublicProfile('nonExistentUser')).rejects.toThrow(NotFoundError);
    });

    it('should throw an error if the request to the twits service fail', async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error('Tweet service is down'));
      await expect(service.getUserPublicProfile(username)).rejects.toThrow(ServiceUnavailableError);
    });
  });

  describe('followUser', () => {
    it('should create a new follow "pepe" -> "juan"', async () => {
      dbServiceMock = {
        getByUsername: jest
          .fn()
          .mockResolvedValueOnce({ id: 1, username: 'pepe' })
          .mockResolvedValueOnce({ id: 2, username: 'juan' }),

        createFollow: jest.fn().mockResolvedValue({ createdAt: '2024-09-21T23:29:16.260Z' })
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(dbServiceMock);

      const ret = await service.followUser('pepe', 'juan');

      expect(ret).toEqual({
        createdAt: '2024-09-21T23:29:16.260Z',
        username: 'pepe',
        followedUsername: 'juan'
      });
    });

    it('should raise a NotFoundError if a user with the username "pepe" does not exist', async () => {
      dbServiceMock = {
        getByUsername: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(null),

        createFollow: jest.fn().mockResolvedValue({ createdAt: '2024-09-21T23:29:16.260Z' })
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(dbServiceMock);

      await expect(service.followUser('pepe', 'juan')).rejects.toThrow(NotFoundError);
    });

    it('should raise a NotFoundError if a user wants to follow someone with the username "juan" who does not exist', async () => {
      dbServiceMock = {
        getByUsername: jest
          .fn()
          .mockResolvedValueOnce({ id: 1, username: 'pepe' })
          .mockResolvedValueOnce(null),

        createFollow: jest.fn().mockResolvedValue({ createdAt: '2024-09-21T23:29:16.260Z' })
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(dbServiceMock);

      await expect(service.followUser('pepe', 'juan')).rejects.toThrow(NotFoundError);
    });

    it('should raise a ValidationError if a user wants to follow himself', async () => {
      dbServiceMock = {
        getByUsername: jest.fn().mockResolvedValue({ id: 1, username: 'pepe' }),

        createFollow: jest.fn().mockResolvedValue({ createdAt: '2024-09-21T23:29:16.260Z' })
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(dbServiceMock);

      await expect(service.followUser('pepe', 'pepe')).rejects.toThrow(ValidationError);
    });
  });

  describe('unfollowUser', () => {
    it('should unfollow the user "juan", "pepe" -> "juan"', async () => {
      dbServiceMock = {
        getByUsername: jest
          .fn()
          .mockResolvedValueOnce({ id: 1, username: 'pepe' })
          .mockResolvedValueOnce({ id: 2, username: 'juan' }),

        getFollow: jest.fn().mockResolvedValue({ createdAt: '2024-09-21T23:29:16.260Z' }),
        deleteFollow: jest.fn().mockResolvedValue(null)
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(dbServiceMock);

      await service.unfollowUser('pepe', 'juan');

      expect(dbServiceMock.deleteFollow).toHaveBeenCalledTimes(1);
    });

    it('should raise a NotFoundError if a user with the username "pepe" does not exist', async () => {
      dbServiceMock = {
        getByUsername: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(null),

        getFollow: jest.fn().mockResolvedValue({ createdAt: '2024-09-21T23:29:16.260Z' }),
        deleteFollow: jest.fn().mockResolvedValue(null)
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(dbServiceMock);

      await expect(service.unfollowUser('pepe', 'juan')).rejects.toThrow(NotFoundError);
    });

    it('should raise a NotFoundError if a user wants to unfollow someone with the username "juan" who does not exist', async () => {
      dbServiceMock = {
        getByUsername: jest
          .fn()
          .mockResolvedValueOnce({ id: 1, username: 'pepe' })
          .mockResolvedValueOnce(null),

        getFollow: jest.fn().mockResolvedValue({ createdAt: '2024-09-21T23:29:16.260Z' }),
        deleteFollow: jest.fn().mockResolvedValue(null)
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(dbServiceMock);

      await expect(service.unfollowUser('pepe', 'juan')).rejects.toThrow(NotFoundError);
    });

    it('should raise a ValidationError if a user wants to unfollow himself', async () => {
      dbServiceMock = {
        getByUsername: jest.fn().mockResolvedValue({ id: 1, username: 'pepe' }),

        getFollow: jest.fn().mockResolvedValue({ createdAt: '2024-09-21T23:29:16.260Z' }),
        deleteFollow: jest.fn().mockResolvedValue(null)
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(dbServiceMock);

      await expect(service.unfollowUser('pepe', 'pepe')).rejects.toThrow(ValidationError);
    });

    it('should raise a NotFoundError if the follow "pepe" -> "juan" does not exist', async () => {
      dbServiceMock = {
        getByUsername: jest
          .fn()
          .mockResolvedValueOnce({ id: 1, username: 'pepe' })
          .mockResolvedValueOnce({ id: 2, username: 'juan' }),

        getFollow: jest.fn().mockResolvedValueOnce(undefined),
        deleteFollow: jest.fn().mockResolvedValue(null)
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(dbServiceMock);
      await expect(service.unfollowUser('pepe', 'juan')).rejects.toThrow(NotFoundError); //.toThrow(NotFoundError);
      expect(dbServiceMock.getFollow).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAllFolowers', () => {
    it('should return all users that user with username "pepe" follows', async () => {
      dbServiceMock = {
        getByUsername: jest.fn().mockResolvedValueOnce({ id: 1, username: 'pepe' }),

        getFollowers: jest
          .fn()
          .mockResolvedValue([
            { follower: { username: 'juan', name: 'juan' }, createdAt: '2024-09-21T23:29:16.260Z' }
          ])
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(dbServiceMock);

      const ret = await service.getAllFollowers('pepe');

      expect(dbServiceMock.getFollowers).toHaveBeenCalledTimes(1);
      expect(ret).toEqual([
        { follower: { username: 'juan', name: 'juan' }, createdAt: '2024-09-21T23:29:16.260Z' }
      ]);
    });

    it('should raise a NotFoundError if a user with the username "pepe" does not exist', async () => {
      dbServiceMock = {
        getByUsername: jest.fn().mockResolvedValueOnce(null),

        getFollowers: jest
          .fn()
          .mockResolvedValue([
            { follower: { username: 'juan', name: 'juan' }, createdAt: '2024-09-21T23:29:16.260Z' }
          ])
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(dbServiceMock);

      await expect(service.getAllFollowers('pepe')).rejects.toThrow(NotFoundError);
    });
  });
});
