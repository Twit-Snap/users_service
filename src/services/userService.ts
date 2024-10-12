import { UserRegisterDto } from 'userAuth';
import { UserRepository } from '../repositories/userRepository';
import { IUserRepository, User, UserWithPassword, PublicUser } from '../types/user';
import { NotFoundError } from '../types/customErrors';


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

  async getPublicUser(username: string) : Promise<PublicUser>{
    const user =  await this.userRepository.getByUsername(username);
    const validUser = this.validate_username(user,username);
    return this.preparePublicUser(validUser);
  }

  private validate_username(user: User | null , username: string) {
    if (!user) throw new NotFoundError(username,'')
    else return user
  }

  private preparePublicUser(user: User ){
    const { username, name, birthdate, createdAt} = user;
    const publicUser: PublicUser = {
      username,
      name,
      birthdate,
      createdAt,
    };

    return publicUser;

  }
}
