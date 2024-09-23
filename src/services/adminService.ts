import { userRepository } from '../repositories/';
import {Admin} from "admin";
import {AdminNotFoundError} from "../types/customAdminErros";
import {IUserRepository, User} from "user";

export class AdminService{

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

}