import { AdminService } from '../services/adminService';
import { ValidationError } from '../types/customErrors';


export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  async getUserList() {
    const admin = await this.adminService.getUserList();
    return { data: admin };
  }

  async getUserByUsername(username: string) {
    this.validateUsername(username);
    const admin = await this.adminService.getUserByUsername(username);
    return { data: admin };
  }

  private validateUsername(username: string) {
    if (!username) throw new ValidationError(username,'Username is required','EMPTY USERNAME');
  }
}
