import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';
import { jwtMiddleware } from './middleware/jwtMiddleware';
import { DatabasePool } from './repositories/db';
import { adminRoutes, authAdminRoutes, authUserRoutes, userRoutes } from './routes';

// Función para inicializar el entorno
function initializeEnvironment() {
  // Determine environment
  const env = process.env.NODE_ENV || 'development';
  const envFilePath =
    env === 'development'
      ? path.resolve(__dirname, '../.env.dev')
      : path.resolve(__dirname, '../.env');

  // Overload environment variables
  dotenv.config({ path: envFilePath });

  // Debug environment variables
  const debugEnvVars = {
    NODE_ENV: env,
    DATABASE_URL: env === 'development' ? process.env.DATABASE_URL : 'url its a secret... shhh',
    JWT_SECRET_KEY: env === 'development' ? process.env.JWT_SECRET_KEY : 'jwt its a secret... shhh'
  };
  console.log('envFilePath:', envFilePath);
  console.log('Environment variables: ', debugEnvVars);
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Function to test the database connection
async function testDatabaseConnection(retries = 5, delay = 5000) {
  while (retries > 0) {
    try {
      const pool = DatabasePool.getInstance();
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

// Start the server and connect to the database
async function startServer() {
  // Inicializar el entorno antes de cualquier otra operación
  initializeEnvironment();

  await testDatabaseConnection();

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
  app.use(errorHandler);

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await DatabasePool.closePool();
  process.exit(0);
});

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
