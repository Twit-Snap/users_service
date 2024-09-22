import { createPool } from './db';
import { UserRepository } from './userRepository';
import { AdminRepository } from './adminRepository';

const pool = createPool();
export const userRepository = new UserRepository(pool);
export const adminRepository = new AdminRepository(pool);
