import bcrypt from 'bcrypt';
import { IJWTService } from 'jwt';
import { IUserRepository } from 'user';
import { IUserAuthService, UserRegisterDto, UserWithToken } from 'userAuth';
import { UserRepository } from '../repositories/user/userRepository';
import { AuthenticationError } from '../types/customErrors';
import { JWTService } from './jwtService';

export class UserAuthSSOService implements IUserAuthService {
  private userRepository: IUserRepository;
  private jwtService: IJWTService;

  constructor(userRepositoryArg?: IUserRepository, jwtService?: IJWTService) {
    this.userRepository = userRepositoryArg ?? new UserRepository();
    this.jwtService = jwtService ?? new JWTService();
  }

  async login(emailOrUsername: string, password: string): Promise<UserWithToken> {
    // Find user by email or username
    const user = await this.userRepository.findByEmailOrUsername(emailOrUsername);

    if (!user) {
      throw new AuthenticationError();
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AuthenticationError();
    }

    // Generate JWT token
    const token = this.jwtService.sign({
      type: 'user',
      userId: user.id,
      email: user.email,
      username: user.username
    });

    // Attach token to user object (assuming we want to return it)
    const userWithToken = { ...user, token, password: undefined };

    return userWithToken;
  }

  async register(userData: UserRegisterDto): Promise<UserWithToken> {
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    const newUser = await this.userRepository.create({
      ...userData,
      password: hashedPassword
    });

    // Generate JWT token
    const token = this.jwtService.sign({
      type: 'user',
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username
    });

    // Attach token to user object (assuming we want to return it)
    const userWithToken = { ...newUser, token };

    return userWithToken;
  }
}
