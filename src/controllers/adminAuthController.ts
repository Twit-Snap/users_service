import { AdminAuthService } from '../services/adminAuthService';
import { Request } from 'express';
import { ValidationError } from '../types/customErrors';
import { AdminWithPassword } from '../types/admin';

export class AdminAuthController {
  private adminService: AdminAuthService;

  constructor() {
    this.adminService = new AdminAuthService();
  }

  async createAdmin(req: Request) {
    this.verifyCreateCredentials(req);
    const adminDTO: AdminWithPassword = req.body;
    this.verifyEmailStructure(adminDTO.email);
    const admin = await this.adminService.createAdmin(adminDTO);

    return { data: admin };
  }

  async loginAdmin(req: Request) {
    this.verifyLoginCredentials(req);

    const { emailOrUsername, password } = req.body;
    this.verfiyEmailOrUsername(emailOrUsername);

    const admin = await this.adminService.loginAdmin(emailOrUsername, password);

    return { data: admin };
  }

  private verifyLoginCredentials(req: Request) {
    if (!req.body.password) {
      throw new ValidationError('password', 'Password is required', 'INVALID PASSWORD');
    }

    if (!req.body.emailOrUsername) {
      throw new ValidationError(
        'email/username',
        'Email/username is required',
        'INVALID EMAIL/USERNAME'
      );
    }
  }

  private verfiyEmailOrUsername(emailOrUsername: string) {
    if (emailOrUsername.includes('@')) {
      this.verifyEmailStructure(emailOrUsername);
    }
  }

  private verifyEmailStructure(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('email', 'Invalid email', 'INVALID EMAIL');
    }
  }

  private verifyCreateCredentials(req: Request) {
    if (!req.body.email || !req.body.username || !req.body.password) {
      throw new ValidationError(
        'email, username, password',
        'All fields are required',
        'INVALID CREDENTIALS'
      );
    }
  }
}
