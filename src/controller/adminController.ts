import { AdminService } from '../services/adminService';
import {Request} from 'express';
import {ValidationError} from "../types/customAdminErros";


export class AdminController {
    private adminService: AdminService;

    constructor() {
        this.adminService = new AdminService();
    }

    async createAdmin(req: Request) {
        const fields = ['username', 'email', 'password'];

        this.checkEmptyCredential(req,fields);
        this.checkValidEmail(req);
        const {username, email, password} = req.body;
        const admin = await this.adminService.createAdmin({username, email, password});

        return {data: admin};
    }

    async loginAdmin(req: Request) {
        const fields = ['email', 'password'];

        this.checkEmptyCredential(req, fields);
        this.checkValidEmail(req);

        const {email, password} = req.body;
        const admin = await this.adminService.loginAdmin({email, password});

        return {data: admin};
    }

    async getUserList() {
        const admin = await this.adminService.getUserList();
        return {data: admin};
    }

    async getUserById(id: string){
        const id_num = parseInt(id);
        const admin = await this.adminService.getUserById(id_num);
        return {data: admin};
    }

    private checkEmptyCredential(req: Request, fields: string[]){
        const isEmpty = fields.some(field => !req.body[field]);
        if(isEmpty) {
            throw new ValidationError(fields.join(', '), `The fields ${fields.join(', ')} are required.`);
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

