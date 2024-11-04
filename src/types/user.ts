import { FollowersResponse, FollowReturn, GetAllFollowsParams } from 'follow';
import { UserRegisterRepository } from 'userAuth';

export interface User {
  id: number;
  userId?: number;
  username: string;
  email: string;
  name: string;
  lastname: string;
  birthdate: Date;
  createdAt: Date;
  profilePicture?: string;
  backgroundPicture?: string;
  ssoUid?: string;
  providerId?: string;
  following?: boolean; // Auth user is following the requested user?
  followersCount?: number;
  followingCount?: number;
  followed?: boolean; // Auth user is followed by the requested user?
  isPrivate: boolean;
  isBlocked: boolean;
}

export interface ModifiableUser {
  username?: string;
  email?: string;
  name?: string;
  lastname?: string;
  birthdate?: string;
  profilePicture?: string;
  backgroundPicture?: string;
  isPrivate?: boolean;
  is_private?: boolean;
  isBlocked?: boolean;
  is_blocked?: boolean;
}

export type UserWithPassword = User & { password: string };

export type NotModifiableUser = Omit<User, keyof ModifiableUser>;

export type PublicUser = Omit<User, 'email' | 'lastname' | 'isBlocked'>;

export interface IUserRepository {
  findByEmailOrUsername(emailOrUsername: string): Promise<UserWithPassword | null>;
  getList(params: GetUsersListParams): Promise<User[]>;
  get(id: number): Promise<User | null>;
  create(userData: UserRegisterRepository): Promise<User>;
  getByUsername(username: string, params?: GetUserParams): Promise<User | null>;
  findBySSOuid(uid: string): Promise<User | null>;
  createFollow(userId: number, followId: number): Promise<FollowReturn>;
  deleteFollow(userId: number, followId: number): Promise<void>;
  getFollow(userId: number, followId: number): Promise<FollowReturn | undefined>;
  getFollows(userId: number, params: GetAllFollowsParams): Promise<FollowersResponse[]>;
  getAmount(params: GetUsersListParams): Promise<number>;
  modifyUser(userId: number, newValues: ModifiableUser): Promise<User>;
}

export type GetUsersListParams = {
  has: string;
  createdAt?: string;
  limit?: number;
  amount?: boolean;
  equalDate?: boolean;
  offset: number;
};

export type GetUserParams = {
  reduce?: boolean;
};
