import bcrypt from 'bcrypt';
import { IJWTService, JwtResetPasswordPayload } from 'jwt';
import { IUserRepository, ModifiableUser } from 'user';
import { IUserAuthService, UserRegisterDto, UserWithToken } from 'userAuth';
import { UserRepository } from '../repositories/user/userRepository';
import { AuthenticationError, BlockedError } from '../types/customErrors';
import { resetPasswordTemplate } from '../utils/resetPassword';
import { SmtpEmailProvider } from '../utils/smtpEmailProvider';
import { JWTService } from './jwtService';

export class UserAuthService implements IUserAuthService {
  private userRepository: IUserRepository;
  private jwtService: IJWTService;

  constructor(userRepositoryArg?: IUserRepository, jwtService?: IJWTService) {
    this.userRepository = userRepositoryArg ?? new UserRepository();
    this.jwtService = jwtService ?? new JWTService();
  }

  private async encryptPassword(password: string) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async login(
    emailOrUsername: string,
    password: string,
    expoToken?: string
  ): Promise<UserWithToken> {
    // Find user by email or username
    const user = await this.userRepository.findByEmailOrUsername(emailOrUsername);

    if (!user || !user.password) {
      throw new AuthenticationError();
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AuthenticationError();
    }

    if (user.isBlocked) {
      throw new BlockedError();
    }

    if (expoToken) {
      this.userRepository.putExpoToken(user.id, expoToken);
    }

    // Generate JWT token
    const token = this.jwtService.sign({
      type: 'user',
      userId: user.id,
      email: user.email,
      username: user.username,
      phoneNumber: user.phoneNumber,
      verified: user.verified
    });

    // Attach token to user object (assuming we want to return it)
    const userWithToken = { ...user, expoToken, token, password: undefined };

    return userWithToken;
  }

  async register(userData: UserRegisterDto): Promise<UserWithToken> {
    // Hash password
    const hashedPassword = await this.encryptPassword(userData.password);

    const newUser = await this.userRepository.create({
      ...userData,
      password: hashedPassword
    });

    // Generate JWT token
    const token = this.jwtService.sign({
      type: 'user',
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
      phoneNumber: newUser.phoneNumber,
      verified: newUser.verified
    });

    // Attach token to user object (assuming we want to return it)
    const userWithToken = { ...newUser, token };

    return userWithToken;
  }

  async setVerified(userId: number) {
    const user = await this.userRepository.modifyUser(userId, {
      verified: true
    } as unknown as ModifiableUser);

    const token = this.jwtService.sign({
      type: 'user',
      userId: user.id,
      email: user.email,
      username: user.username,
      phoneNumber: user.phoneNumber,
      verified: user.verified
    });

    const userWithToken = { ...user, token, password: undefined };

    return userWithToken;
  }

  async forgotPassword(email: string, forgotPasswordTime: number) {
    const user = await this.userRepository.findByEmailOrUsername(email);
    console.log('user in service', user);
    if (!user) {
      throw new AuthenticationError();
    }

    const token = this.jwtService.sign(
      {
        type: 'resetPassword',
        userId: user.id,
        email: user.email
      },
      {
        expiresIn: '1h'
      }
    );

    const resetPasswordUrl = `${process.env.USER_SERVICE_URL}/redirect/reset-password?email=${user.email}&username=${user.username}&token=${token}&forgotPasswordTime=${forgotPasswordTime}`;
    console.log('resetPasswordUrl', resetPasswordUrl);
    const emailBody = resetPasswordTemplate(resetPasswordUrl);
    const emailFrom = 'lescalante+twitsnap@fi.uba.ar';
    const emailResponse = await new SmtpEmailProvider().sendEmail(
      user.email,
      'Twitsnap - Reset Password',
      emailBody,
      emailFrom
    );

    console.log(emailResponse.data);

    return { success: true };
  }

  async resetPassword(token: string, password: string) {
    const decoded = this.jwtService.verify(token) as JwtResetPasswordPayload;

    if (!decoded || decoded.type !== 'resetPassword' || !decoded.userId) {
      throw new AuthenticationError('Invalid token');
    }

    const user = await this.userRepository.get(decoded.userId);

    if (!user) {
      throw new AuthenticationError('Invalid user');
    }

    const hashedPassword = await this.encryptPassword(password);

    await this.userRepository.updatePassword(user.id, hashedPassword);

    return { success: true };
  }
}
