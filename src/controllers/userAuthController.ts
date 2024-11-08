import { NextFunction, Request, Response } from 'express';
import { UserAuthService } from '../services/userAuthService';
import { ValidationError } from '../types/customErrors';
import { UserRegisterDto } from '../types/userAuth';
import axios from 'axios';

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
    const userRegisterDTO: UserRegisterDto = req.body;

    try {
      this.registerValidations(userRegisterDTO);
      const user = await this.userAuthService.register(userRegisterDTO);
      this.calculateRegistrationTime(userRegisterDTO);
      await this.postRegisterMetrics(userRegisterDTO, true, "register");
      res.send(user);
    } catch (error) {
      if(userRegisterDTO){
        await this.postRegisterMetrics(userRegisterDTO, false, "register");
      }
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
      throw new ValidationError('registrationTime', 'Invalid registration time', 'INVALID_REGISTRATION_TIME');
    }
  }

  private async postRegisterMetrics(userData: UserRegisterDto, success: boolean, type: string) {
    await axios.post(`http://metrics_app:4000/metrics/register`, {
      createdAt: new Date(),
      type: type,
      username: userData.username? userData.username: "",
      metrics: {
        registration_time: userData.registrationTime? userData.registrationTime: 0,
        success: success
      }
    })
  }

  private async postLoginMetrics(userData: UserRegisterDto, success: boolean, type: string) {
    await axios.post(`${process.env.PUBLIC_METRIC_SERVER_URL}/metrics/login`, {
      createdAt: new Date(),
      type: type,
      username: userData.username? userData.username: "",
      metrics: {
        registration_time: userData.registrationTime,
        success: success
      }
    })
  }

  private calculateRegistrationTime(userData: UserRegisterDto): number {
    const now = new Date();
    const registrationTime = new Date(userData.registrationTime);
    return now.getTime() - registrationTime.getTime();
  }
}
