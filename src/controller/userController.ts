import {UserService} from '../services/userService';
import { ValidationError } from '../types/customErrors';

export class UserController{
  private userService: UserService

 constructor(aUserService?: UserService) {
  this.userService =  aUserService ?? new UserService();
  }

  async getUserByUsername(username: string){
    this.validateUsername(username);
     const publicUser =  await this.userService.getUserByUsername(username);
     return {data: publicUser};
  }

  private validateUsername(username: string) {
    if (!username) throw new ValidationError(username,'Username is required','EMPTY USERNAME');
  }
}