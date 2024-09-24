import { IJWTService } from 'jwt';
import bcrypt from 'bcrypt';
import { userRepository } from '../repositories';
import { JWTService } from './jwtService';
import { AuthenticationError, ValidationError } from '../types/customErrors';
import { IAuthUserService, UserWithToken, UserRegisterDto } from 'userAuth';
import { IUserRepository } from 'user';

export class UserAuthService implements IAuthUserService {
  private userRepository: IUserRepository;
  private jwtService: IJWTService;

  constructor(userRepositoryArg?: IUserRepository, jwtService?: IJWTService) {
    this.userRepository = userRepositoryArg ?? userRepository;
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
    this.registerValidations(userData);
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
