import { UserRegisterDto } from 'userAuth';

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  lastname: string;
  birthdate: Date;
  createdAt: Date;
}

export type UserWithPassword = User & { password: string };

export type PublicUser = Omit<User, 'id' | 'email' | 'name' | 'lastname' >;

export interface IUserRepository {
  findByEmailOrUsername(emailOrUsername: string): Promise<UserWithPassword | null>;
  getList(): Promise<User[] | null>;
  get(id: number): Promise<User | null>;
  create(userData: UserRegisterDto): Promise<User>;
}
