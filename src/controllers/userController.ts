import { JwtCustomPayload, JwtUserPayload } from 'jwt';
import { GetAccountsByUserParams, GetUserParams, ModifiableUser, PublicUser, User } from 'user';
import { UserService } from '../services/userService';
import { AuthenticationError, ValidationError } from '../types/customErrors';

export class UserController {
  private userService: UserService;

  constructor(aUserService?: UserService) {
    this.userService = aUserService ?? new UserService();
  }

  async getSuggestedAccounts(username: string, authUser: JwtUserPayload, params?: GetAccountsByUserParams) {
    this.validateUsername(username);
    const users: User[] = await this.userService.getSuggestedAccounts(username, authUser, params);
    return { data: users };
  }

  async getUserByUsername(username: string, authUser: JwtUserPayload, params?: GetUserParams) {
    this.validateUsername(username);
    const user: User | PublicUser = await this.userService.getUser(username, authUser, params);
    return { data: user };
  }

  validateUsername(username: string) {
    if (username.length === 0 || typeof username === 'undefined' || username.trim() === '')
      throw new ValidationError(username, 'Username is required', 'EMPTY USERNAME');
  }

  canUserChangeBlock(jwtUser: JwtCustomPayload, newValues: ModifiableUser) {
    if (jwtUser.type === 'admin') {
      return;
    }

    if (newValues.isBlocked != undefined) {
      throw new AuthenticationError('You must be an admin to be able to change the blocked status');
    }
  }

  newValuesHasExtraKeys(newValues: ModifiableUser) {
    const modifiableKeys: (keyof ModifiableUser)[] & string[] = [
      'backgroundPicture',
      'birthdate',
      'email',
      'isBlocked',
      'isPrivate',
      'lastname',
      'name',
      'profilePicture',
      'username'
    ];

    const newKeys = Object.keys(newValues);

    newKeys.forEach((key: string) => {
      if (!modifiableKeys.includes(key)) {
        throw new ValidationError(
          key,
          'This key is not modifiable or does not exist',
          'FORBIDDEN KEY'
        );
      }
    });
  }

  async associateInterestsToUser(userId: number, interests?: number[]): Promise<boolean> {
    if (!interests?.length) {
      throw new ValidationError('interests', 'Interests are required', 'EMPTY_INTERESTS');
    }
    if (interests.some((interest) => typeof interest !== 'number')) {
      throw new ValidationError('interests', 'Interests must be numbers', 'INVALID_INTERESTS');
    }
    return await this.userService.associateInterestsToUser(userId, interests);
  }
}
