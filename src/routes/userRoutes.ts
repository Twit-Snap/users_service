import express from 'express';
import { userRepository } from '../repositories';

const router = express.Router();

// Define your routes here
router.get('/', async (req, res, next) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jwtUser = (req as any).user;
    console.log(jwtUser);
    const users = await userRepository.getList();
    res.send(users);
  } catch (error) {
    next(error);
  }
});

router.get('/:username', async (req, res, next) => {

  try{
    const jwtUser = (req as any).user;
    const user = await
  }
});

export default router;
