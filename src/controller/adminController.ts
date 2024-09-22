import { AdminService } from '../services/adminService';
import {Request} from 'express';
import {ValidationError} from "../types/customAdminErros";


export class AdminController {
    private adminService: AdminService;

    constructor() {
        this.adminService = new AdminService();
    }

    async createAdmin(req: Request) {

        this.checkEmptyCredential(req);
        this.checkValidEmail(req);
        const {username, email, password} = req.body;
        const admin = await this.adminService.createAdmin({username, email, password});

        return {data: admin};
    }

    private checkEmptyCredential(req: Request){
        if (!req.body.username || !req.body.email || !req.body.password) {
            throw new ValidationError('username, email, password', 'All fields are required');
        }
    }

    private checkValidEmail(req: Request) {
        const email = req.body.email;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new ValidationError('email', 'Invalid email');
        }
    }
}

