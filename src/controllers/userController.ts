import { JwtUserPayload } from 'jwt';
import { PublicUser, User } from 'user';
import { UserService } from '../services/userService';
import { ValidationError } from '../types/customErrors';

export class UserController {
  private userService: UserService;

  constructor(aUserService?: UserService) {
    this.userService = aUserService ?? new UserService();
  }

  async getUserByUsername(username: string, authUser: JwtUserPayload) {
    this.validateUsername(username);
    const user: User | PublicUser = await this.userService.getUser(username, authUser);
    return { data: user };
  }

  validateUsername(username: string) {
    if (username.length === 0 || typeof username === 'undefined' || username.trim() === '')
      throw new ValidationError(username, 'Username is required', 'EMPTY USERNAME');
  }
}
