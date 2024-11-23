/* eslint-disable @typescript-eslint/no-explicit-any */
import { JwtUserPayload } from 'jwt';
import { GetUsersListParams, Interest, ModifiableUser, User, UserWithPassword } from 'user';
import { UserRegisterRepository } from 'userAuth';
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
  username: 'test',
  phoneNumber: '+541112341234',
  verified: false
};

describe('UserService', () => {
  let service: UserService;
  let mockRepository: jest.Mocked<UserRepository>;

  const username = 'usernameTest';

  const aMockUser: User = {
    id: 1,
    username: username,
    name: 'user',
    email: 'test@email.com',
    lastname: 'test',
    birthdate: new Date(),
    createdAt: new Date(),
    isPrivate: false,
    isBlocked: false,
    phoneNumber: '+541112341234',
    verified: false
  };

  beforeEach(() => {
    mockRepository = {
      getByUsername: jest.fn().mockResolvedValue(aMockUser),
      getFollow: jest.fn().mockResolvedValue(false),
      getFollows: jest.fn().mockResolvedValue(0),
      getAllInterests: jest.fn(),
      getUserInterests: jest.fn(),
      associateInterestsToUser: jest.fn()
    } as unknown as jest.Mocked<UserRepository>;

    service = new UserService(mockRepository);
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
        followed: false,
        isBlocked: undefined
      });
    });

    it('should return a user with reduced attributes if params.reduce is true', async () => {
      const result = await service.getUser(
        authUser.username,
        { ...authUser, type: 'user' },
        { reduce: true }
      );
      expect(result).toEqual({
        ...aMockUser,
        id: NaN,
        userId: aMockUser.id,
        followersCount: undefined,
        following: false,
        followingCount: undefined,
        followed: false
      });
    });

    it('should not return following & followed state if authUser is an admin', async () => {
      const dbServiceMockAux = {
        getByUsername: jest.fn().mockResolvedValue(aMockUser),
        getFollow: jest.fn().mockResolvedValue(true),
        getFollows: jest.fn().mockResolvedValue(0)
      } as unknown as jest.Mocked<UserRepository>;

      const result = await new UserService(dbServiceMockAux).getUser('notEqualUsername', {
        ...authUser,
        type: 'admin'
      } as unknown as JwtUserPayload);

      expect(result).toEqual({
        ...aMockUser,
        email: undefined,
        lastname: undefined,
        isBlocked: undefined
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
        followed: true,
        isBlocked: undefined
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
        followed: false,
        isBlocked: undefined
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
        followed: true,
        isBlocked: undefined
      });
    });

    it('should throw an error if user is not found', async () => {
      mockRepository.getByUsername.mockResolvedValue(null);
      await expect(
        service.getUser('nonExistentUser', { ...authUser, type: 'user' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('followUser', () => {
    it('should create a new follow "pepe" -> "juan"', async () => {
      mockRepository = {
        getByUsername: jest
          .fn()
          .mockResolvedValueOnce({ id: 1, username: 'pepe' })
          .mockResolvedValueOnce({ id: 2, username: 'juan' }),

        createFollow: jest
          .fn()
          .mockResolvedValue({ userId: 1, followedId: 2, createdAt: '2024-09-21T23:29:16.260Z' })
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(mockRepository);

      const ret = await service.followUser('pepe', 'juan');

      expect(ret.follow).toEqual({
        createdAt: '2024-09-21T23:29:16.260Z',
        userId: 1,
        followedId: 2
      });
    });

    it('should raise a NotFoundError if a user with the username "pepe" does not exist', async () => {
      mockRepository = {
        getByUsername: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(null),

        createFollow: jest
          .fn()
          .mockResolvedValue({ userId: 1, followedId: 2, createdAt: '2024-09-21T23:29:16.260Z' })
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(mockRepository);

      await expect(service.followUser('pepe', 'juan')).rejects.toThrow(NotFoundError);
    });

    it('should raise a NotFoundError if a user wants to follow someone with the username "juan" who does not exist', async () => {
      mockRepository = {
        getByUsername: jest
          .fn()
          .mockResolvedValueOnce({ id: 1, username: 'pepe' })
          .mockResolvedValueOnce(null),

        createFollow: jest
          .fn()
          .mockResolvedValue({ userId: 1, followedId: 2, createdAt: '2024-09-21T23:29:16.260Z' })
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(mockRepository);

      await expect(service.followUser('pepe', 'juan')).rejects.toThrow(NotFoundError);
    });

    it('should raise a ValidationError if a user wants to follow himself', async () => {
      mockRepository = {
        getByUsername: jest.fn().mockResolvedValue({ id: 1, username: 'pepe' }),

        createFollow: jest
          .fn()
          .mockResolvedValue({ userId: 1, followedId: 2, createdAt: '2024-09-21T23:29:16.260Z' })
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(mockRepository);

      await expect(service.followUser('pepe', 'pepe')).rejects.toThrow(ValidationError);
    });
  });

  describe('unfollowUser', () => {
    it('should unfollow the user "juan", "pepe" -> "juan"', async () => {
      mockRepository = {
        getByUsername: jest
          .fn()
          .mockResolvedValueOnce({ id: 1, username: 'pepe' })
          .mockResolvedValueOnce({ id: 2, username: 'juan' }),

        getFollow: jest
          .fn()
          .mockResolvedValue({ userId: 1, followedId: 2, createdAt: '2024-09-21T23:29:16.260Z' }),
        deleteFollow: jest.fn().mockResolvedValue(null)
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(mockRepository);

      await service.unfollowUser('pepe', 'juan');

      expect(mockRepository.deleteFollow).toHaveBeenCalledTimes(1);
    });

    it('should raise a NotFoundError if a user with the username "pepe" does not exist', async () => {
      mockRepository = {
        getByUsername: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(null),

        getFollow: jest
          .fn()
          .mockResolvedValue({ userId: 1, followedId: 2, createdAt: '2024-09-21T23:29:16.260Z' }),
        deleteFollow: jest.fn().mockResolvedValue(null)
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(mockRepository);

      await expect(service.unfollowUser('pepe', 'juan')).rejects.toThrow(NotFoundError);
    });

    it('should raise a NotFoundError if a user wants to unfollow someone with the username "juan" who does not exist', async () => {
      mockRepository = {
        getByUsername: jest
          .fn()
          .mockResolvedValueOnce({ id: 1, username: 'pepe' })
          .mockResolvedValueOnce(null),

        getFollow: jest
          .fn()
          .mockResolvedValue({ userId: 1, followedId: 2, createdAt: '2024-09-21T23:29:16.260Z' }),
        deleteFollow: jest.fn().mockResolvedValue(null)
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(mockRepository);

      await expect(service.unfollowUser('pepe', 'juan')).rejects.toThrow(NotFoundError);
    });

    it('should raise a ValidationError if a user wants to unfollow himself', async () => {
      mockRepository = {
        getByUsername: jest.fn().mockResolvedValue({ id: 1, username: 'pepe' }),

        getFollow: jest
          .fn()
          .mockResolvedValue({ userId: 1, followedId: 2, createdAt: '2024-09-21T23:29:16.260Z' }),
        deleteFollow: jest.fn().mockResolvedValue(null)
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(mockRepository);

      await expect(service.unfollowUser('pepe', 'pepe')).rejects.toThrow(ValidationError);
    });

    it('should raise a NotFoundError if the follow "pepe" -> "juan" does not exist', async () => {
      mockRepository = {
        getByUsername: jest
          .fn()
          .mockResolvedValueOnce({ id: 1, username: 'pepe' })
          .mockResolvedValueOnce({ id: 2, username: 'juan' }),

        getFollow: jest.fn().mockResolvedValueOnce(undefined),
        deleteFollow: jest.fn().mockResolvedValue(null)
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(mockRepository);
      await expect(service.unfollowUser('pepe', 'juan')).rejects.toThrow(NotFoundError); //.toThrow(NotFoundError);
      expect(mockRepository.getFollow).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAllFollows', () => {
    it('should return all the users that an user with username "pepe" is following', async () => {
      mockRepository = {
        getByUsername: jest.fn().mockResolvedValueOnce({ id: 1, username: 'pepe' }),

        getFollows: jest
          .fn()
          .mockResolvedValue([
            { id: 2, name: 'juan', username: 'juan', followCreatedAt: '2024-09-21T23:29:16.260Z' }
          ])
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(mockRepository);

      const ret = await service.getAllFollows({ ...authUser, type: 'user' }, 'pepe', {
        byFollowers: false,
        has: ''
      });

      expect(mockRepository.getFollows).toHaveBeenCalledTimes(1);
      expect(ret).toEqual([
        { id: 2, name: 'juan', username: 'juan', followCreatedAt: '2024-09-21T23:29:16.260Z' }
      ]);
    });

    it('should return all the users that follows an user with username "pepe"', async () => {
      mockRepository = {
        getByUsername: jest.fn().mockResolvedValueOnce({ id: 1, username: 'pepe' }),

        getFollows: jest
          .fn()
          .mockResolvedValue([
            { id: 2, name: 'juan', username: 'juan', followCreatedAt: '2024-09-21T23:29:16.260Z' }
          ])
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(mockRepository);

      const ret = await service.getAllFollows({ ...authUser, type: 'user' }, 'pepe', {
        byFollowers: true,
        has: ''
      });

      expect(mockRepository.getFollows).toHaveBeenCalledTimes(1);
      expect(ret).toEqual([
        { id: 2, name: 'juan', username: 'juan', followCreatedAt: '2024-09-21T23:29:16.260Z' }
      ]);
    });

    it('should raise a NotFoundError if a user with the username "pepe" does not exist', async () => {
      mockRepository = {
        getByUsername: jest.fn().mockResolvedValueOnce(null),

        getFollowers: jest
          .fn()
          .mockResolvedValue([
            { id: 2, name: 'juan', username: 'juan', followCreatedAt: '2024-09-21T23:29:16.260Z' }
          ])
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(mockRepository);

      await expect(
        service.getAllFollows({ ...authUser, type: 'user' }, 'pepe', {
          byFollowers: false,
          has: ''
        })
      ).rejects.toThrow(NotFoundError);
    });

    it('should raise a ValidationError if authUser and requested user dont follow each other', async () => {
      mockRepository = {
        getByUsername: jest.fn().mockResolvedValueOnce({ id: 255, username: 'pepe' }),
        getFollow: jest.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(false),
        getFollows: jest
          .fn()
          .mockResolvedValue([
            { id: 2, name: 'juan', username: 'juan', followCreatedAt: '2024-09-21T23:29:16.260Z' }
          ])
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(mockRepository);

      await expect(
        service.getAllFollows({ ...authUser, type: 'user' }, 'pepe', {
          byFollowers: false,
          has: ''
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should not raise a ValidationError if authUser is the requested user', async () => {
      mockRepository = {
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

      service = new UserService(mockRepository);
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
      mockRepository = {
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

      service = new UserService(mockRepository);
      const result = await service.getFollow('pepe', 'juan');

      expect(result).toEqual({ userId: 1, followedId: 2, createdAt: '2024-09-21T23:29:16.260Z' });
    });

    it('should raise a NotFoundError if a user with the username "pepe" does not exist', async () => {
      mockRepository = {
        getByUsername: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(null),

        getFollow: jest
          .fn()
          .mockResolvedValue({ userId: 1, followedId: 2, createdAt: '2024-09-21T23:29:16.260Z' }),
        deleteFollow: jest.fn().mockResolvedValue(null)
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(mockRepository);

      await expect(service.getFollow('pepe', 'juan')).rejects.toThrow(NotFoundError);
    });

    it('should raise a NotFoundError if a user wants to check if follows someone with the username "juan" who does not exist', async () => {
      mockRepository = {
        getByUsername: jest
          .fn()
          .mockResolvedValueOnce({ id: 1, username: 'pepe' })
          .mockResolvedValueOnce(null),

        getFollow: jest
          .fn()
          .mockResolvedValue({ userId: 1, followedId: 2, createdAt: '2024-09-21T23:29:16.260Z' }),
        deleteFollow: jest.fn().mockResolvedValue(null)
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(mockRepository);

      await expect(service.getFollow('pepe', 'juan')).rejects.toThrow(NotFoundError);
    });

    it('should raise a ValidationError if a user wants to check if they are following themselves', async () => {
      mockRepository = {
        getByUsername: jest.fn().mockResolvedValue({ id: 1, username: 'pepe' }),

        getFollow: jest
          .fn()
          .mockResolvedValue({ userId: 1, followedId: 2, createdAt: '2024-09-21T23:29:16.260Z' }),
        deleteFollow: jest.fn().mockResolvedValue(null)
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(mockRepository);

      await expect(service.getFollow('pepe', 'pepe')).rejects.toThrow(ValidationError);
    });

    it('should raise a NotFoundError if the follow "pepe" -> "juan" does not exist', async () => {
      mockRepository = {
        getByUsername: jest
          .fn()
          .mockResolvedValueOnce({ id: 1, username: 'pepe' })
          .mockResolvedValueOnce({ id: 2, username: 'juan' }),

        getFollow: jest.fn().mockResolvedValueOnce(undefined),
        deleteFollow: jest.fn().mockResolvedValue(null)
      } as unknown as jest.Mocked<UserRepository>;

      service = new UserService(mockRepository);
      await expect(service.getFollow('pepe', 'juan')).rejects.toThrow(NotFoundError); //.toThrow(NotFoundError);
      expect(mockRepository.getFollow).toHaveBeenCalledTimes(1);
    });
  });

  describe('modifyUser', () => {
    const mockUser: User = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      name: 'Test',
      lastname: 'User',
      birthdate: new Date('2000-01-01'),
      createdAt: new Date('2024-01-01'),
      isPrivate: false,
      isBlocked: false,
      phoneNumber: '+541112341234',
      verified: false
    };

    it('should modify user successfully', async () => {
      const username = 'testuser';
      const newValues: ModifiableUser = {
        name: 'New Name',
        isPrivate: true,
        isBlocked: false
      };

      mockRepository = {
        getByUsername: jest.fn().mockResolvedValue(mockUser),
        modifyUser: jest.fn().mockResolvedValue({
          ...mockUser,
          name: newValues.name,
          is_private: true,
          is_blocked: false
        })
      } as unknown as jest.Mocked<UserRepository>;

      const userService = new UserService(mockRepository);

      const result = await userService.modifyUser(username, newValues);

      expect(mockRepository.getByUsername).toHaveBeenCalledWith(username);
      expect(mockRepository.modifyUser).toHaveBeenCalledWith(mockUser.id, {
        name: 'New Name',
        is_private: true,
        is_blocked: false
      });
      expect(result.name).toBe(newValues.name);
    });

    it('should throw error for non-existent user', async () => {
      mockRepository = {
        getByUsername: jest.fn().mockResolvedValue(null)
      } as unknown as jest.Mocked<UserRepository>;

      const userService = new UserService(mockRepository);
      await expect(userService.modifyUser('nonexistent', { name: 'New Name' })).rejects.toThrow();
    });
  });

  describe('findByEmailOrUsername', () => {
    const mockUser: User = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      name: 'Test',
      lastname: 'User',
      birthdate: new Date('2000-01-01'),
      createdAt: new Date('2024-01-01'),
      isPrivate: false,
      isBlocked: false,
      phoneNumber: '+541112341234',
      verified: false
    };

    it('should find user by email', async () => {
      const mockUserWithPassword: UserWithPassword = {
        ...mockUser,
        password: 'hashedpassword'
      };

      mockRepository = {
        findByEmailOrUsername: jest.fn().mockResolvedValue(mockUserWithPassword)
      } as unknown as jest.Mocked<UserRepository>;
      const userService = new UserService(mockRepository);
      const result = await userService.findByEmailOrUsername('test@example.com');

      expect(mockRepository.findByEmailOrUsername).toHaveBeenCalledWith('test@example.com');
      expect(result).toEqual(mockUserWithPassword);
    });

    it('should return null for non-existent user', async () => {
      mockRepository = {
        findByEmailOrUsername: jest.fn().mockResolvedValue(null)
      } as unknown as jest.Mocked<UserRepository>;

      const userService = new UserService(mockRepository);
      const result = await userService.findByEmailOrUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getAmount', () => {
    it('should return correct amount', async () => {
      const params: GetUsersListParams = {
        limit: 10,
        offset: 0,
        has: ''
      };

      mockRepository = {
        getAmount: jest.fn().mockResolvedValue(42)
      } as unknown as jest.Mocked<UserRepository>;
      const userService = new UserService(mockRepository);
      const result = await userService.getAmount(params);

      expect(mockRepository.getAmount).toHaveBeenCalledWith(params);
      expect(result).toBe(42);
    });
  });

  describe('getList', () => {
    const mockUser: User = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      name: 'Test',
      lastname: 'User',
      birthdate: new Date('2000-01-01'),
      createdAt: new Date('2024-01-01'),
      isPrivate: false,
      isBlocked: false,
      phoneNumber: '+541112341234',
      verified: false
    };

    it('should return list of users with follow state', async () => {
      const jwtUser: JwtUserPayload = {
        userId: 2,
        username: 'currentuser',
        type: 'user',
        email: 'test@gmail.com',
        phoneNumber: '+541112341234',
        verified: false
      };

      const params: GetUsersListParams = {
        limit: 10,
        offset: 0,
        has: ''
      };

      const mockUsers = [mockUser];
      mockRepository = {
        getList: jest.fn().mockResolvedValue(mockUsers)
      } as unknown as jest.Mocked<UserRepository>;

      const userService = new UserService(mockRepository);

      const addFollowStateSpy = jest
        .spyOn(userService as any, 'addFollowState')
        .mockResolvedValue({ ...mockUser, following: false });

      const result = await userService.getList(jwtUser, params);

      expect(mockRepository.getList).toHaveBeenCalledWith(params);
      expect(addFollowStateSpy).toHaveBeenCalledWith(jwtUser, mockUser);
      expect(result).toHaveLength(1);
      expect(result[0].following).toBeDefined();
    });
  });

  describe('get', () => {
    const mockUser: User = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      name: 'Test',
      lastname: 'User',
      birthdate: new Date('2000-01-01'),
      createdAt: new Date('2024-01-01'),
      isPrivate: false,
      isBlocked: false,
      phoneNumber: '+541112341234',
      verified: false
    };

    it('should return user by id', async () => {
      mockRepository = {
        get: jest.fn().mockResolvedValue(mockUser)
      } as unknown as jest.Mocked<UserRepository>;
      const userService = new UserService(mockRepository);
      const result = await userService.get(1);

      expect(mockRepository.get).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    it('should return null for non-existent id', async () => {
      mockRepository = {
        get: jest.fn().mockResolvedValue(null)
      } as unknown as jest.Mocked<UserRepository>;

      const userService = new UserService(mockRepository);
      const result = await userService.get(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      const userData: UserRegisterRepository = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'hashedpassword',
        name: 'New',
        lastname: 'User',
        birthdate: new Date('2000-01-01'),
        phoneNumber: '+541112341234'
      };

      mockRepository = {
        create: jest.fn().mockResolvedValue({
          ...userData,
          id: 3,
          createdAt: new Date(),
          isPrivate: false,
          isBlocked: false
        })
      } as unknown as jest.Mocked<UserRepository>;

      const userService = new UserService(mockRepository);

      const result = await userService.create(userData);

      expect(mockRepository.create).toHaveBeenCalledWith(userData);
      expect(result.username).toBe(userData.username);
      expect(result.email).toBe(userData.email);
    });
  });

  describe('getAllInterests', () => {
    it('should return all interests', async () => {
      const mockInterests: Interest[] = [
        { id: 1, name: 'Sports', parentId: null },
        { id: 2, name: 'Swimming', parentId: 1 }
      ];
      mockRepository.getAllInterests = jest.fn().mockResolvedValue(mockInterests);
      const service = new UserService(mockRepository);
      const result = await service.getAllInterests();

      expect(mockRepository.getAllInterests).toHaveBeenCalled();
      expect(result).toEqual(mockInterests);
    });
  });

  describe('getUserInterests', () => {
    it('should return user interests', async () => {
      const mockInterests: Interest[] = [
        { id: 1, name: 'Sports', parentId: null },
        { id: 2, name: 'Swimming', parentId: 1 }
      ];
      mockRepository.getUserInterests = jest.fn().mockResolvedValue(mockInterests);
      const result = await service.getUserInterests(1);

      expect(mockRepository.getUserInterests).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockInterests);
    });

    describe('associateInterestsToUser', () => {
      it('should associate interests to a user', async () => {
        const userId = 1;
        const interests = [1, 2];
        mockRepository.getUserInterests = jest.fn().mockResolvedValue([]);
        mockRepository.associateInterestsToUser = jest.fn().mockResolvedValue(true);
        const result = await service.associateInterestsToUser(userId, interests);

        expect(mockRepository.associateInterestsToUser).toHaveBeenCalledWith(userId, interests);
        expect(result).toBe(true);
      });

      it('should throw a ValidationError if the user already has interests', async () => {
        mockRepository.getUserInterests = jest.fn().mockResolvedValue([{ id: 1, name: 'Sports', parentId: null }]);
        await expect(service.associateInterestsToUser(1, [1])).rejects.toThrow(ValidationError);
      });

      it('should handle duplicates in interests', async () => {
        mockRepository.getUserInterests = jest.fn().mockResolvedValue([]);
        mockRepository.associateInterestsToUser = jest.fn().mockResolvedValue(true);
        const result = await service.associateInterestsToUser(1, [1, 1]);
        expect(result).toBe(true);
        expect(mockRepository.associateInterestsToUser).toHaveBeenCalledWith(1, [1]);
      });
    });
  });
});
