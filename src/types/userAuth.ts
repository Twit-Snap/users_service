import { User } from 'user';

export type UserWithToken = User & { token: string };

export interface UserRegisterDto {
  username: string;
  email: string;
  name: string;
  lastname: string;
  birthdate: Date;
  password: string;
  profilePicture?: string;
  expoToken?: string;
}

export interface UserSSORegisterDto {
  token: string;
  uid: string;
  providerId: string;
  username: string;
  birthdate: Date;
  profilePicture?: string;
  expoToken?: string;
}

export interface UserSSOLoginDto {
  token: string;
  uid: string;
  expoToken?: string;
}

export type UserRegisterRepository = Omit<UserRegisterDto, 'password'> & {
  ssoUid?: string | null;
  ssoProviderId?: string | null;
  password?: string | null;
  profilePicture?: string | null;
};
export interface IUserAuthService {
  login(emailOrUsername: string, password: string, expoToken: string): Promise<UserWithToken>;
  register(user: UserRegisterDto): Promise<UserWithToken>;
}
