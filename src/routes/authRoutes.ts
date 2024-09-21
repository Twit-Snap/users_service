import express from 'express';
import { UserAuthService } from '../services/userAuthService';
import { UserRegisterDto } from 'user';

const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;
    const user = await new UserAuthService().login(emailOrUsername, password);
    res.send(user);
  } catch (error) {
    next(error);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const userRegisterDTO: UserRegisterDto = req.body;
    const user = await new UserAuthService().register(userRegisterDTO);
    res.send(user);
  } catch (error) {
    next(error);
  }
});


export default router;