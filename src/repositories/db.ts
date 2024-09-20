// db.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export function createPool() {
  console.log('Creating a new database pool', process.env.DATABASE_URL);
  return new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}