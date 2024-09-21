import { IJWTService } from 'auth';
import bcrypt from 'bcrypt';
import { userRepository } from '../repositories';
import { IAuthUserService, IUserRepository, UserRegisterDto, User } from 'user';
import { JWTService } from './jwtService';

export class UserAuthService implements IAuthUserService {
  private userRepository: IUserRepository;
  private jwtService: IJWTService;

  constructor(userRepositoryArg?: IUserRepository, jwtService?: IJWTService) {
    this.userRepository = userRepositoryArg ?? userRepository;
    this.jwtService = jwtService ?? new JWTService();
  }

  async login(emailOrUsername: string, password: string): Promise<User> {
    throw new Error('Method not implemented');
    // // Find user by email or username
    // const user = await this.userRepository.findByEmailOrUsername(emailOrUsername);

    // if (!user) {
    //   throw new Error('User not found');
    // }

    // // Verify password
    // const isPasswordValid = await bcrypt.compare(password, user.password);

    // if (!isPasswordValid) {
    //   throw new Error('Invalid password');
    // }

    // // Generate JWT token
    // const token = this.jwtService.sign({
    //   type: 'user',
    //   userId: user.id,
    //   email: user.email,
    //   username: user.username,
    // });

    // // Attach token to user object (assuming we want to return it)
    // const userWithToken = { ...user, token };

    // return userWithToken;
  }

  async register(userData: UserRegisterDto): Promise<User> {
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    const newUser = await this.userRepository.create({ ...userData, password: hashedPassword });
    

    // Generate JWT token
    const token = this.jwtService.sign({
      type: 'user',
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
    });

    // Attach token to user object (assuming we want to return it)
    const userWithToken = { ...newUser, token };

    return userWithToken;
  }
}

// Usage example:
// const userRepository = new UserRepository();
// const jwtService = new JWTService();
// const userAuthService = new UserAuthService(userRepository, jwtService);

// async function loginUser(email: string, password: string) {
//   try {
//     const user = await userAuthService.login(email, password);
//     console.log('Logged in user:', user);
//   } catch (error) {
//     console.error('Login failed:', error.message);
//   }
// }

// async function registerUser(userData: RegisterUserDto) {
//   try {
//     const newUser = await userAuthService.register(userData);
//     console.log('Registered user:', newUser);
//   } catch (error) {
//     console.error('Registration failed:', error.message);
//   }
// }