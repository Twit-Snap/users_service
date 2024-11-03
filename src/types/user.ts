import { FollowersResponse, FollowReturn, GetAllFollowsParams } from 'follow';
import { UserRegisterRepository } from 'userAuth';

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  lastname: string;
  birthdate: Date;
  createdAt: Date;
  profilePicture?: string;
  ssoUid?: string;
  providerId?: string;
  following?: boolean; // Auth user is following the requested user?
  followersCount?: number;
  followingCount?: number;
  followed?: boolean; // Auth user is followed by the requested user?
  isPrivate: boolean;
}

export type UserWithPassword = User & { password: string };

export type PublicUser = Omit<User, 'email' | 'lastname'>;

export interface IUserRepository {
  findByEmailOrUsername(emailOrUsername: string): Promise<UserWithPassword | null>;
  getList(params: GetUsersListParams): Promise<User[]>;
  get(id: number): Promise<User | null>;
  create(userData: UserRegisterRepository): Promise<User>;
  getByUsername(username: string): Promise<User | null>;
  findBySSOuid(uid: string): Promise<User | null>;
  createFollow(userId: number, followId: number): Promise<FollowReturn>;
  deleteFollow(userId: number, followId: number): Promise<void>;
  getFollow(userId: number, followId: number): Promise<FollowReturn | undefined>;
  getFollows(userId: number, params: GetAllFollowsParams): Promise<FollowersResponse[]>;
}

export type GetUsersListParams = {
  has: string;
  createdAt?: string;
  limit?: number;
};
