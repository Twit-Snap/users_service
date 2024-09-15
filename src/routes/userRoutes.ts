import express from 'express';
import { userRepository } from '../repositories';

const router = express.Router();

// Define your routes here
router.get('/', (req, res) => {
  const users = userRepository.getList();
  res.send(users);
});

router.post('/', (req, res) => {
  const { username, email, password } = req.body;
  const user = userRepository.create({ username, email, password });
  res.send(user);
});


export default router;