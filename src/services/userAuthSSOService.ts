import { auth } from 'firebase-admin';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { IJWTService } from 'jwt';
import { IUserRepository } from 'user';
import {
  UserRegisterRepository,
  UserSSOLoginDto,
  UserSSORegisterDto,
  UserWithToken
} from 'userAuth';
import { UserRepository } from '../repositories/user/userRepository';
import { AuthenticationError, BlockedError, ValidationError } from '../types/customErrors';
import { JWTService } from './jwtService';

export class UserAuthSSOService {
  private userRepository: IUserRepository;
  private jwtService: IJWTService;

  constructor(userRepositoryArg?: IUserRepository, jwtService?: IJWTService) {
    this.userRepository = userRepositoryArg ?? new UserRepository();
    this.jwtService = jwtService ?? new JWTService();
  }

  async login(userSSODto: UserSSOLoginDto): Promise<UserWithToken> {
    try {
      // Verify the Firebase ID token
      const decodedToken = await auth().verifyIdToken(userSSODto.token);
      console.log('decodedToken:', decodedToken);

      // Check if the UID from the token matches the one provided
      if (decodedToken.uid !== userSSODto.uid) {
        console.warn('UID mismatch');
        throw new AuthenticationError();
      }

      // Find user by UID
      let user = await this.userRepository.findBySSOuid(userSSODto.uid);

      if (!user) {
        console.warn('User not found');
        throw new AuthenticationError();
      }

      if (user.isBlocked) {
        throw new BlockedError();
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
      throw error;
    }
  }

  async register(userSSODto: UserSSORegisterDto): Promise<UserWithToken> {
    const { uid, providerId, username, birthdate } = userSSODto;
    let decodedToken: DecodedIdToken;
    console.log('userSSODto:', userSSODto);
    try {
      // Verify the Firebase ID token
      decodedToken = await auth().verifyIdToken(userSSODto.token);
    } catch (error) {
      console.error('Error in SSO register:', error);
      throw new AuthenticationError();
    }
    console.log('decodedToken:', decodedToken);

    // Extract user information from the decoded token
    const { name, email, picture } = decodedToken;

    if (!email) {
      //optionl: const email = decodedToken.email || `${firebaseUid}@temporary.example.com`;
      throw new ValidationError('email', 'Email is required', 'EMAIL_REQUIRED');
    }

    const { given_name, family_name } = this.extractName(name);

    // Prepare user data for creation
    const userRegisterData: UserRegisterRepository = {
      username,
      email,
      name: given_name,
      lastname: family_name,
      birthdate,
      ssoUid: uid, // Use the UID from the decoded token
      ssoProviderId: providerId,
      password: null,
      profilePicture: picture || undefined
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
  }

  private extractName(fullName: string): { given_name: string; family_name: string } {
    const names = fullName.split(' ');

    if (names.length === 4) {
      // If the full name has 4 parts, assume the first two are the given name
      // and the last two are the family name
      const given_name = `${names[0]} ${names[1]}`;
      const family_name = `${names[2]} ${names[3]}`;
      return { given_name, family_name };
    }
    const given_name = names[0];
    const family_name = names.slice(1).join(' ');
    return { given_name, family_name };
  }
}
