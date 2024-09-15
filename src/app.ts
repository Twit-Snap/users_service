import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { authRoutes, userRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Create a new pool using the connection string from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Function to test the database connection
async function testDatabaseConnection() {
  let client;
  try {
    client = await pool.connect();
    await client.query('SELECT NOW()');
    console.log('Successfully connected to the database');
  } catch (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1); // Exit the process if we can't connect to the database
  } finally {
    if (client) client.release();
  }
}

// Middleware
app.use(express.json());

// Routes
app.use('/user', userRoutes);
app.use('/auth', authRoutes);

// Error handling middleware
app.use(errorHandler);

// Start the server and connect to the database
async function startServer() {
  await testDatabaseConnection();
  
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Export the pool for use in other parts of your application
export { pool };