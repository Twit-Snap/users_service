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
});
