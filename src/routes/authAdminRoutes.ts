import express from 'express';
import { adminAuthController } from '../controller';

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const user = await adminAuthController.createAdmin(req);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const user = await adminAuthController.loginAdmin(req);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
