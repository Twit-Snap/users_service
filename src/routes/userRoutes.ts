import express from 'express';
import { userRepository } from '../repositories';

const router = express.Router();

// Define your routes here
router.get('/', async (req, res, next) => {
  try {
    const users = await userRepository.getList();
    res.send(users);
  } catch (error) {
    next(error);
  }
});



export default router;