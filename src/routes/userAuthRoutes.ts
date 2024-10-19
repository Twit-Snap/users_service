import express from 'express';
import { UserAuthController } from '../controllers/userAuthController';

const router = express.Router();

router.post('/login', (req, res, next) => new UserAuthController().login(req, res, next));
router.post('/register', (req, res, next) => new UserAuthController().register(req, res, next));

export default router;
