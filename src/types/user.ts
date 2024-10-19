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
  following?: boolean; // Auth user is following the requested user?
  followersCount?: number;
  followingCount?: number;
  followed?: boolean; // Auth user is followed by the requested user?
}

export type UserWithPassword = User & { password: string };

export type PublicUser = Omit<User, 'email' | 'lastname'>;

export interface IUserRepository {
  findByEmailOrUsername(emailOrUsername: string): Promise<UserWithPassword | null>;
  getList(has: string): Promise<User[]>;
  get(id: number): Promise<User | null>;
  create(userData: UserRegisterDto): Promise<User>;
  getByUsername(username: string): Promise<User | null>;
  createFollow(userId: number, followId: number): Promise<FollowReturn>;
  deleteFollow(userId: number, followId: number): Promise<void>;
  getFollow(userId: number, followId: number): Promise<FollowReturn | undefined>;
  getFollows(userId: number, byFollowers: boolean): Promise<FollowersResponse[]>;
}
