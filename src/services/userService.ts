import { UserRepository } from '../repositories/userRepository';
import { userRepository } from '../repositories';
import { PublicUser } from 'user';
import { NotFoundError } from '../types/customErrors';

export class UserService {
  private repository: UserRepository

  constructor(aUserRepository?:UserRepository) {
    this.repository = aUserRepository ?? userRepository;
  }

  async getUserByUsername(username: string){
   const user =  await this.repository.getPublicInfoByUsername(username);
   this.validate_username(user,username);
   return user;
  }

  private validate_username(user: PublicUser | null , username: string) {
    if (!user) throw new NotFoundError(username,'');
  }

}
