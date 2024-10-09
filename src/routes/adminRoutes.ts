import express from 'express';
import { AdminController } from '../controllers/adminController';

const router = express.Router();

router.get('/users', async (req, res, next) => {
  try {
    const user = await new AdminController().getUserList();
    res.send(user);
  } catch (error) {
    next(error);
  }
});

router.get('/users/:username', async (req, res, next) => {
  const username = req.params.username;
  try {
    const user = await new AdminController().getUserByUsername(username);
    res.send(user);
  } catch (error) {
    next(error);
  }
});

export default router;
