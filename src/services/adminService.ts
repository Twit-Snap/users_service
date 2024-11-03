import { Admin } from 'admin';
import { GetUsersListParams, User } from 'user';
import { UserRepository } from '../repositories/user/userRepository';
import { NotFoundError } from '../types/customErrors';

export class AdminService {
  private repository: UserRepository;

  constructor(aUserRepository?: UserRepository) {
    this.repository = aUserRepository ?? new UserRepository();
  }

  async getUserList(params: GetUsersListParams): Promise<Admin[] | null> {
    return await this.repository.getList(params);
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
