import express from 'express';
import { UserAuthService } from '../services/userAuthService';
import { UserRegisterDto } from 'user';

const router = express.Router();

// Define your routes here
router.get('/', (req, res) => {
  res.send('Hello, Auth!');
});


router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    res.send('Login route');
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