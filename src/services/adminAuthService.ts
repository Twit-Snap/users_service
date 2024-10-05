import { adminRepository } from '../repositories/';
import { Admin, AdminWithPassword, AdminWithToken } from 'admin';
import { JWTService } from './jwtService';
import { IJWTService } from 'jwt';
import { AuthenticationError } from '../types/customErrors';
import bcrypt from 'bcrypt';
import { AdminRepository } from '../repositories/adminRepository';

export class AdminAuthService {
  private jwtService: IJWTService;
  private adminRepository: AdminRepository;

  constructor(repository?: AdminRepository,jwtService?: IJWTService) {
    this.jwtService = jwtService ?? new JWTService();
    this.adminRepository = repository ?? adminRepository;
  }

  async createAdmin(adminData: AdminWithPassword): Promise<Admin> {
    const hashedPassword = await this.encodePassword(adminData);
    const newAdmin = await this.adminRepository.create({
      ...adminData,
      password: hashedPassword
    });

    return newAdmin;
  }

  private async encodePassword(adminData: Admin & { password: string }) {
    const saltRounds = 10;
    return await bcrypt.hash(adminData.password, saltRounds);
  }

  async loginAdmin(emailOrUsername: string, password: string): Promise<AdminWithToken> {
    const admin = await this.adminRepository.findByEmailOrUsername(emailOrUsername);
    if (!admin) throw new AuthenticationError();

    await this.veryfyPassword(password, admin);

    const token = this.jwtService.sign({
      type: 'admin',
      email: admin.email,
      username: admin.username
    });

    // Attach token to user object (assuming we want to return it)
    const userWithToken = { ...admin, token, password: undefined };

    return userWithToken;
  }

  private async veryfyPassword(password: string, admin: AdminWithPassword) {
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) throw new AuthenticationError();

  }
}