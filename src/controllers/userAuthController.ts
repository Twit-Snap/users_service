import { NextFunction, Request, Response } from 'express';
import { JwtUserPayload, UserRequest } from 'jwt';
import { UserAuthService } from '../services/userAuthService';
import { ValidationError } from '../types/customErrors';
import { UserLoginDto, UserRegisterDto } from '../types/userAuth';
import { checkVerification, sendVerification } from '../utils/verification';
import { MetricController } from './metricController';

export class UserAuthController {
  private userAuthService: UserAuthService;

  constructor() {
    this.userAuthService = new UserAuthService();
  }

  async login(req: Request, res: Response, next: NextFunction) {
    const userLoginDto: UserLoginDto = req.body;
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
    userRegisterDTO.registrationTime = Number(
      userRegisterDTO.registrationTime || new Date().getTime()
    );

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

    if (!userData.phoneNumber || !/^\+\d{10,12}$/.test(userData.phoneNumber)) {
      throw new ValidationError('phoneNumber', 'Invalid phone number', 'INVALID_PHONE_NUMBER');
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
    /*
    if (!userData.registrationTime) {
      throw new ValidationError(
        'registrationTime',
        'Invalid registration time',
        'INVALID_REGISTRATION_TIME'
      );
    }
    */

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

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, channel } = req.body;
      const jwtUser = (req as UserRequest).user;

      console.log(channel);
      const to: string = this.getDestinationByChannel(channel, jwtUser);
      console.log(to);

      if (code == undefined) {
        await sendVerification(to, channel);

        res.status(201);
      } else {
        await checkVerification(to, code);

        const user = await new UserAuthService().setVerified(jwtUser.userId);
        res.status(200).send(user);
      }
    } catch (error) {
      next(error);
    }
  }

  private getDestinationByChannel(channel: string | undefined, jwtUser: JwtUserPayload) {
    switch (channel) {
      case 'sms':
        return jwtUser.phoneNumber;

      case 'email':
        return jwtUser.email;

      default:
        throw new ValidationError('channel', `Invalid channel ${channel}`, 'INVALID_CHANNEL');
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      // Validate email
      if (!email || !email.includes('@')) {
        throw new ValidationError('email', 'Invalid email', 'INVALID_EMAIL');
      }

      const user = await new UserAuthService().forgotPassword(email);
      res.send(user);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    const { token, password, resetPasswordTime, email } = req.body;
    const now = new Date();
    try {
      if (!token || !password) {
        throw new ValidationError('token', 'Invalid token', 'INVALID_TOKEN');
      }

      const user = await new UserAuthService().resetPassword(token, password);
      await new MetricController().postUserMetrics(email, Number(resetPasswordTime), now, true, 'password');
      res.send(user);
    } catch (error) {
      await new MetricController().postUserMetrics(email, Number(resetPasswordTime), now, false, 'password');
      next(error);
    }
  }
}
