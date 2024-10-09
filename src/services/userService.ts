import { UserRegisterDto } from 'userAuth';
import { UserRepository } from '../repositories/userRepository';
import { IUserRepository, User, UserWithPassword } from '../types/user';

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
}
