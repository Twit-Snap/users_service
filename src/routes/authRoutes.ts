import express from 'express';

const router = express.Router();

// Define your routes here
router.get('/', (req, res) => {
  res.send('Hello, Auth!');
});


router.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  res.send('Login route');
});

router.post('/register', (req, res) => {
  const { email, password, name } = req.body;
  console.log(email, password, name);
  res.send('Register route');
});


export default router;