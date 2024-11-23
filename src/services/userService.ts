import { FollowersResponse, FollowReturn, GetAllFollowsParams } from 'follow';
import { JwtUserPayload } from 'jwt';
import { UserRepository } from '../repositories/user/userRepository';
import { NotFoundError, ValidationError } from '../types/customErrors';
import {
  GetUserParams,
  GetUsersListParams,
  Interest,
  IUserRepository,
  ModifiableUser,
  OnlyExpoToken,
  PublicUser,
  User,
  UserWithPassword
} from '../types/user';
import { UserRegisterRepository } from '../types/userAuth';

export class UserService {
  private userRepository: IUserRepository;

  constructor(userRepository?: IUserRepository) {
    this.userRepository = userRepository || new UserRepository();
  }

  async findByEmailOrUsername(emailOrUsername: string): Promise<UserWithPassword | null> {
    return this.userRepository.findByEmailOrUsername(emailOrUsername);
  }

  async getAmount(params: GetUsersListParams): Promise<number> {
    const data = await this.userRepository.getAmount(params);

    return data;
  }

  async getList(jwtUser: JwtUserPayload, params: GetUsersListParams): Promise<User[]> {
    const data = await this.userRepository.getList(params);
    const dataFollows = await Promise.all(
      data.map(async (item) => await this.addFollowState(jwtUser, item))
    );

    return dataFollows;
  }

  async get(id: number): Promise<User | null> {
    return this.userRepository.get(id);
  }

  async create(userData: UserRegisterRepository): Promise<User> {
    return this.userRepository.create(userData);
  }

  async getUser(
    username: string,
    authUser: JwtUserPayload,
    params?: GetUserParams
  ): Promise<User | PublicUser> {
    const user = await this.userRepository.getByUsername(username, params);
    let validUser = this.validate_username(user, username);

    validUser = await this.addFollowState(authUser, validUser);

    if (params?.reduce) {
      validUser = {
        ...validUser,
        userId: validUser.id,
        id: NaN,
        followersCount: undefined,
        followingCount: undefined
      };
    }

    return authUser.username === username ? validUser : this.preparePublicUser(validUser);
  }

  async followUser(
    username: string,
    followedUsername: string
  ): Promise<{ follow: FollowReturn; user: User; followedUser: User }> {
    let user = await this.userRepository.getByUsername(username);
    let followedUser = await this.userRepository.getByUsername(followedUsername);

    user = this.validate_username(user, username);
    followedUser = this.validate_username(followedUser, followedUsername);

    this.validateUsersToFollow(user.id, followedUser.id);

    const ret = await this.userRepository.createFollow(user.id, followedUser.id);

    return { follow: ret, user, followedUser };
  }

  async unfollowUser(username: string, followedUsername: string): Promise<void> {
    let user = await this.userRepository.getByUsername(username);
    let followedUser = await this.userRepository.getByUsername(followedUsername);

    user = this.validate_username(user, username);
    followedUser = this.validate_username(followedUser, followedUsername);

    this.validateUsersToFollow(user.id, followedUser.id);

    const follow = await this.userRepository.getFollow(user.id, followedUser.id);
    this.validateFollow(follow, user, followedUser);

    await this.userRepository.deleteFollow(user.id, followedUser.id);
  }

  async getAllFollows(
    authUser: JwtUserPayload,
    username: string,
    params: GetAllFollowsParams
  ): Promise<FollowersResponse[]> {
    let user = await this.userRepository.getByUsername(username);
    user = this.validate_username(user, username);

    await this.validateMutualFollow(authUser, user);

    const followers = await this.userRepository.getFollows(user.id, params);
    return followers;
  }

  async getFollow(username: string, followedUsername: string): Promise<FollowReturn> {
    let user = await this.userRepository.getByUsername(username);
    let followedUser = await this.userRepository.getByUsername(followedUsername);

    user = this.validate_username(user, username);
    followedUser = this.validate_username(followedUser, followedUsername);

    this.validateUsersToFollow(user.id, followedUser.id);

    let follow = await this.userRepository.getFollow(user.id, followedUser.id);
    follow = this.validateFollow(follow, user, followedUser);
    return follow;
  }

  async modifyUser(username: string, newValues: ModifiableUser): Promise<User> {
    let user = await this.userRepository.getByUsername(username);
    user = this.validate_username(user, username);

    newValues = {
      ...newValues,
      is_blocked: newValues.isBlocked,
      is_private: newValues.isPrivate,
      isBlocked: undefined,
      isPrivate: undefined
    };

    newValues = Object.fromEntries(Object.entries(newValues).filter(([, val]) => val != undefined));

    const data = await this.userRepository.modifyUser(user.id, newValues);
    return data;
  }
  /* istanbul ignore next */
  async updateUserLocation(
    username: string,
    location: { latitude: number; longitude: number }
  ): Promise<void> {
    await this.userRepository.updateLocation(username, location);
  }

  private async addFollowState(authUser: JwtUserPayload, user: User) {
    const following: boolean | undefined =
      authUser.type === 'user'
        ? (await this.userRepository.getFollow(authUser.userId, user.id))
          ? true
          : false
        : undefined;
    const followed: boolean | undefined =
      authUser.type === 'user'
        ? (await this.userRepository.getFollow(user.id, authUser.userId))
          ? true
          : false
        : undefined;

    return {
      ...user,
      following: following,
      followed: followed,
      followersCount: (
        await this.userRepository.getFollows(user.id, {
          byFollowers: true,
          has: '',
          createdAt: undefined
        })
      ).length,
      followingCount: (
        await this.userRepository.getFollows(user.id, {
          byFollowers: false,
          has: '',
          createdAt: undefined
        })
      ).length
    };
  }

  private validate_username(user: User | null, username: string) {
    if (!user) throw new NotFoundError(username, '');
    else return user;
  }

  private preparePublicUser(user: User) {
    return { ...user, email: undefined, lastname: undefined, isBlocked: undefined };
  }

  private async validateMutualFollow(authUser: JwtUserPayload, user: User) {
    if (authUser.userId === user.id) {
      return;
    }

    const following: boolean = (await this.userRepository.getFollow(authUser.userId, user.id))
      ? true
      : false;
    const followed: boolean = (await this.userRepository.getFollow(user.id, authUser.userId))
      ? true
      : false;

    if (!(following && followed)) {
      throw new ValidationError(
        'username',
        `${authUser.username} and ${user.username} do not follow each other`,
        'NOT MUTUAL FOLLOW'
      );
    }
  }

  private validateUsersToFollow(userId: number, followId: number) {
    if (followId === userId) {
      throw new ValidationError(
        'followedUsername',
        '"username" is the same as "followedUsername"',
        'INVALID FOLLOWED_USERNAME'
      );
    }
  }

  private validateFollow(follow: FollowReturn | undefined, user: User, followed: User) {
    if (!follow) {
      throw new NotFoundError('Follow', `(${user.username}, ${followed.username})`);
    }

    return follow;
  }
  /*istanbul ignore next */
  async getAllExpoTokens(senderId: number): Promise<OnlyExpoToken[]> {
    return await new UserRepository().getAllExpoTokens(senderId);
  }

  async getAllInterests(): Promise<Interest[]> {
    return await this.userRepository.getAllInterests();
  }
}
