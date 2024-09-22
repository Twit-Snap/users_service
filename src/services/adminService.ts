import { adminRepository, userRepository } from '../repositories/';
import {Admin, AdminInfoDto, LoginAdminDto} from "admin";
import {InvalidCredentialsError} from "../types/customAdminErros";

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
        return await userRepository.get(id);
    }

    private validate_password(admin: AdminInfoDto, adminData: LoginAdminDto) {
        if (admin.password !== adminData.password) {
            throw new InvalidCredentialsError("Invalid password");
        }
    }
}