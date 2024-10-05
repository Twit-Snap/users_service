import { UserRepository } from '../repositories/userRepository';
import { userRepository } from '../repositories';
import { PublicUser, User } from 'user';
import { NotFoundError } from '../types/customErrors';

export class UserService {
  private repository: UserRepository

  constructor(aUserRepository?:UserRepository) {
    this.repository = aUserRepository ?? userRepository;
  }

  async getUserByUsername(username: string){
   const user =  await this.repository.getByUsername(username);
   const validUser = this.validate_username(user,username);
   this.getPublicUser(validUser);
   return user;
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
