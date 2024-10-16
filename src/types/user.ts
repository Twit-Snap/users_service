import { FollowersResponse, FollowReturn } from 'follow';
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

export type PublicUser = Omit<User, 'id' | 'email' | 'name' | 'lastname'>;
export type TwitUser = Omit<User, 'email' | 'birthdate' | 'createdAt' | 'lastname'>;

export type PublicUserProfile = PublicUser & {
  twits: Array<{
    id: number;
    user: TwitUser;
    content: string;
    createdAt: Date;
  }>;
};

export interface IUserRepository {
  findByEmailOrUsername(emailOrUsername: string): Promise<UserWithPassword | null>;
  getList(): Promise<User[] | null>;
  get(id: number): Promise<User | null>;
  create(userData: UserRegisterDto): Promise<User>;
  getByUsername(username: string): Promise<User | null>;
  createFollow(userId: number, followId: number): Promise<FollowReturn>;
  deleteFollow(userId: number, followId: number): Promise<void>;
  getFollow(userId: number, followId: number): Promise<FollowReturn | undefined>;
  getFollowers(userId: number): Promise<FollowersResponse[]>;
}
