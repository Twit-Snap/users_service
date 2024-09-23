import dotenv from 'dotenv';
import express from 'express';
import { adminErrorHandler } from './middleware/adminErrorHandler';
import { jwtMiddleware } from './middleware/jwtMiddleware';
import { userErrorHandler } from './middleware/userErrorHandler';
import { createPool } from './repositories/db';
import { adminRoutes, authAdminRoutes, authUserRoutes, userRoutes } from './routes';

dotenv.config();

// eslint-disable-next-line @typescript-eslint/no-require-imports
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Create a new pool using the connection string from environment variables
const pool = createPool();

// Function to test the database connection
async function testDatabaseConnection(retries = 5, delay = 5000) {
  while (retries > 0) {
    try {
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log('Successfully connected to the database');
      return;
    } catch (err) {
      console.error(`Failed to connect to the database. Retries left: ${retries}`, err);
      retries--;
      if (retries === 0) {
        console.error('Max retries reached. Exiting.');
        process.exit(1);
      }
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Apply JWT middleware to all routes except /auth
app.use((req, res, next) => {
  if (req.path.startsWith('/auth')) {
    return next();
  }
  jwtMiddleware(req, res, next);
});

// Routes
app.use('/users', userRoutes);
app.use('/auth', authUserRoutes);
app.use('/admins', adminRoutes);
app.use('/auth/admins', authAdminRoutes);

// Error handling middleware
app.use(userErrorHandler);
app.use(adminErrorHandler);

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
