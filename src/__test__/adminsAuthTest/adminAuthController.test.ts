
import * as httpMocks from 'node-mocks-http';
import { AdminAuthController } from '../../controller/adminAuthController';
import { AdminAuthService } from '../../services/adminAuthService';
import { ValidationError } from '../../types/customErrors';


jest.mock('../../services/adminAuthService');

describe('AdminAuthController', () => {
  let controller: AdminAuthController;

  beforeAll(() => {
    controller = new AdminAuthController();
  });

  describe('CreateAdmin', () => {

    it('should create an admin successfully', async () => {
      const adminData = { username: 'admin1', email: 'admin1@example.com' };
      (AdminAuthService.prototype.createAdmin as jest.Mock).mockResolvedValue(adminData);

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/admin/register',
        body: {
          username: 'admin1',
          email: 'admin1@example.com',
          password: 'securepassword',
        },
      });

      const response = await controller.createAdmin(req);

      expect(response).toEqual({ data: adminData });
      expect(AdminAuthService.prototype.createAdmin).toHaveBeenCalledWith(req.body);
    });

    it('create an admin should throw an error if username is empty', async () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/admin/register',
        body: {
          username: '',
          email: 'admin1@example.com',
          password: 'securepassword',
        },
      });

      await expect(controller.createAdmin(req)).rejects.toThrow(ValidationError);
    });

    it('create an admin should throw an error if username is empty', async () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/admin/register',
        body: {
          username: 'admin1',
          email: '',
          password: 'securepassword',
        },
      });

      await expect(controller.createAdmin(req)).rejects.toThrow(ValidationError);
    });

    it('create an admin should throw an error if password is empty', async () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/admin/register',
        body: {
          username: 'admin1',
          email: 'admin1@example.com',
          password: '',
        },
      });

      await expect(controller.createAdmin(req)).rejects.toThrow(ValidationError);
    });

    it('create an admin should throw an error if email is invalid', async () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/admin/register/',
        body: {
          username: 'admin1',
          email: 'admin1example.com',
          password: 'securepassword',
        },
      });

      await expect(controller.createAdmin(req)).rejects.toThrow(ValidationError);
    });
    });


    describe('LoginAdmin', () => {

      it('should login an admin successfully with username and password', async () => {

        const mockAdminWithToken = {
          username: 'admin1',
          email: 'admin1@example.com',
          token: 'mocked-jwt-token',
          password: undefined,
        };
        (AdminAuthService.prototype.loginAdmin as jest.Mock).mockResolvedValue(mockAdminWithToken);

        const reqLogin = httpMocks.createRequest({
          method: 'POST',
          url: '/admin/login',
          body: {
            emailOrUsername: 'admin1',
            password: 'securepassword',
          },
        });

        const response = await controller.loginAdmin(reqLogin);
        expect(response).toEqual({ data: mockAdminWithToken });
        expect(AdminAuthService.prototype.loginAdmin).toHaveBeenCalledWith('admin1', 'securepassword');
      });

      it('should login an admin successfully with email and password', async () => {

        const mockAdminWithToken = {
          username: 'admin1',
          email: 'admin1@example.com',
          token: 'mocked-jwt-token',
          password: undefined,
        };
        (AdminAuthService.prototype.loginAdmin as jest.Mock).mockResolvedValue(mockAdminWithToken);

        const reqLogin = httpMocks.createRequest({
          method: 'POST',
          url: '/admin/login',
          body: {
            emailOrUsername: 'admin1@example.com',
            password: 'securepassword',
          },
        });

        const response = await controller.loginAdmin(reqLogin);
        expect(response).toEqual({ data: mockAdminWithToken });
        expect(AdminAuthService.prototype.loginAdmin).toHaveBeenCalledWith('admin1@example.com', 'securepassword');
      });

      it('login should throw an error if emailOrUsername is empty', async () => {
        const req = httpMocks.createRequest({
          method: 'POST',
          url: '/admin/login',
          body: {
            emailOrUsername: '',
            password: 'securepassword',
          },
        });

        await expect(controller.loginAdmin(req)).rejects.toThrow(ValidationError);
      });

      it('login should throw an error if password is empty', async () => {
        const req = httpMocks.createRequest({
          method: 'POST',
          url: '/admin/login',
          body: {
            emailOrUsername: 'admin1',
            password: '',
          },
        });

        await expect(controller.loginAdmin(req)).rejects.toThrow(ValidationError);
      });

      it('login should throw an error if emailOrUsername is invalid', async () => {
        const req = httpMocks.createRequest({
          method: 'POST',
          url: '/admin/login',
          body: {
            emailOrUsername: 'admin1@example',
            password: 'securepassword',
          },
        });

        await expect(controller.loginAdmin(req)).rejects.toThrow(ValidationError);
      });
    });
  });