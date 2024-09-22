import { adminRepository } from '../repositories/';
import {Admin, CreateAdminDto} from "admin";

export class AdminService{

    async createAdmin(adminData: CreateAdminDto): Promise<Admin> {
        return await adminRepository.create(adminData);
    }

}