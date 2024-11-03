import { JwtCustomPayload, JwtUserPayload } from 'jwt';
import { ModifiableUser, PublicUser, User } from 'user';
import { UserService } from '../services/userService';
import { AuthenticationError, ValidationError } from '../types/customErrors';

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
}
