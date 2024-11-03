import { Pool } from 'pg';
import { AdminWithPassword } from '../../types/admin';
import { EntityAlreadyExistsError } from '../../types/customErrors';
import { AdminRepository } from './adminRepository';

function interpolateQuery(query: string, params: any[]): string {
  return query.replace(/\$\d+/g, (match) => {
    const index = parseInt(match.substr(1)) - 1;
    const value = params[index];
    return typeof value === 'string' ? `'${value}'` : value;
  });
}

describe('AdminRepository', () => {
  let adminRepository: AdminRepository;
  let mockPool: {
    query: jest.Mock;
  };

  beforeEach(() => {
    mockPool = {
      query: jest.fn()
    };
    adminRepository = new AdminRepository(mockPool as unknown as Pool);
  });

  describe('create', () => {
    const mockAdminData: AdminWithPassword = {
      username: 'testadmin',
      email: 'admin@test.com',
      password: 'hashedpassword123'
    };

    it('should create an admin successfully', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [
          {
            username: mockAdminData.username,
            email: mockAdminData.email
          }
        ]
      });

      const result = await adminRepository.create(mockAdminData);

      expect(mockPool.query.mock.calls[0]).toMatchSnapshot('create query and params');
      expect(result).toMatchSnapshot('created admin result');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('should throw EntityAlreadyExistsError for duplicate username', async () => {
      const mockError = {
        code: '23505',
        constraint: 'admins_pkey'
      };

      mockPool.query.mockRejectedValueOnce(mockError);

      await expect(adminRepository.create(mockAdminData)).rejects.toThrow(EntityAlreadyExistsError);

      expect(mockPool.query.mock.calls[0]).toMatchSnapshot('duplicate username query and params');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('should throw EntityAlreadyExistsError for duplicate email', async () => {
      const mockError = {
        code: '23505',
        constraint: 'admins_email_key'
      };

      mockPool.query.mockRejectedValueOnce(mockError);

      await expect(adminRepository.create(mockAdminData)).rejects.toThrow(EntityAlreadyExistsError);

      expect(mockPool.query.mock.calls[0]).toMatchSnapshot('duplicate email query and params');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('should propagate unknown database errors', async () => {
      const mockError = new Error('Database connection failed');

      mockPool.query.mockRejectedValueOnce(mockError);

      await expect(adminRepository.create(mockAdminData)).rejects.toThrow(mockError);

      expect(mockPool.query.mock.calls[0]).toMatchSnapshot('failed query and params');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });
  });

  describe('findByEmailOrUsername', () => {
    const mockAdmin: AdminWithPassword = {
      username: 'testadmin',
      email: 'admin@test.com',
      password: 'hashedpassword123'
    };

    it('should find admin by email', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [mockAdmin]
      });

      const result = await adminRepository.findByEmailOrUsername('admin@test.com');

      expect(mockPool.query.mock.calls[0]).toMatchSnapshot('find by email query and params');
      expect(result).toMatchSnapshot('found admin by email result');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('should find admin by username', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [mockAdmin]
      });

      const result = await adminRepository.findByEmailOrUsername('testadmin');

      expect(mockPool.query.mock.calls[0]).toMatchSnapshot('find by username query and params');
      expect(result).toMatchSnapshot('found admin by username result');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('should return null when admin not found', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: []
      });

      const result = await adminRepository.findByEmailOrUsername('nonexistent');

      expect(mockPool.query.mock.calls[0]).toMatchSnapshot('not found query and params');
      expect(result).toMatchSnapshot('not found result');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });

    it('should handle database error', async () => {
      const mockError = new Error('Database connection failed');

      mockPool.query.mockRejectedValueOnce(mockError);

      await expect(adminRepository.findByEmailOrUsername('testadmin')).rejects.toThrow(mockError);

      expect(mockPool.query.mock.calls[0]).toMatchSnapshot('error query and params');
      const [query, param] = mockPool.query.mock.calls[0];
      const interpolatedQuery = interpolateQuery(query, param);
      expect(interpolatedQuery).toMatchSnapshot('Interpolated SQL query');
    });
  });
});
