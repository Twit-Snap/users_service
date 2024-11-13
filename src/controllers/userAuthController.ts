import { NextFunction, Request, Response } from 'express';
import { UserAuthService } from '../services/userAuthService';
import { ValidationError } from '../types/customErrors';
import { UserLoginDto, UserRegisterDto } from '../types/userAuth';
import { MetricController } from './metricController';

export class UserAuthController {
  private userAuthService: UserAuthService;

  constructor() {
    this.userAuthService = new UserAuthService();
  }

  async login(req: Request, res: Response, next: NextFunction) {
    const userLoginDto: UserLoginDto = req.body
    userLoginDto.loginTime = Number(userLoginDto.loginTime);
    const now = new Date();
    try {
      this.validateLogin(userLoginDto);

      const user = await this.userAuthService.login(
        userLoginDto.emailOrUsername,
        userLoginDto.password
      );

      await new MetricController().postUserMetrics(
        userLoginDto.emailOrUsername,
        userLoginDto.loginTime,
        now,
        true,
        'login'
      );

      res.send(user);
    } catch (error) {
      await new MetricController().postUserMetrics(
        userLoginDto.emailOrUsername,
        userLoginDto.loginTime,
        now,
        false,
        'login'
      );
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    const userRegisterDTO: UserRegisterDto = req.body;
    userRegisterDTO.registrationTime = Number(userRegisterDTO.registrationTime);

    const initialProcessTime = new Date();
    try {
      this.registerValidations(userRegisterDTO);

      const user = await this.userAuthService.register(userRegisterDTO);

      await new MetricController().postUserMetrics(
        userRegisterDTO.username,
        userRegisterDTO.registrationTime,
        initialProcessTime,
        true,
        'register'
      );

      res.send(user);
    } catch (error) {
      await new MetricController().postUserMetrics(
        userRegisterDTO.username,
        userRegisterDTO.registrationTime,
        initialProcessTime,
        false,
        'register'
      );
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

    // Validate registration time
    if (!userData.registrationTime) {
      throw new ValidationError(
        'registrationTime',
        'Invalid registration time',
        'INVALID_REGISTRATION_TIME'
      );
    }

    this.validateExpoToken(userData.expoToken);
  }

  private validateExpoToken(expoToken: string | undefined) {
    if (!expoToken) {
      return;
    }

    if (!expoToken.startsWith('ExponentPushToken[') || !expoToken.endsWith(']')) {
      throw new ValidationError(
        expoToken,
        'This token is invalid or does not exist',
        'INVALID EXPO TOKEN'
      );
    }
  }

  private validateLogin(userLoginDto: UserLoginDto) {
    if (!userLoginDto.emailOrUsername || !userLoginDto.password) {
      throw new ValidationError(
        'emailOrUsername',
        'Invalid email or username',
        'INVALID_EMAIL_OR_USERNAME'
      );
    }

    if (!userLoginDto.loginTime) {
      throw new ValidationError('loginTime', 'Invalid login time', 'INVALID_LOGIN_TIME');
    }

    this.validateExpoToken(userLoginDto.expoToken);
  }
}
