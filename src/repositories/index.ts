import { createPool } from './db';
import { UserRepository } from './userRepository';

const pool = createPool();
export const userRepository = new UserRepository(pool);