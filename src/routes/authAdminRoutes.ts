import express from 'express';
import { AdminAuthController } from '../controllers/adminAuthController';

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const user = await new AdminAuthController().createAdmin(req);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const user = await new AdminAuthController().loginAdmin(req);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
