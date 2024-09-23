import { adminRepository } from '../repositories/';
import { Admin, AdminWithPassword, AdminWithToken } from 'admin';
import { JWTService } from './jwtService';
import { IJWTService } from 'jwt';
import { AuthenticationError } from 'customErrors';
import bcrypt from 'bcrypt';

export class AdminAuthService {
  private jwtService: IJWTService;

  constructor(jwtService?: IJWTService) {
    this.jwtService = jwtService ?? new JWTService();
  }

  async createAdmin(adminData: AdminWithPassword): Promise<Admin> {
    const hashedPassword = await this.encodePassword(adminData);
    const newAdmin = await adminRepository.create({
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
    const admin = await adminRepository.findByEmailOrUsername(emailOrUsername);
    if (!admin) throw new AuthenticationError();

    this.veryfyPassword(password, admin);

    const token = this.jwtService.sign({
      type: 'admin',
      email: admin.email,
      username: admin.username
    });

    // Attach token to user object (assuming we want to return it)
    const userWithToken = { ...admin, token, password: undefined };

    return userWithToken;
  }

  private veryfyPassword(password: string, admin: AdminWithPassword) {
    const isPasswordValid = bcrypt.compare(password, admin.password);

    if (!isPasswordValid) throw new AuthenticationError();

  }
}
