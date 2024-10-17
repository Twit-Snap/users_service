import { UserService } from '../services/userService';
import { ValidationError } from '../types/customErrors';
import {PublicUser} from 'user';

export class UserController {
  private userService: UserService;

  constructor(aUserService?: UserService) {
    this.userService = aUserService ?? new UserService();
  }

  async getUserByUsername(username: string) {
    this.validateUsername(username);
     const publicUser: PublicUser = await this.userService.getPublicUser(username);
     return {data: publicUser};
  }

  validateUsername(username: string) {
    if (username.length === 0 || typeof username === 'undefined' || username.trim() === '')
      throw new ValidationError(username, 'Username is required', 'EMPTY USERNAME');
  }
}
