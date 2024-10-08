import {UserService} from '../services/userService';
import { ValidationError } from '../types/customErrors';
import {PublicUserProfile} from 'user';

export class UserController{
  private userService: UserService

 constructor(aUserService?: UserService) {
  this.userService =  aUserService ?? new UserService();
  }

  async getUserByUsername(username: string){
    this.validateUsername(username);
     const publicUser: PublicUserProfile = await this.userService.getUserPublicProfile(username);
     return {data: publicUser};
  }

  private validateUsername(username: string) {
    if (!username) throw new ValidationError(username,'Username is required','EMPTY USERNAME');
  }
}