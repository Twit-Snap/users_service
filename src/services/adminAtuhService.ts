import { adminRepository } from '../repositories/';
import {AdminInfoDto, LoginAdminDto, adminWithToken} from "admin";
import {InvalidCredentialsError} from "../types/customAdminErros";
import { JWTService } from './jwtService';
import {IJWTService} from "jwt";

export class AdminAuthService {
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

    private validate_password(admin: AdminInfoDto, adminData: LoginAdminDto) {
        if (admin.password !== adminData.password) {
            throw new InvalidCredentialsError("Invalid password");
        }
    }
}