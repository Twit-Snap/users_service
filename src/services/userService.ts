import { UserRepository } from '../repositories/userRepository';
import { userRepository } from '../repositories';
import { PublicUser, PublicUserProfile, User } from 'user';
import { NotFoundError } from '../types/customErrors';
import axios from 'axios';
import * as process from 'node:process';

export class UserService {
  private repository: UserRepository

  constructor(aUserRepository?:UserRepository) {
    this.repository = aUserRepository ?? userRepository;
  }

  async getUserPublicProfile(username: string) : Promise<PublicUserProfile>{
   const user =  await this.repository.getByUsername(username);
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
      console.error('Error fetching tweets:', error);
      throw new Error('Failed to fetch tweets from the tweet service');
    }
  }

  private async getTwits(username: string) {
    const twitsResponse = await axios.get(`${process.env.TWEET_SERVICE_URL}/snaps/by_username/${username}`);
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
