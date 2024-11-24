/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetAllFollowsParams } from 'follow';
import { Pool } from 'pg';
import { GetUsersListParams, ModifiableUser } from 'user';
import { UserRegisterRepository } from 'userAuth';
import { EntityAlreadyExistsError } from '../../types/customErrors';
import { UserRepository } from './userRepository';

function interpolateQuery(query: string, params: any[]): string {
  return query.replace(/\$\d+/g, (match) => {
    const index = parseInt(match.substr(1)) - 1;
    const value = params[index];
    return typeof value === 'string' ? `'${value}'` : value;
  });
}

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let mockPool: {
    query: jest.Mock;
  };

  beforeEach(() => {
    mockPool = {
      query: jest.fn()
    };
    userRepository = new UserRepository(mockPool as unknown as Pool);
  });

  describe('findByEmailOrUsername', () => {
    it('should find user by email or username', async () => {
      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
      mockPool.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await userRepository.findByEmailOrUsername('testuser');
      expect(result).toMatchSnapshot('User result');
      expect(mockPool.query.mock.calls[0]).toMatchSnapshot('SQL query');
      const [query, params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, params);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('should return null when user not found', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await userRepository.findByEmailOrUsername('nonexistent');
      expect(result).toMatchSnapshot('User result');
      expect(mockPool.query.mock.calls[0]).toMatchSnapshot('SQL query');
      const [query, params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, params);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });
  });

  describe('getList', () => {
    const mockDate = new Date('2024-01-01');
    const mockUser = {
      id: 1,
      username: 'test_user',
      name: 'Test User',
      email: 'test@example.com',
      created_at: mockDate,
      updated_at: mockDate
    };

    it('gets users without optional params', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [mockUser, { ...mockUser, id: 2, username: 'test_user2' }]
      });

      const params: GetUsersListParams = {
        has: 'test',
        offset: 0
      };

      const result = await userRepository.getList(params);

      expect(mockPool.query.mock.calls[0][1]).toMatchSnapshot('query params');
      expect(mockPool.query.mock.calls[0][0]).toMatchSnapshot('sql query');
      expect(result).toMatchSnapshot('result');
      const [query, _params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, _params);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('gets users with createdAt param and equalDate true', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [mockUser]
      });

      const params: GetUsersListParams = {
        has: 'test',
        createdAt: '2024-01-01',
        equalDate: true,
        offset: 0
      };

      const result = await userRepository.getList(params);

      expect(mockPool.query.mock.calls[0][1]).toMatchSnapshot('query params');
      expect(mockPool.query.mock.calls[0][0]).toMatchSnapshot('sql query');
      expect(result).toMatchSnapshot('result');
      const [query, _params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, _params);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('gets users with createdAt param and equalDate false', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [mockUser]
      });

      const params: GetUsersListParams = {
        has: 'test',
        createdAt: '2024-01-01',
        equalDate: false,
        offset: 0
      };

      const result = await userRepository.getList(params);

      expect(mockPool.query.mock.calls[0][1]).toMatchSnapshot('query params');
      expect(mockPool.query.mock.calls[0][0]).toMatchSnapshot('sql query');
      expect(result).toMatchSnapshot('result');
      const [query, _params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, _params);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('gets users with pagination params', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [mockUser]
      });

      const params: GetUsersListParams = {
        has: 'test',
        limit: 10,
        offset: 0
      };

      const result = await userRepository.getList(params);

      expect(mockPool.query.mock.calls[0][1]).toMatchSnapshot('query params');
      expect(mockPool.query.mock.calls[0][0]).toMatchSnapshot('sql query');
      expect(result).toMatchSnapshot('result');
      const [query, _params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, _params);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('gets users with all params', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [mockUser]
      });

      const params: GetUsersListParams = {
        has: 'test',
        createdAt: '2024-01-01',
        equalDate: true,
        limit: 10,
        offset: 0
      };

      const result = await userRepository.getList(params);

      expect(mockPool.query.mock.calls[0][1]).toMatchSnapshot('query params');
      expect(mockPool.query.mock.calls[0][0]).toMatchSnapshot('sql query');
      expect(result).toMatchSnapshot('result');
      const [query, _params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, _params);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });
  });

  describe('get', () => {
    it('should get user by id', async () => {
      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
      mockPool.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await userRepository.get(1);
      expect(result).toMatchSnapshot('User result');
      expect(mockPool.query.mock.calls[0]).toMatchSnapshot('SQL query');
      const [query, params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, params);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('should return null when user not found', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await userRepository.get(999);
      expect(result).toMatchSnapshot('User result');
      expect(mockPool.query.mock.calls[0]).toMatchSnapshot('SQL query');
      const [query, params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, params);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const mockUser = { id: 1, username: 'newuser', email: 'new@example.com' };
      mockPool.query.mockResolvedValueOnce({ rows: [mockUser] });

      const userData: UserRegisterRepository = {
        username: 'newuser',
        email: 'new@example.com',
        name: 'New',
        lastname: 'User',
        birthdate: new Date('2000-01-01'),
        password: 'password123',
        phoneNumber: '+541112341234'
      };

      const result = await userRepository.create(userData);
      expect(result).toMatchSnapshot('Created user result');
      expect(mockPool.query.mock.calls[0]).toMatchSnapshot('SQL query');
      const [query, params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, params);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('should create a new SSO user', async () => {
      const mockUser = { id: 1, username: 'newuser', email: 'new@example.com' };
      mockPool.query.mockResolvedValueOnce({ rows: [mockUser] });

      const userData: UserRegisterRepository = {
        username: 'newuser',
        email: 'new@example.com',
        name: 'New',
        lastname: 'User',
        birthdate: new Date('2000-01-01'),
        profilePicture: 'https://example.com/picture.jpg',
        ssoUid: 'sso123oiebf8q782783',
        ssoProviderId: 'google.com',
        phoneNumber: '+541112341234'
      };
      const result = await userRepository.create(userData);
      expect(result).toMatchSnapshot('Created user result');
      expect(mockPool.query.mock.calls[0]).toMatchSnapshot('SQL query');
      const [query, params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, params);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('should throw EntityAlreadyExistsError for duplicate username', async () => {
      const error = new Error('duplicate key value violates unique constraint');
      (error as any).code = '23505';
      (error as any).constraint = 'username_unique';
      mockPool.query.mockRejectedValueOnce(error);

      const userData: UserRegisterRepository = {
        username: 'existinguser',
        email: 'new@example.com',
        name: 'New',
        lastname: 'User',
        birthdate: new Date('2000-01-01'),
        password: 'password123',
        phoneNumber: '+541112341234'
      };

      try {
        await userRepository.create(userData);
      } catch (error) {
        expect(error).toBeInstanceOf(EntityAlreadyExistsError);
        expect((error as EntityAlreadyExistsError).message).toBe('Username already exists');
      }
    });

    it('should throw EntityAlreadyExistsError for duplicate email', async () => {
      const error = new Error('duplicate key value violates unique constraint');
      (error as any).code = '23505';
      (error as any).constraint = 'email_unique';
      mockPool.query.mockRejectedValueOnce(error);

      const userData: UserRegisterRepository = {
        username: 'newuser',
        email: 'existing@example.com',
        name: 'New',
        lastname: 'User',
        birthdate: new Date('2000-01-01'),
        password: 'password123',
        phoneNumber: '+541112341234'
      };

      try {
        await userRepository.create(userData);
      } catch (error) {
        expect(error).toBeInstanceOf(EntityAlreadyExistsError);
        expect((error as EntityAlreadyExistsError).message).toBe('Email already exists');
      }
    });

    it('should throw EntityAlreadyExistsError for duplicate phone number', async () => {
      const error = new Error('duplicate key value violates unique constraint');
      (error as any).code = '23505';
      (error as any).constraint = 'phone_number_unique';
      mockPool.query.mockRejectedValueOnce(error);

      const userData: UserRegisterRepository = {
        username: 'newuser',
        email: 'existing@example.com',
        name: 'New',
        lastname: 'User',
        birthdate: new Date('2000-01-01'),
        password: 'password123',
        phoneNumber: '+541112341234'
      };

      try {
        await userRepository.create(userData);
      } catch (error) {
        expect(error).toBeInstanceOf(EntityAlreadyExistsError);
        expect((error as EntityAlreadyExistsError).message).toBe('phoneNumber already exists');
      }
    });

    it('should throw EntityAlreadyExistsError for duplicate SSO UID', async () => {
      const error = new Error('duplicate key value violates unique constraint');
      (error as any).code = '23505';
      (error as any).constraint = 'sso_uid_unique';
      mockPool.query.mockRejectedValueOnce(error);

      const userData: UserRegisterRepository = {
        username: 'newuser',
        email: 'newEmail@mail.com',
        name: 'New',
        lastname: 'User',
        birthdate: new Date('2000-01-01'),
        ssoUid: 'existing_sso_uid',
        ssoProviderId: 'google.com',
        phoneNumber: '+541112341234'
      };

      try {
        await userRepository.create(userData);
      } catch (error) {
        expect(error).toBeInstanceOf(EntityAlreadyExistsError);
        expect((error as EntityAlreadyExistsError).message).toBe('SSOUid already exists');
      }
    });

    it('handles database error', async () => {
      const dbError = new Error('Database error');
      mockPool.query.mockRejectedValueOnce(dbError);

      await expect(
        userRepository.create({
          username: 'testuser',
          email: 'test@example.com',
          name: 'Test',
          lastname: 'User',
          birthdate: new Date('2000-01-01'),
          phoneNumber: '+541112341234'
        })
      ).rejects.toThrow(dbError);
      expect(mockPool.query.mock.calls[0][1]).toMatchSnapshot('query params');
      expect(mockPool.query.mock.calls[0][0]).toMatchSnapshot('sql query');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });
  });

  describe('getByUsername', () => {
    it('should get user by username', async () => {
      const mockUser = { username: 'testuser', email: 'test@example.com' };
      mockPool.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await userRepository.getByUsername('testuser');
      expect(result).toMatchSnapshot('User result');
      expect(mockPool.query.mock.calls[0]).toMatchSnapshot('SQL query');
      const [query, params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, params);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('should get reduced user by username', async () => {
      const mockUser = { userId: 1, username: 'testuser' };
      mockPool.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await userRepository.getByUsername('testuser', { reduce: true });
      expect(result).toMatchSnapshot('User result');
      expect(mockPool.query.mock.calls[0]).toMatchSnapshot('SQL query');
      const [query, params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, params);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('should return null when user not found', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await userRepository.getByUsername('nonexistent');
      expect(result).toMatchSnapshot('User result');
      expect(mockPool.query.mock.calls[0]).toMatchSnapshot('SQL query');
      const [query, params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, params);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });
  });

  describe('createFollow', () => {
    it('should create a follow successfully', async () => {
      const mockResult = {
        rows: [
          {
            userId: 1,
            followedId: 2,
            createdAt: new Date('2023-01-01T00:00:00Z')
          }
        ]
      };
      mockPool.query.mockResolvedValueOnce(mockResult);

      const result = await userRepository.createFollow(1, 2);
      expect(result).toMatchSnapshot();
      const [query, params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, params);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('should throw EntityAlreadyExistsError when follow already exists', async () => {
      const mockError = { code: '23505', constraint: 'unique_follow' };
      mockPool.query.mockRejectedValueOnce(mockError);

      await expect(userRepository.createFollow(1, 2)).rejects.toThrowErrorMatchingSnapshot();
      const [query, params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, params);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('handles database error', async () => {
      const dbError = new Error('Database error');
      mockPool.query.mockRejectedValueOnce(dbError);

      await expect(userRepository.createFollow(1, 2)).rejects.toThrow(dbError);
      expect(mockPool.query.mock.calls[0][1]).toMatchSnapshot('query params');
      expect(mockPool.query.mock.calls[0][0]).toMatchSnapshot('sql query');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });
  });

  describe('deleteFollow', () => {
    it('should delete a follow successfully', async () => {
      mockPool.query.mockResolvedValueOnce({ rowCount: 1 });

      await expect(userRepository.deleteFollow(1, 2)).resolves.toBeUndefined();
      const [query, params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, params);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('handles database error', async () => {
      const dbError = new Error('Database error');
      mockPool.query.mockRejectedValueOnce(dbError);

      await expect(userRepository.deleteFollow(1, 2)).rejects.toThrow(dbError);
      expect(mockPool.query.mock.calls[0][1]).toMatchSnapshot('query params');
      expect(mockPool.query.mock.calls[0][0]).toMatchSnapshot('sql query');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });
  });

  describe('getFollow', () => {
    it('should get a follow successfully', async () => {
      const mockResult = {
        rows: [
          {
            userId: 1,
            followedId: 2,
            createdAt: new Date('2023-01-01T00:00:00Z')
          }
        ]
      };
      mockPool.query.mockResolvedValueOnce(mockResult);

      const result = await userRepository.getFollow(1, 2);
      expect(result).toMatchSnapshot();
      const [query, params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, params);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('should return undefined when follow does not exist', async () => {
      const mockResult = { rows: [] };
      mockPool.query.mockResolvedValueOnce(mockResult);

      const result = await userRepository.getFollow(1, 2);
      expect(result).toBeUndefined();
      const [query, params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, params);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('handles database error', async () => {
      const dbError = new Error('Database error');
      mockPool.query.mockRejectedValueOnce(dbError);

      await expect(userRepository.getFollow(1, 2)).rejects.toThrow(dbError);
      expect(mockPool.query.mock.calls[0][1]).toMatchSnapshot('query params');
      expect(mockPool.query.mock.calls[0][0]).toMatchSnapshot('sql query');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });
  });

  describe('getFollows', () => {
    const userId = 1;
    const mockDate = new Date('2024-01-01');

    it('gets followers without optional params', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [
          { id: 2, username: 'test_user1', name: 'Test User 1', followCreatedAt: mockDate },
          { id: 3, username: 'test_user2', name: 'Test User 2', followCreatedAt: mockDate }
        ]
      });

      const params: GetAllFollowsParams = {
        byFollowers: true,
        has: 'test'
      };

      const result = await userRepository.getFollows(userId, params);

      expect(mockPool.query.mock.calls[0][1]).toMatchSnapshot('query params');
      expect(mockPool.query.mock.calls[0][0]).toMatchSnapshot('sql query');
      expect(result).toMatchSnapshot('result');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('gets following without optional params', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [
          { id: 4, username: 'test_user3', name: 'Test User 3', followCreatedAt: mockDate },
          { id: 5, username: 'test_user4', name: 'Test User 4', followCreatedAt: mockDate }
        ]
      });

      const params: GetAllFollowsParams = {
        byFollowers: false,
        has: 'test'
      };

      const result = await userRepository.getFollows(userId, params);

      expect(mockPool.query.mock.calls[0][1]).toMatchSnapshot('query params');
      expect(mockPool.query.mock.calls[0][0]).toMatchSnapshot('sql query');
      expect(result).toMatchSnapshot('result');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('gets followers with createdAt param', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 2, username: 'test_user1', name: 'Test User 1', followCreatedAt: mockDate }]
      });

      const params: GetAllFollowsParams = {
        byFollowers: true,
        has: 'test',
        createdAt: '2024-01-01'
      };

      const result = await userRepository.getFollows(userId, params);

      expect(mockPool.query.mock.calls[0][1]).toMatchSnapshot('query params');
      expect(mockPool.query.mock.calls[0][0]).toMatchSnapshot('sql query');
      expect(result).toMatchSnapshot('result');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('gets followers with limit param', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 2, username: 'test_user1', name: 'Test User 1', followCreatedAt: mockDate }]
      });

      const params: GetAllFollowsParams = {
        byFollowers: true,
        has: 'test',
        limit: 1
      };

      const result = await userRepository.getFollows(userId, params);

      expect(mockPool.query.mock.calls[0][1]).toMatchSnapshot('query params');
      expect(mockPool.query.mock.calls[0][0]).toMatchSnapshot('sql query');
      expect(result).toMatchSnapshot('result');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('gets followers with all params', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 2, username: 'test_user1', name: 'Test User 1', followCreatedAt: mockDate }]
      });

      const params: GetAllFollowsParams = {
        byFollowers: true,
        has: 'test',
        createdAt: '2024-01-01',
        limit: 1
      };

      const result = await userRepository.getFollows(userId, params);

      expect(mockPool.query.mock.calls[0][1]).toMatchSnapshot('query params');
      expect(mockPool.query.mock.calls[0][0]).toMatchSnapshot('sql query');
      expect(result).toMatchSnapshot('result');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('handles empty result', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const params: GetAllFollowsParams = {
        byFollowers: true,
        has: 'nonexistent'
      };

      const result = await userRepository.getFollows(userId, params);

      expect(mockPool.query.mock.calls[0][1]).toMatchSnapshot('query params');
      expect(mockPool.query.mock.calls[0][0]).toMatchSnapshot('sql query');
      expect(result).toMatchSnapshot('result');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('handles database error', async () => {
      const dbError = new Error('Database error');
      mockPool.query.mockRejectedValueOnce(dbError);

      const params: GetAllFollowsParams = {
        byFollowers: true,
        has: 'test'
      };

      await expect(userRepository.getFollows(userId, params)).rejects.toThrow(dbError);
      expect(mockPool.query.mock.calls[0][1]).toMatchSnapshot('query params');
      expect(mockPool.query.mock.calls[0][0]).toMatchSnapshot('sql query');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });
  });

  describe('modifyUser', () => {
    const mockDate = new Date('2024-01-01');
    const mockUser = {
      id: 1,
      username: 'test_user',
      name: 'Test User',
      email: 'test@example.com',
      created_at: mockDate,
      updated_at: mockDate
    };

    it('updates single field successfully', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [{ ...mockUser, name: 'Updated Name' }]
      });

      const modifiedUser: ModifiableUser = {
        name: 'Updated Name'
      };

      const result = await userRepository.modifyUser(1, modifiedUser);

      expect(mockPool.query.mock.calls[0][1]).toMatchSnapshot('query params');
      expect(mockPool.query.mock.calls[0][0]).toMatchSnapshot('sql query');
      expect(result).toMatchSnapshot('result');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('updates multiple fields successfully', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [{ ...mockUser, name: 'Updated Name', email: 'new@example.com' }]
      });

      const modifiedUser: ModifiableUser = {
        name: 'Updated Name',
        email: 'new@example.com'
      };

      const result = await userRepository.modifyUser(1, modifiedUser);

      expect(mockPool.query.mock.calls[0][1]).toMatchSnapshot('query params');
      expect(mockPool.query.mock.calls[0][0]).toMatchSnapshot('sql query');
      expect(result).toMatchSnapshot('result');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('throws EntityAlreadyExistsError for duplicate username', async () => {
      mockPool.query.mockRejectedValueOnce({
        code: '23505',
        constraint: 'users_username_key'
      });

      const modifiedUser: ModifiableUser = {
        username: 'existing_username'
      };

      await expect(userRepository.modifyUser(1, modifiedUser)).rejects.toThrow(
        EntityAlreadyExistsError
      );

      expect(mockPool.query.mock.calls[0][1]).toMatchSnapshot('query params');
      expect(mockPool.query.mock.calls[0][0]).toMatchSnapshot('sql query');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('throws EntityAlreadyExistsError for duplicate email', async () => {
      mockPool.query.mockRejectedValueOnce({
        code: '23505',
        constraint: 'users_email_key'
      });

      const modifiedUser: ModifiableUser = {
        email: 'existing@example.com'
      };

      await expect(userRepository.modifyUser(1, modifiedUser)).rejects.toThrow(
        EntityAlreadyExistsError
      );

      expect(mockPool.query.mock.calls[0][1]).toMatchSnapshot('query params');
      expect(mockPool.query.mock.calls[0][0]).toMatchSnapshot('sql query');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('throws original error for non-constraint violations', async () => {
      const originalError = new Error('Database error');
      mockPool.query.mockRejectedValueOnce(originalError);

      const modifiedUser: ModifiableUser = {
        name: 'Updated Name'
      };

      await expect(userRepository.modifyUser(1, modifiedUser)).rejects.toThrow(originalError);

      expect(mockPool.query.mock.calls[0][1]).toMatchSnapshot('query params');
      expect(mockPool.query.mock.calls[0][0]).toMatchSnapshot('sql query');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });
  });

  describe('findBySSOuid', () => {
    it('should find user by SSO UID', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            name: 'Test',
            lastname: 'User',
            birthdate: new Date('2000-01-01'),
            createdAt: new Date('2024-01-01'),
            isPrivate: false,
            isBlocked: false,
            profilePicture: 'profile.jpg',
            backgroundPicture: 'background.jpg',
            ssoUid: 'sso123',
            providerId: 'provider123'
          }
        ]
      });

      const result = await userRepository.findBySSOuid('sso123');

      expect(mockPool.query.mock.calls[0]).toMatchSnapshot('query and params');
      expect(result).toMatchSnapshot('result');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('should return null when user not found', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: []
      });

      const result = await userRepository.findBySSOuid('nonexistent');

      expect(mockPool.query.mock.calls[0]).toMatchSnapshot('query and params');
      expect(result).toMatchSnapshot('result');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });
  });

  describe('getAmount', () => {
    it('should get total amount without date filter', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [{ count: '42' }]
      });

      const params: GetUsersListParams = {
        has: 'test',
        offset: 0
      };

      const result = await userRepository.getAmount(params);

      expect(mockPool.query.mock.calls[0]).toMatchSnapshot('query and params');
      expect(result).toMatchSnapshot('result');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('should get amount with createdAt and equalDate true', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [{ count: '10' }]
      });

      const params: GetUsersListParams = {
        has: 'test',
        createdAt: '2024-01-01',
        equalDate: true,
        offset: 0
      };

      const result = await userRepository.getAmount(params);

      expect(mockPool.query.mock.calls[0]).toMatchSnapshot('query and params');
      expect(result).toMatchSnapshot('result');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('should get amount with createdAt and equalDate false', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [{ count: '20' }]
      });

      const params: GetUsersListParams = {
        has: 'test',
        createdAt: '2024-01-01',
        equalDate: false,
        offset: 0
      };

      const result = await userRepository.getAmount(params);

      expect(mockPool.query.mock.calls[0]).toMatchSnapshot('query and params');
      expect(result).toMatchSnapshot('result');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('should handle zero results', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [{ count: '0' }]
      });

      const params: GetUsersListParams = {
        has: 'test',
        createdAt: '2024-01-01',
        offset: 0
      };

      const result = await userRepository.getAmount(params);

      expect(mockPool.query.mock.calls[0]).toMatchSnapshot('query and params');
      expect(result).toMatchSnapshot('result');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('should handle database error', async () => {
      const mockError = new Error('Database connection failed');
      mockPool.query.mockRejectedValueOnce(mockError);

      const params: GetUsersListParams = {
        has: 'test',
        offset: 0
      };

      await expect(userRepository.getAmount(params)).rejects.toThrow(mockError);
      expect(mockPool.query.mock.calls[0]).toMatchSnapshot('query and params');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });
  });

  describe('putExpoToken', () => {
    it('should update user expo token successfully', async () => {
      // Arrange
      const userId = 1;
      const expoToken = 'test-expo-token';
      mockPool.query.mockResolvedValueOnce({ rowCount: 1 });

      // Act
      await userRepository.putExpoToken(userId, expoToken);

      // Assert
      expect(mockPool.query).toMatchSnapshot();
      expect(mockPool.query).toHaveBeenCalledTimes(1);
      expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE users'), [
        userId,
        expoToken
      ]);
    });

    it('should throw error when database query fails', async () => {
      // Arrange
      const userId = 1;
      const expoToken = 'test-expo-token';
      const testError = new Error('Database error');
      mockPool.query.mockRejectedValueOnce(testError);

      // Act & Assert
      await expect(userRepository.putExpoToken(userId, expoToken)).rejects.toThrow(testError);

      expect(mockPool.query).toMatchSnapshot();
    });

    it('should handle empty expo token', async () => {
      // Arrange
      const userId = 1;
      const expoToken = '';
      mockPool.query.mockResolvedValueOnce({ rowCount: 1 });

      // Act
      await userRepository.putExpoToken(userId, expoToken);

      // Assert
      expect(mockPool.query).toMatchSnapshot();
      expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE users'), [
        userId,
        expoToken
      ]);
    });

    it('should handle null user ID', async () => {
      // Arrange
      const userId = null;
      const expoToken = 'test-expo-token';
      const mockError = new Error('User id must be in the database');
      mockPool.query.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(userRepository.putExpoToken(userId as any, expoToken)).rejects.toThrow();

      expect(mockPool.query).toMatchSnapshot();
    });
  });

  describe('getAllExpoTokens', () => {
    it('should fetch all expo tokens except sender', async () => {
      // Mock data
      const mockRows = [
        { expoToken: 'ExponentPushToken[xxx1]' },
        { expoToken: 'ExponentPushToken[xxx2]' },
        { expoToken: 'ExponentPushToken[xxx3]' }
      ];

      // Mock the query response
      mockPool.query.mockResolvedValueOnce({ rows: mockRows });

      // Execute the function
      const result = await userRepository.getAllExpoTokens(1);

      // Verify the query was called with correct parameters
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT expo_token AS "expoToken"'),
        [1]
      );

      // Verify the result matches the snapshot
      expect(result).toMatchSnapshot();
      const [query, params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, params);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('should return empty array when no tokens found', async () => {
      // Mock empty response
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      // Execute the function
      const result = await userRepository.getAllExpoTokens(1);

      // Verify the query was called with correct parameters
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT expo_token AS "expoToken"'),
        [1]
      );

      // Verify the result matches the snapshot
      expect(result).toMatchSnapshot();
      const [query, params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, params);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('should handle database error', async () => {
      // Mock database error
      const error = new Error('Database error');
      mockPool.query.mockRejectedValueOnce(error);

      // Execute and verify error is thrown
      await expect(userRepository.getAllExpoTokens(1)).rejects.toThrow('Database error');
      expect(mockPool.query).toHaveBeenCalledTimes(1);
      const [query, params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, params);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });
  });

  describe('updateLocation', () => {
    const testUsername = 'testuser';
    const testLocation = {
      latitude: 40.7128,
      longitude: -74.006
    };

    it('should update user location successfully', async () => {
      // Mock successful query execution
      (mockPool.query as jest.Mock).mockResolvedValueOnce({
        rowCount: 1
      });

      await userRepository.updateLocation(testUsername, testLocation);

      // Verify query was called with correct parameters
      expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), [
        testLocation.latitude,
        testLocation.longitude,
        testUsername
      ]);

      // Snapshot of the query call
      expect(mockPool.query).toMatchSnapshot();
      const [query, params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, params);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('should handle database errors', async () => {
      // Mock database error
      const dbError = new Error('Database connection failed');
      (mockPool.query as jest.Mock).mockRejectedValueOnce(dbError);

      await expect(userRepository.updateLocation(testUsername, testLocation)).rejects.toThrow(
        'Database connection failed'
      );

      // Snapshot of the error case
      expect(mockPool.query).toMatchSnapshot();
      const [query, params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, params);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('should handle invalid coordinates', async () => {
      const error = new Error('Database error');
      mockPool.query.mockRejectedValueOnce(error);

      const invalidLocation = {
        latitude: 91, // Invalid latitude (> 90)
        longitude: -74.006
      };

      await expect(userRepository.updateLocation(testUsername, invalidLocation)).rejects.toThrow();

      // Snapshot of validation error
      expect(mockPool.query).toMatchSnapshot();
      const [query, params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, params);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('should handle empty username', async () => {
      const error = new Error('Database error');
      mockPool.query.mockRejectedValueOnce(error);

      await expect(userRepository.updateLocation('', testLocation)).rejects.toThrow();

      // Snapshot of validation error
      expect(mockPool.query).toMatchSnapshot();
      const [query, params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, params);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });
  });

  describe('getAllInterests', () => {
    it('should return all interests', async () => {
      const mockInterests = [
        { id: 1, name: 'Sports', parentId: null },
        { id: 2, name: 'Soccer', parentId: 1 }
      ];
      mockPool.query.mockResolvedValueOnce({ rows: mockInterests });

      const result = await userRepository.getAllInterests();
      expect(result).toEqual(mockInterests);
      expect(mockPool.query.mock.calls[0]).toMatchSnapshot();
    });
  });

  describe('getUserInterests', () => {
    it('should return interests for a user', async () => {
      const mockInterests = [
        { id: 1, name: 'Sports', parentId: null, emoji: '🏃‍♂️' },
        { id: 2, name: 'Soccer', parentId: 1, emoji: '⚽' }
      ];
      mockPool.query.mockResolvedValueOnce({ rows: mockInterests });

      const result = await userRepository.getUserInterests(1);
      expect(result).toEqual(mockInterests);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT i.id, i.name, i.parent_id AS "parentId", i.emoji'),
        [1]
      );
    });

    it('should return an empty array when user has no interests', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await userRepository.getUserInterests(1);
      expect(result).toEqual([]);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT i.id, i.name, i.parent_id AS "parentId", i.emoji'),
        [1]
      );
    });

    it('should handle database error', async () => {
      const dbError = new Error('Database error');
      mockPool.query.mockRejectedValueOnce(dbError);

      await expect(userRepository.getUserInterests(1)).rejects.toThrow(dbError);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT i.id, i.name, i.parent_id AS "parentId", i.emoji'),
        [1]
      );
    });
  });

  describe('associateInterestsToUser', () => {
    it('should associate interests to a user', async () => {
      const userId = 1;
      const interests = [1, 2, 3];
      mockPool.query.mockResolvedValueOnce({ rowCount: interests.length });

      const result = await userRepository.associateInterestsToUser(userId, interests);
      expect(result).toBe(true);
      const [query, params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, params);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });
  });
});
