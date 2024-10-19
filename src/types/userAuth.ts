import { User } from 'user';

export type UserWithToken = User & { token: string };

export interface UserRegisterDto {
  username: string;
  email: string;
  name: string;
  lastname: string;
  birthdate: Date;
  password: string;
}

export interface IUserAuthService {
  login(emailOrUsername: string, password: string): Promise<UserWithToken>;
  register(user: UserRegisterDto): Promise<UserWithToken>;
}
