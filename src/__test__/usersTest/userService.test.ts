import { User } from 'user';
import { UserRepository } from '../../repositories/user/userRepository';
import { UserService } from '../../services/userService';
import { NotFoundError, ValidationError } from '../../types/customErrors';

jest.mock('../../repositories/user/userRepository');
jest.mock('../../services/jwtService');
jest.mock('bcrypt');
jest.mock('axios'); // Mock axios for external HTTP calls

const authUser = {
  email: 'test@test.com',
  userId: 1,
  username: 'test'
};

describe('UserService', () => {
  let service: UserService;
  let dbServiceMock: jest.Mocked<UserRepository>;

  const username = 'usernameTest';

  const aMockUser: User = {
    id: 1,
    username: username,
    name: 'user',
    email: 'test@email.com',
    lastname: 'test',
    birthdate: new Date(),
    createdAt: new Date(),
    isPrivate: false
  };

  beforeEach(() => {
    dbServiceMock = {
      getByUsername: jest.fn().mockResolvedValue(aMockUser),
      getFollow: jest.fn().mockResolvedValue(false),
      getFollows: jest.fn().mockResolvedValue(0)
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

  describe('getUser', () => {
    it('should return a user with private attributes if username is equal to authUser.username', async () => {
      const result = await service.getUser(authUser.username, { ...authUser, type: 'user' });
      expect(result).toEqual({
        ...aMockUser,
        followersCount: undefined,
        following: false,
        followingCount: undefined,
        followed: false
      });
    });

    it('should return a user with public attributes if username is non equal to authUser.username', async () => {
      const result = await service.getUser('notEqualUsername', { ...authUser, type: 'user' });
      expect(result).toEqual({
        ...aMockUser,
        email: undefined,
        lastname: undefined,
        followersCount: undefined,
        following: false,
        followingCount: undefined,
        followed: false
      });
    });

    it('should return following & followed equal to true if both users follows', async () => {
      const dbServiceMockAux = {
        getByUsername: jest.fn().mockResolvedValue(aMockUser),
        getFollow: jest.fn().mockResolvedValue(true),
        getFollows: jest.fn().mockResolvedValue(0)
      } as unknown as jest.Mocked<UserRepository>;

      const result = await new UserService(dbServiceMockAux).getUser('notEqualUsername', {
        ...authUser,
        type: 'user'
      });
      expect(result).toEqual({
        ...aMockUser,
        email: undefined,
        lastname: undefined,
        followersCount: undefined,
        following: true,
        followingCount: undefined,
        followed: true
      });
    });

    it('should return following equal to true if authUser is following the requested user', async () => {
      const dbServiceMockAux = {
        getByUsername: jest.fn().mockResolvedValue(aMockUser),
        getFollow: jest.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false),
        getFollows: jest.fn().mockResolvedValue(0)
      } as unknown as jest.Mocked<UserRepository>;

      const result = await new UserService(dbServiceMockAux).getUser('notEqualUsername', {
        ...authUser,
        type: 'user'
      });
      expect(result).toEqual({
        ...aMockUser,
        email: undefined,
        lastname: undefined,
        followersCount: undefined,
        following: true,
        followingCount: undefined,
        followed: false
      });
    });

    it('should return followed equal to true if authUser is followed by the requested user', async () => {
      const dbServiceMockAux = {
        getByUsername: jest.fn().mockResolvedValue(aMockUser),
        getFollow: jest.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true),
        getFollows: jest.fn().mockResolvedValue(0)
      } as unknown as jest.Mocked<UserRepository>;

      const result = await new UserService(dbServiceMockAux).getUser('notEqualUsername', {
        ...authUser,
        type: 'user'
      });
      expect(result).toEqual({
        ...aMockUser,
        email: undefined,
        lastname: undefined,
        followersCount: undefined,
        following: false,
        followingCount: undefined,
        followed: true
      });
    });

    it('should throw an error if user is not found', async () => {
      dbServiceMock.getByUsername.mockResolvedValue(null);
      await expect(
        service.getUser('nonExistentUser', { ...authUser, type: 'user' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('followUser', () => {
    it('should create a new follow "pepe" -> "juan"', async () => {
      dbServiceMock = {
        getByUsername: jest
          .fn()
          .mockResolvedValueOnce({ id: 1, username: 'pepe' })
          .mockResolvedValueOnce({ id: 2, username: 'juan' }),

        createFollow: jest
          .fn()
          .mockResolvedValue({ userId: 1, followedId: 2, createdAt: '2024-09-21T23:29:16.260Z' })
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(dbServiceMock);

      const ret = await service.followUser('pepe', 'juan');

      expect(ret).toEqual({
        createdAt: '2024-09-21T23:29:16.260Z',
        userId: 1,
        followedId: 2
      });
    });

    it('should raise a NotFoundError if a user with the username "pepe" does not exist', async () => {
      dbServiceMock = {
        getByUsername: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(null),

        createFollow: jest
          .fn()
          .mockResolvedValue({ userId: 1, followedId: 2, createdAt: '2024-09-21T23:29:16.260Z' })
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

        createFollow: jest
          .fn()
          .mockResolvedValue({ userId: 1, followedId: 2, createdAt: '2024-09-21T23:29:16.260Z' })
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(dbServiceMock);

      await expect(service.followUser('pepe', 'juan')).rejects.toThrow(NotFoundError);
    });

    it('should raise a ValidationError if a user wants to follow himself', async () => {
      dbServiceMock = {
        getByUsername: jest.fn().mockResolvedValue({ id: 1, username: 'pepe' }),

        createFollow: jest
          .fn()
          .mockResolvedValue({ userId: 1, followedId: 2, createdAt: '2024-09-21T23:29:16.260Z' })
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

        getFollow: jest
          .fn()
          .mockResolvedValue({ userId: 1, followedId: 2, createdAt: '2024-09-21T23:29:16.260Z' }),
        deleteFollow: jest.fn().mockResolvedValue(null)
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(dbServiceMock);

      await service.unfollowUser('pepe', 'juan');

      expect(dbServiceMock.deleteFollow).toHaveBeenCalledTimes(1);
    });

    it('should raise a NotFoundError if a user with the username "pepe" does not exist', async () => {
      dbServiceMock = {
        getByUsername: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(null),

        getFollow: jest
          .fn()
          .mockResolvedValue({ userId: 1, followedId: 2, createdAt: '2024-09-21T23:29:16.260Z' }),
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

        getFollow: jest
          .fn()
          .mockResolvedValue({ userId: 1, followedId: 2, createdAt: '2024-09-21T23:29:16.260Z' }),
        deleteFollow: jest.fn().mockResolvedValue(null)
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(dbServiceMock);

      await expect(service.unfollowUser('pepe', 'juan')).rejects.toThrow(NotFoundError);
    });

    it('should raise a ValidationError if a user wants to unfollow himself', async () => {
      dbServiceMock = {
        getByUsername: jest.fn().mockResolvedValue({ id: 1, username: 'pepe' }),

        getFollow: jest
          .fn()
          .mockResolvedValue({ userId: 1, followedId: 2, createdAt: '2024-09-21T23:29:16.260Z' }),
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

  describe('getAllFollows', () => {
    it('should return all the users that an user with username "pepe" is following', async () => {
      dbServiceMock = {
        getByUsername: jest.fn().mockResolvedValueOnce({ id: 1, username: 'pepe' }),

        getFollows: jest
          .fn()
          .mockResolvedValue([
            { id: 2, name: 'juan', username: 'juan', followCreatedAt: '2024-09-21T23:29:16.260Z' }
          ])
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(dbServiceMock);

      const ret = await service.getAllFollows({ ...authUser, type: 'user' }, 'pepe', {
        byFollowers: false,
        has: ''
      });

      expect(dbServiceMock.getFollows).toHaveBeenCalledTimes(1);
      expect(ret).toEqual([
        { id: 2, name: 'juan', username: 'juan', followCreatedAt: '2024-09-21T23:29:16.260Z' }
      ]);
    });

    it('should return all the users that follows an user with username "pepe"', async () => {
      dbServiceMock = {
        getByUsername: jest.fn().mockResolvedValueOnce({ id: 1, username: 'pepe' }),

        getFollows: jest
          .fn()
          .mockResolvedValue([
            { id: 2, name: 'juan', username: 'juan', followCreatedAt: '2024-09-21T23:29:16.260Z' }
          ])
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(dbServiceMock);

      const ret = await service.getAllFollows({ ...authUser, type: 'user' }, 'pepe', {
        byFollowers: true,
        has: ''
      });

      expect(dbServiceMock.getFollows).toHaveBeenCalledTimes(1);
      expect(ret).toEqual([
        { id: 2, name: 'juan', username: 'juan', followCreatedAt: '2024-09-21T23:29:16.260Z' }
      ]);
    });

    it('should raise a NotFoundError if a user with the username "pepe" does not exist', async () => {
      dbServiceMock = {
        getByUsername: jest.fn().mockResolvedValueOnce(null),

        getFollowers: jest
          .fn()
          .mockResolvedValue([
            { id: 2, name: 'juan', username: 'juan', followCreatedAt: '2024-09-21T23:29:16.260Z' }
          ])
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(dbServiceMock);

      await expect(
        service.getAllFollows({ ...authUser, type: 'user' }, 'pepe', {
          byFollowers: false,
          has: ''
        })
      ).rejects.toThrow(NotFoundError);
    });

    it('should raise a ValidationError if authUser and requested user dont follow each other', async () => {
      dbServiceMock = {
        getByUsername: jest.fn().mockResolvedValueOnce({ id: 255, username: 'pepe' }),
        getFollow: jest.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(false),
        getFollows: jest
          .fn()
          .mockResolvedValue([
            { id: 2, name: 'juan', username: 'juan', followCreatedAt: '2024-09-21T23:29:16.260Z' }
          ])
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(dbServiceMock);

      await expect(
        service.getAllFollows({ ...authUser, type: 'user' }, 'pepe', {
          byFollowers: false,
          has: ''
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should not raise a ValidationError if authUser is the requested user', async () => {
      dbServiceMock = {
        getByUsername: jest
          .fn()
          .mockResolvedValueOnce({ id: authUser.userId, username: authUser.username }),
        getFollow: jest.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(false),
        getFollows: jest
          .fn()
          .mockResolvedValue([
            { id: 2, name: 'juan', username: 'juan', followCreatedAt: '2024-09-21T23:29:16.260Z' }
          ])
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(dbServiceMock);
      const response = await service.getAllFollows({ ...authUser, type: 'user' }, 'pepe', {
        byFollowers: false,
        has: ''
      });

      expect(response).toEqual([
        { id: 2, name: 'juan', username: 'juan', followCreatedAt: '2024-09-21T23:29:16.260Z' }
      ]);
    });
  });

  describe('getFollow', () => {
    it('should return the follow "pepe" -> "juan"', async () => {
      dbServiceMock = {
        getByUsername: jest
          .fn()
          .mockResolvedValueOnce({ id: 1, username: 'pepe' })
          .mockResolvedValueOnce({ id: 2, username: 'juan' }),

        getFollow: jest.fn().mockResolvedValueOnce({
          userId: 1,
          followedId: 2,
          createdAt: '2024-09-21T23:29:16.260Z'
        })
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(dbServiceMock);
      const result = await service.getFollow('pepe', 'juan');

      expect(result).toEqual({ userId: 1, followedId: 2, createdAt: '2024-09-21T23:29:16.260Z' });
    });

    it('should raise a NotFoundError if a user with the username "pepe" does not exist', async () => {
      dbServiceMock = {
        getByUsername: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(null),

        getFollow: jest
          .fn()
          .mockResolvedValue({ userId: 1, followedId: 2, createdAt: '2024-09-21T23:29:16.260Z' }),
        deleteFollow: jest.fn().mockResolvedValue(null)
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(dbServiceMock);

      await expect(service.getFollow('pepe', 'juan')).rejects.toThrow(NotFoundError);
    });

    it('should raise a NotFoundError if a user wants to check if follows someone with the username "juan" who does not exist', async () => {
      dbServiceMock = {
        getByUsername: jest
          .fn()
          .mockResolvedValueOnce({ id: 1, username: 'pepe' })
          .mockResolvedValueOnce(null),

        getFollow: jest
          .fn()
          .mockResolvedValue({ userId: 1, followedId: 2, createdAt: '2024-09-21T23:29:16.260Z' }),
        deleteFollow: jest.fn().mockResolvedValue(null)
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(dbServiceMock);

      await expect(service.getFollow('pepe', 'juan')).rejects.toThrow(NotFoundError);
    });

    it('should raise a ValidationError if a user wants to check if they are following themselves', async () => {
      dbServiceMock = {
        getByUsername: jest.fn().mockResolvedValue({ id: 1, username: 'pepe' }),

        getFollow: jest
          .fn()
          .mockResolvedValue({ userId: 1, followedId: 2, createdAt: '2024-09-21T23:29:16.260Z' }),
        deleteFollow: jest.fn().mockResolvedValue(null)
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(dbServiceMock);

      await expect(service.getFollow('pepe', 'pepe')).rejects.toThrow(ValidationError);
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
      await expect(service.getFollow('pepe', 'juan')).rejects.toThrow(NotFoundError); //.toThrow(NotFoundError);
      expect(dbServiceMock.getFollow).toHaveBeenCalledTimes(1);
    });
  });
});
