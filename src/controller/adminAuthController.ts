import { AdminAuthService } from '../services/adminAtuhService';
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
    this.verifyEmailStructure(req);
    const adminDTO: AdminWithPassword = req.body;
    const admin = await this.adminService.createAdmin(adminDTO);

    return { data: admin };
  }

  async loginAdmin(req: Request) {
    this.verifyLoginCredentials(req);
    this.verifyEmailStructure(req);

    const { email, username, password } = req.body;
    const emailOrUsername = email || username;

    const admin = await this.adminService.loginAdmin(emailOrUsername, password);

    return { data: admin };
  }

  private verifyLoginCredentials(req: Request) {
    if (!req.body.password) {
      throw new ValidationError('password', 'Password is required','INVALID PASSWORD');
    }

    if (!req.body.email && !req.body.username) {
      throw new ValidationError('email or username', 'Email or username are required','INVALID EMAIL OR USERNAME');
    }
  }

  private verifyEmailStructure(req: Request) {
    const email = req.body.email;
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new ValidationError('email', 'Invalid email','INVALID EMAIL');
      }
    }
  }

  private verifyCreateCredentials(req: Request) {
    if (!req.body.email || !req.body.username || !req.body.password) {
      throw new ValidationError('email, username, password', 'All fields are required','INVALID CREDENTIALS');
    }
  }
}
