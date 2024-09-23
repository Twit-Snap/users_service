import { AdminAuthService } from '../services/adminAtuhService';
import { Request } from 'express';
import { ValidationError } from '../types/customAdminErros';
import { AdminInfoDto } from '../types/admin';

export class AdminAuthController {
  private adminService: AdminAuthService;

  constructor() {
    this.adminService = new AdminAuthService();
  }

  async createAdmin(req: Request) {
    const fields = ['username', 'email', 'password'];
    this.checkEmptyCredential(req, fields);
    this.checkValidEmail(req);
    const adminDTO: AdminInfoDto = req.body;
    const admin = await this.adminService.createAdmin(adminDTO);

    return { data: admin };
  }

  async loginAdmin(req: Request) {
    const fields = ['email', 'password'];

    this.checkEmptyCredential(req, fields);
    this.checkValidEmail(req);

    const { email, password } = req.body;
    const admin = await this.adminService.loginAdmin({ email, password });

    return { data: admin };
  }

  private checkEmptyCredential(req: Request, fields: string[]) {
    const isEmpty = fields.some((field) => !req.body[field]);
    if (isEmpty) {
      throw new ValidationError(fields.join(', '), `The fields ${fields.join(', ')} are required.`);
    }
  }

  private checkValidEmail(req: Request) {
    const email = req.body.email;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('email', 'Invalid email');
    }
  }
}
