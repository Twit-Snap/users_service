/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetAllFollowsParams } from 'follow';
import { Pool } from 'pg';
import { GetUsersListParams } from 'user';
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
      created_at: mockDate,
      updated_at: mockDate
    };

    it('gets users without optional params', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [mockUser, { ...mockUser, id: 2, username: 'test_user2' }]
      });

      const params: GetUsersListParams = {
        has: 'test'
      };

      const result = await userRepository.getList(params);

      expect(mockPool.query.mock.calls[0][1]).toMatchSnapshot('query params');
      expect(mockPool.query.mock.calls[0][0]).toMatchSnapshot('sql query');
      expect(result).toMatchSnapshot('result');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('gets users with createdAt param', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [mockUser]
      });

      const params: GetUsersListParams = {
        has: 'test',
        createdAt: '2024-01-01'
      };

      const result = await userRepository.getList(params);

      expect(mockPool.query.mock.calls[0][1]).toMatchSnapshot('query params');
      expect(mockPool.query.mock.calls[0][0]).toMatchSnapshot('sql query');
      expect(result).toMatchSnapshot('result');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('gets users with limit param', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [mockUser]
      });

      const params: GetUsersListParams = {
        has: 'test',
        limit: 1
      };

      const result = await userRepository.getList(params);

      expect(mockPool.query.mock.calls[0][1]).toMatchSnapshot('query params');
      expect(mockPool.query.mock.calls[0][0]).toMatchSnapshot('sql query');
      expect(result).toMatchSnapshot('result');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('gets users with all params', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [mockUser]
      });

      const params: GetUsersListParams = {
        has: 'test',
        createdAt: '2024-01-01',
        limit: 1
      };

      const result = await userRepository.getList(params);

      expect(mockPool.query.mock.calls[0][1]).toMatchSnapshot('query params');
      expect(mockPool.query.mock.calls[0][0]).toMatchSnapshot('sql query');
      expect(result).toMatchSnapshot('result');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('handles empty result', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const params: GetUsersListParams = {
        has: 'nonexistent'
      };

      const result = await userRepository.getList(params);

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

      const params: GetUsersListParams = {
        has: 'test'
      };

      await expect(userRepository.getList(params)).rejects.toThrow(dbError);
      expect(mockPool.query.mock.calls[0][1]).toMatchSnapshot('query params');
      expect(mockPool.query.mock.calls[0][0]).toMatchSnapshot('sql query');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
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
        password: 'password123'
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
        ssoProviderId: 'google.com'
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
        password: 'password123'
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
        password: 'password123'
      };

      try {
        await userRepository.create(userData);
      } catch (error) {
        expect(error).toBeInstanceOf(EntityAlreadyExistsError);
        expect((error as EntityAlreadyExistsError).message).toBe('Email already exists');
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
        ssoProviderId: 'google.com'
      };

      try {
        await userRepository.create(userData);
      } catch (error) {
        expect(error).toBeInstanceOf(EntityAlreadyExistsError);
        expect((error as EntityAlreadyExistsError).message).toBe('SSOUid already exists');
      }
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
  });

  describe('deleteFollow', () => {
    it('should delete a follow successfully', async () => {
      mockPool.query.mockResolvedValueOnce({ rowCount: 1 });

      await expect(userRepository.deleteFollow(1, 2)).resolves.toBeUndefined();
      const [query, params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, params);
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
});
