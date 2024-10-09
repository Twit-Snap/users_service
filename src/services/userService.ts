import { UserRegisterDto } from 'userAuth';
import { UserRepository } from '../repositories/userRepository';
import { IUserRepository, User, UserWithPassword, PublicUser, PublicUserProfile } from '../types/user';
import { NotFoundError, ServiceUnavailableError } from '../types/customErrors';
import axios from 'axios';
import * as process from 'node:process';

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

  async getUserPublicProfile(username: string) : Promise<PublicUserProfile>{
    const user =  await this.userRepository.getByUsername(username);
    const validUser = this.validate_username(user,username);
    return await this.createUserProfileWithTwits(username, validUser);
  }

  private async createUserProfileWithTwits(username: string, validUser: User) {
    try {
      const twits = await this.getTwits(username);
      const publicUser = this.getPublicUser(validUser);

      return {
        ...publicUser,
        twits: twits
      };
    } catch (error) {
      throw new ServiceUnavailableError();
    }
  }

  private async getTwits(username: string) {
    const twitsResponse = await axios.get(`${process.env.TWITS_SERVICE_URL}/snaps/by_username/${username}`);
    return twitsResponse.data.data;
  }

  private validate_username(user: User | null , username: string) {
    if (!user) throw new NotFoundError(username,'')
    else return user
  }

  private getPublicUser(user: User ){
    const { username, birthdate, createdAt} = user;
    const publicUser: PublicUser = {
      username,
      birthdate,
      createdAt,
    };

    return publicUser;

  }
}
