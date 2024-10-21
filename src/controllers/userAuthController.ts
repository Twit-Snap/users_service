import { NextFunction, Request, Response } from 'express';
import { UserAuthService } from '../services/userAuthService';
import { ValidationError } from '../types/customErrors';
import { UserRegisterDto } from '../types/userAuth';

export class UserAuthController {
  private userAuthService: UserAuthService;

  constructor() {
    this.userAuthService = new UserAuthService();
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { emailOrUsername, password } = req.body;
      if (!emailOrUsername || !password) {
        throw new ValidationError(
          'emailOrUsername',
          'Invalid email or username',
          'INVALID_EMAIL_OR_USERNAME'
        );
      }
      const user = await this.userAuthService.login(emailOrUsername, password);
      res.send(user);
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const userRegisterDTO: UserRegisterDto = req.body;
      this.registerValidations(userRegisterDTO);
      const user = await this.userAuthService.register(userRegisterDTO);
      res.send(user);
    } catch (error) {
      next(error);
    }
  }

  private registerValidations(userData: UserRegisterDto) {
    // Validate email
    if (!userData.email || !userData.email.includes('@')) {
      throw new ValidationError('email', 'Invalid email', 'INVALID_EMAIL');
    }

    // Validate password (TODO: Add more validations)
    if (!userData.password) {
      throw new ValidationError('password', 'Invalid password', 'INVALID_PASSWORD');
    }

    // Validate username (TODO: Add more validations)
    if (!userData.username) {
      throw new ValidationError('username', 'Invalid username', 'INVALID_USERNAME');
    }

    // Validate name (TODO: Add more validations)
    if (!userData.name) {
      throw new ValidationError('name', 'Invalid name', 'INVALID_NAME');
    }

    // Validate lastname (TODO: Add more validations)
    if (!userData.lastname) {
      throw new ValidationError('lastname', 'Invalid lastname', 'INVALID_LASTNAME');
    }

    // Validate birthdate (TODO: Add more validations)
    if (!userData.birthdate) {
      throw new ValidationError('birthdate', 'Invalid birthdate', 'INVALID_BIRTHDATE');
    }
  }
}
