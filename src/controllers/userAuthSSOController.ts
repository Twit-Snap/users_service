import { NextFunction, Request, Response } from 'express';
import { UserAuthSSOService } from '../services/userAuthSSOService';
import { ValidationError } from '../types/customErrors';
import { UserSSOLoginDto, UserSSORegisterDto } from '../types/userAuth';

export class AuthSSOController {
  private userAuthSSOService: UserAuthSSOService;

  constructor() {
    this.userAuthSSOService = new UserAuthSSOService();
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const userSSODto: UserSSOLoginDto = req.body;
      this.loginValidations(userSSODto);
      const user = await this.userAuthSSOService.login(userSSODto);
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

  private loginValidations(userSSODto: UserSSOLoginDto) {
    // Validate idToken
    if (!userSSODto.token) {
      throw new ValidationError('idToken', 'Invalid idToken', 'INVALID_ID_TOKEN');
    }

    if (!userSSODto.uid) {
      throw new ValidationError('uid', 'Invalid uid', 'INVALID_UID');
    }

    this.validateExpoToken(userSSODto.expoToken);
  }

  private registerValidations(userData: UserSSORegisterDto) {
    // Validate idToken
    if (!userData.token) {
      throw new ValidationError('idToken', 'Invalid idToken', 'INVALID_ID_TOKEN');
    }

    if (!userData.uid) {
      throw new ValidationError('uid', 'Invalid uid', 'INVALID_UID');
    }

    if (!userData.providerId) {
      throw new ValidationError('providerId', 'Invalid providerId', 'INVALID_PROVIDER_ID');
    }

    if (!userData.username) {
      throw new ValidationError('username', 'Invalid username', 'INVALID_USERNAME');
    }

    if (!userData.birthdate) {
      throw new ValidationError('birthdate', 'Invalid birthdate', 'INVALID_BIRTHDATE');
    }

    this.validateExpoToken(userData.expoToken);
  }

  private validateExpoToken(expoToken: string | undefined) {
    if (!expoToken) {
      return
    }

    if (!expoToken.startsWith('ExponentPushToken[') || !expoToken.endsWith(']')) {
      throw new ValidationError(
        expoToken,
        'This token is invalid or does not exist',
        'INVALID EXPO TOKEN'
      );
    }
  }
}
