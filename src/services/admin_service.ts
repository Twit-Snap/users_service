import { AdminRepository } from '../repositories/adminRepository';
import {Admin, CreateAdminDto} from "admin";
import {NextFunction} from "express";

class AdminService{
    private adminRepository: AdminRepository;

    constructor(adminRepository: AdminRepository){
        this.adminRepository = adminRepository;
    }

    async createAdmin(adminData: CreateAdminDto): Promise<Admin> {
        return await this.adminRepository.create(adminData);

    }
}