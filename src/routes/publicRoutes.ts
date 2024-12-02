import express from 'express';
import { UserService } from '../services/userService';

const router = express.Router();

// Endpoint to get all interests
router.get('/interests', async (req, res, next) => {
  try {
    const data = await new UserService().getAllInterests();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
