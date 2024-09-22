import { adminRepository, userRepository } from '../repositories/';
import {Admin, AdminInfoDto, LoginAdminDto} from "admin";
import {InvalidCredentialsError, AdminNotFoundError} from "../types/customAdminErros";
import {User} from "user";

export class AdminService{

    async createAdmin(adminData: AdminInfoDto): Promise<Admin> {
        return await adminRepository.create(adminData);
    }
    async loginAdmin(adminData: LoginAdminDto): Promise<Admin> {

        const admin = await adminRepository.getAdminByEmail(adminData.email);
        this.validate_password(admin, adminData);

        const { username, email } = admin;
        return { username, email };
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
            throw new AdminNotFoundError(invalid_id)
        }
    }

    private validate_password(admin: AdminInfoDto, adminData: LoginAdminDto) {
        if (admin.password !== adminData.password) {
            throw new InvalidCredentialsError("Invalid password");
        }
    }
}