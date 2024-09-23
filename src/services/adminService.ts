import { adminRepository, userRepository } from '../repositories/';
import {Admin, AdminInfoDto, LoginAdminDto, adminWithToken} from "admin";
import {InvalidCredentialsError, AdminNotFoundError} from "../types/customAdminErros";
import {IUserRepository, User} from "user";
import { JWTService } from './jwtService';
import {IJWTService} from "jwt";

export class AdminService{
    private jwtService: IJWTService;

    constructor(jwtService?: IJWTService) {
        this.jwtService = jwtService ?? new JWTService();
    }

    async createAdmin(adminData: AdminInfoDto): Promise<adminWithToken> {
        const admin = await adminRepository.create(adminData);

        // Generate JWT token
        const token = this.jwtService.sign({
            type: 'admin',
            email: admin.email,
            username: admin.username,
        });

        // Attach token to user object (assuming we want to return it)
        const userWithToken = { ...admin, token, password: undefined };

        return userWithToken;

    }
    async loginAdmin(adminData: LoginAdminDto): Promise<adminWithToken> {

        const admin = await adminRepository.getAdminByEmail(adminData.email);
        this.validate_password(admin, adminData);

        const token = this.jwtService.sign({
            type: 'admin',
            email: admin.email,
            username: admin.username,
        });

        // Attach token to user object (assuming we want to return it)
        const userWithToken = { ...admin, token, password: undefined };

        return userWithToken;
    }

  async getUserList(): Promise<Admin[] | null> {
    return await userRepository.getList();
  }

  async getUserById(id: number): Promise<Admin | null> {
    const user = await userRepository.get(id);
    const invalid_id = id.toString();
    this.validate_id(user, invalid_id);
    return user;
  }

  private validate_id(user: User | null, invalid_id: string) {
    if (!user) {
      throw new AdminNotFoundError(invalid_id);
    }
  }

  private validate_password(admin: AdminInfoDto, adminData: LoginAdminDto) {
    if (admin.password !== adminData.password) {
      throw new InvalidCredentialsError('Invalid password');
    }
  }
}
