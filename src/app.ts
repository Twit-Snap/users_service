import express from 'express';
import { authRoutes, userRoutes } from './routes';


const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/user', userRoutes);
app.use('/auth', authRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});