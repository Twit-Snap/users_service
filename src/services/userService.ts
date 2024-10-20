import { FollowersResponse, FollowReturn } from 'follow';
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

  async create(userData: UserRegisterRepository): Promise<User> {
    return this.userRepository.create(userData);
  }

  async getPublicUser(username: string): Promise<PublicUser> {
    const user = await this.userRepository.getByUsername(username);
    const validUser = this.validate_username(user, username);
    return this.preparePublicUser(validUser);
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

  async getAllFollowers(username: string): Promise<FollowersResponse[]> {
    let user = await this.userRepository.getByUsername(username);
    user = this.validate_username(user, username);

    const followers = await this.userRepository.getFollowers(user.id);
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

  private validate_username(user: User | null, username: string) {
    if (!user) throw new NotFoundError(username, '');
    else return user;
  }

  private preparePublicUser(user: User) {
    const { username, name, birthdate, createdAt } = user;
    const publicUser: PublicUser = {
      username,
      name,
      birthdate,
      createdAt
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
