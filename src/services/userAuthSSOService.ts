import { auth } from 'firebase-admin';
import { IJWTService } from 'jwt';
import { IUserRepository } from 'user';
import { UserRegisterRepository, UserSSORegisterDto, UserWithToken } from 'userAuth';
import { UserRepository } from '../repositories/user/userRepository';
import { AuthenticationError, ValidationError } from '../types/customErrors';
import { JWTService } from './jwtService';

export class UserAuthSSOService {
  private userRepository: IUserRepository;
  private jwtService: IJWTService;

  constructor(userRepositoryArg?: IUserRepository, jwtService?: IJWTService) {
    this.userRepository = userRepositoryArg ?? new UserRepository();
    this.jwtService = jwtService ?? new JWTService();
  }

  async login(userSSODto: UserSSORegisterDto): Promise<UserWithToken> {
    try {
      // Verify the Firebase ID token
      const decodedToken = await auth().verifyIdToken(userSSODto.token);
      console.log('decodedToken:', decodedToken);

      // Check if the UID from the token matches the one provided
      if (decodedToken.uid !== userSSODto.uid) {
        throw new AuthenticationError();
      }

      // Find user by UID
      let user = await this.userRepository.findBySSOuid(userSSODto.uid);

      if (!user) {
        // This depends on your business logic
        throw new AuthenticationError();
      }

      // Generate JWT token
      const token = this.jwtService.sign({
        type: 'user',
        userId: user.id,
        email: user.email,
        username: user.username
      });

      // Attach token to user object
      const userWithToken = { ...user, token };

      return userWithToken;
    } catch (error) {
      console.error('Error in SSO login:', error);
      throw new AuthenticationError();
    }
  }

  async register(userSSODto: UserSSORegisterDto): Promise<UserWithToken> {
    try {
      const { uid, providerId, username, birthdate } = userSSODto;
      // Verify the Firebase ID token
      const decodedToken = await auth().verifyIdToken(userSSODto.token);
      console.log('decodedToken:', decodedToken);

      // Extract user information from the decoded token
      const { given_name, family_name, email, picture } = decodedToken;

      if (!email) {
        //optionl: const email = decodedToken.email || `${firebaseUid}@temporary.example.com`;
        throw new ValidationError('email', 'Email is required', 'EMAIL_REQUIRED');
      }

      // Prepare user data for creation
      const userRegisterData: UserRegisterRepository = {
        username,
        email,
        name: given_name || '',
        lastname: family_name || '',
        birthdate,
        ssoUid: uid, // Use the UID from the decoded token
        ssoProviderId: providerId,
        password: null,
        profilePicture: picture || null
      };

      // Create new user
      const user = await this.userRepository.create(userRegisterData);

      // Generate JWT token
      const token = this.jwtService.sign({
        type: 'user',
        userId: user.id,
        email: user.email,
        username: user.username
      });

      // Attach token to user object
      const userWithToken = { ...user, token };

      return userWithToken;
    } catch (error) {
      console.error('Error in SSO register:', error);
      throw new AuthenticationError();
    }
  }
}
