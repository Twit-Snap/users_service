import express from 'express';

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
    const { email, password, name } = req.body;
    console.log(email, password, name);
    res.send('Register route');
  } catch (error) {
    next(error);
  }
});


export default router;