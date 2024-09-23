import { AdminService } from '../services/adminService';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  async getUserList() {
    const admin = await this.adminService.getUserList();
    return { data: admin };
  }

  async getUserById(id: string) {
    const id_num = parseInt(id);
    const admin = await this.adminService.getUserById(id_num);
    return { data: admin };
  }
}
