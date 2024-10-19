import { NextFunction, Request, Response } from 'express';
import { UserAuthSSOService } from '../services/userAuthSSOService';
import { ValidationError } from '../types/customErrors';
import { UserSSORegisterDto } from '../types/userAuthSSO';

export class AuthSSOController {
  private userAuthSSOService: UserAuthSSOService;

  constructor() {
    this.userAuthSSOService = new UserAuthSSOService();
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { idToken } = req.body;
      const user = await this.userAuthSSOService.login(idToken);
      res.send(user);
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const userSSORegisterDto: UserSSORegisterDto = req.body;
      this.registerValidations(userSSORegisterDto);
      const user = await this.userAuthSSOService.register(userSSORegisterDto);
      res.send(user);
    } catch (error) {
      next(error);
    }
  }

  private registerValidations(userData: UserSSORegisterDto) {
    // Validate idToken
    if (!userData.idToken) {
      throw new ValidationError('idToken', 'Invalid idToken', 'INVALID_ID_TOKEN');
    }

    // Validate email
    if (!userData.email || !userData.email.includes('@')) {
      throw new ValidationError('email', 'Invalid email', 'INVALID_EMAIL');
    }

    // Validate name
    if (!userData.name) {
      throw new ValidationError('name', 'Invalid name', 'INVALID_NAME');
    }

    // Validate photoURL (optional)
    if (userData.photoURL && typeof userData.photoURL !== 'string') {
      throw new ValidationError('photoURL', 'Invalid photoURL', 'INVALID_PHOTO_URL');
    }

    // Validate username (if provided)
    if (userData.username && typeof userData.username !== 'string') {
      throw new ValidationError('username', 'Invalid username', 'INVALID_USERNAME');
    }

    // Validate birthdate (if provided)
    if (userData.birthdate && !(userData.birthdate instanceof Date)) {
      throw new ValidationError('birthdate', 'Invalid birthdate', 'INVALID_BIRTHDATE');
    }
  }
}
