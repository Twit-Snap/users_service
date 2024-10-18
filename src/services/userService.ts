import { FollowersResponse, FollowReturn } from 'follow';
import { JwtUserPayload } from 'jwt';
import { UserRegisterDto } from 'userAuth';
import { UserRepository } from '../repositories/user/userRepository';
import { NotFoundError, ValidationError } from '../types/customErrors';
import { IUserRepository, PublicUser, User, UserWithPassword } from '../types/user';

export class UserService {
  private userRepository: IUserRepository;

  constructor(userRepository?: IUserRepository) {
    this.userRepository = userRepository || new UserRepository();
  }

  async findByEmailOrUsername(emailOrUsername: string): Promise<UserWithPassword | null> {
    return this.userRepository.findByEmailOrUsername(emailOrUsername);
  }

  async getList(): Promise<User[] | null> {
    return this.userRepository.getList();
  }

  async get(id: number): Promise<User | null> {
    return this.userRepository.get(id);
  }

  async create(userData: UserRegisterDto): Promise<User> {
    return this.userRepository.create(userData);
  }

  async getPublicUser(username: string, authUser: JwtUserPayload): Promise<PublicUser> {
    const user = await this.userRepository.getByUsername(username);
    let validUser = this.validate_username(user, username);

    validUser = await this.addFollowState(authUser, validUser);

    return authUser.username === username ? validUser : this.preparePublicUser(validUser);
  }

  async followUser(username: string, followedUsername: string): Promise<FollowReturn> {
    let user = await this.userRepository.getByUsername(username);
    let followedUser = await this.userRepository.getByUsername(followedUsername);

    user = this.validate_username(user, username);
    followedUser = this.validate_username(followedUser, followedUsername);

    this.validateUsersToFollow(user.id, followedUser.id);

    const ret = await this.userRepository.createFollow(user.id, followedUser.id);

    return ret;
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

  async getAllFollows(username: string, byFollowers: boolean): Promise<FollowersResponse[]> {
    let user = await this.userRepository.getByUsername(username);
    user = this.validate_username(user, username);

    const followers = await this.userRepository.getFollows(user.id, byFollowers);
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

  private async addFollowState(authUser: JwtUserPayload, user: User) {
    return {
      ...user,
      following: (await this.userRepository.getFollow(authUser.userId, user.id)) ? true : false,
      followersCount: (await this.userRepository.getFollows(user.id, true)).length,
      followingCount: (await this.userRepository.getFollows(user.id, false)).length
    };
  }

  private validate_username(user: User | null, username: string) {
    if (!user) throw new NotFoundError(username, '');
    else return user;
  }

  private preparePublicUser(user: User) {
    const { username, name, birthdate, createdAt, following, followersCount, followingCount } =
      user;
    const publicUser: PublicUser = {
      username,
      name,
      birthdate,
      createdAt,
      following,
      followersCount,
      followingCount
    };

    return publicUser;
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
}
