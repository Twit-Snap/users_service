import { Admin } from 'admin';
import { User } from 'user';
import { UserRepository } from '../repositories/userRepository';
import { NotFoundError } from '../types/customErrors';

export class AdminService {
  private repository: UserRepository;

  constructor(aUserRepository?: UserRepository) {
    this.repository = aUserRepository ?? new UserRepository();
  }

  async getUserList(): Promise<Admin[] | null> {
    return await this.repository.getList();
  }

  async getUserByUsername(username: string) {
    const user = await this.repository.getByUsername(username);
    this.validate_username(user, username);
    return user;
  }

  private validate_username(user: User | null, username: string) {
    if (!user) throw new NotFoundError(username, '');
  }
}
