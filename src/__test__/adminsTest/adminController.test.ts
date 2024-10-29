import * as httpMocks from 'node-mocks-http';
import { AdminController } from '../../controllers/adminController';
import { AdminService } from '../../services/adminService';

jest.mock('../../services/adminService');

describe('AdminController', () => {
  let controller: AdminController;

  beforeAll(() => {
    controller = new AdminController();
  });

  it('should get user list successfully', async () => {
    const users = [{ username: 'admin1', email: 'admin1@example.com' }];
    (AdminService.prototype.getUserList as jest.Mock).mockResolvedValue(users);
    const has: string = '';
    const response = await controller.getUserList({ has: has });

    expect(response).toEqual({ data: users });
  });

  it('should get user by username successfully', async () => {
    const aUser = { username: 'admin1', email: 'admin1@example.com' };
    (AdminService.prototype.getUserByUsername as jest.Mock).mockResolvedValue(aUser);

    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/admins/users/admin1',
      params: { username: 'admin1' }
    });

    const response = await controller.getUserByUsername(req.params.username);
    expect(response).toEqual({ data: aUser });
  });
});
