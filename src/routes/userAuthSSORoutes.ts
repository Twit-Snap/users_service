import express from 'express';
import { AuthSSOController } from '../controllers/userAuthSSOController';

const router = express.Router();

router.post('/login', (req, res, next) => new AuthSSOController().login(req, res, next));
router.post('/register', (req, res, next) => new AuthSSOController().register(req, res, next));

export default router;
