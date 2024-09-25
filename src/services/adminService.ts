import { userRepository } from '../repositories/';
import { Admin } from 'admin';
import { NotFoundError } from '../types/customErrors';
import { User } from 'user';

export class AdminService {
  async getUserList(): Promise<Admin[] | null> {
    return await userRepository.getList();
  }

  async getUserByUsername(username: string) {
    const user = await userRepository.getByUsername(username);
    this.validate_username(user, username);
    return user;
  }

  private validate_username(user: User | null , username: string) {
    if (!user) throw new NotFoundError(username,'');
  }
}
