import { pool } from '../app';
import { UserRepository } from './userRepository';

export const userRepository = new UserRepository(pool);