// src/repositories/index.ts

import { Pool } from 'pg';

// Create a new PostgreSQL pool
const pool = new Pool({
  user: 'your_username',
  password: 'your_password',
  host: 'your_host',
  port: 5432,
  database: 'your_database',
});

// Example repository function
async function getUsers() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users');
    return result.rows;
  } finally {
    client.release();
  }
}

export default {
  getUsers,
};