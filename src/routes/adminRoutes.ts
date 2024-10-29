import express from 'express';
import { AdminController } from '../controllers/adminController';

const router = express.Router();

router.get('/users', async (req, res, next) => {
  try {
    const params = {
      has: req.query.has ? req.query.has.toString() : '',
      createdAt: req.query.createdAt ? req.query.createdAt.toString() : undefined
    };

    const user = await new AdminController().getUserList(params);
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
