/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pool } from 'pg';
import { UserRegisterDto } from 'userAuth';
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
    it('should get list of users', async () => {
      const mockUsers = [
        { id: 1, username: 'user1', email: 'user1@example.com' },
        { id: 2, username: 'user2', email: 'user2@example.com' }
      ];
      mockPool.query.mockResolvedValueOnce({ rows: mockUsers });

      const result = await userRepository.getList();
      expect(result).toMatchSnapshot('Users list result');
      expect(mockPool.query.mock.calls[0]).toMatchSnapshot('SQL query');
      const [query, params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, params);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('should return null when no users found', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await userRepository.getList();
      expect(result).toMatchSnapshot('Users list result');
      expect(mockPool.query.mock.calls[0]).toMatchSnapshot('SQL query');
      const [query, params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, params);
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

      const userData: UserRegisterDto = {
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

    it('should throw EntityAlreadyExistsError for duplicate username', async () => {
      const error = new Error('duplicate key value violates unique constraint');
      (error as any).code = '23505';
      (error as any).constraint = 'username_unique';
      mockPool.query.mockRejectedValueOnce(error);

      const userData: UserRegisterDto = {
        username: 'existinguser',
        email: 'new@example.com',
        name: 'New',
        lastname: 'User',
        birthdate: new Date('2000-01-01'),
        password: 'password123'
      };

      await expect(userRepository.create(userData)).rejects.toThrowError(EntityAlreadyExistsError);
      expect(mockPool.query.mock.calls[0]).toMatchSnapshot('SQL query');
      const [query, params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, params);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('should throw EntityAlreadyExistsError for duplicate email', async () => {
      const error = new Error('duplicate key value violates unique constraint');
      (error as any).code = '23505';
      (error as any).constraint = 'email_unique';
      mockPool.query.mockRejectedValueOnce(error);

      const userData: UserRegisterDto = {
        username: 'newuser',
        email: 'existing@example.com',
        name: 'New',
        lastname: 'User',
        birthdate: new Date('2000-01-01'),
        password: 'password123'
      };

      await expect(userRepository.create(userData)).rejects.toThrowError(EntityAlreadyExistsError);
      expect(mockPool.query.mock.calls[0]).toMatchSnapshot('SQL query');
      const [query, params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, params);
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

  describe('getFollowers', () => {
    it('should get followers successfully', async () => {
      const mockResult = {
        rows: [
          {
            id: 2,
            username: 'user1',
            name: 'User One',
            followCreatedAt: new Date('2023-01-01T00:00:00Z')
          },
          {
            id: 3,
            username: 'user2',
            name: 'User Two',
            followCreatedAt: new Date('2023-01-02T00:00:00Z')
          }
        ]
      };
      mockPool.query.mockResolvedValueOnce(mockResult);

      const result = await userRepository.getFollowers(1);
      expect(result).toMatchSnapshot();
      const [query, params] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, params);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });
  });
});
