import express from 'express';
import { UserController } from '../controllers/userController';
import { UserService } from '../services/userService';
const router = express.Router();

// Define your routes here
router.get('/', async (req, res, next) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jwtUser = (req as any).user;
    console.log(jwtUser);
    const users = await new UserService().getList();
    res.send(users);
  } catch (error) {
    next(error);
  }
});

router.get('/:username', async (req, res, next) => {
  const username = req.params.username;
  try {
    const user = await new UserController().getUserByUsername(username);
    res.send(user);
  } catch (error) {
    next(error);
  }
});

router.post('/:username/followers', async (req, res, next) => {
  try {
    const { username } = req.params;

    const { followedUsername } = req.body;

    const controller = new UserController();

    controller.validateUsername(username);
    controller.validateUsername(followedUsername);

    const follow = await new UserService().followUser(username, followedUsername);
    res.status(201).json(follow);
  } catch (error) {
    next(error);
  }
});

router.delete('/:username/followers', async (req, res, next) => {
  try {
    const { username } = req.params;

    const { followedUsername } = req.body;

    const controller = new UserController();

    controller.validateUsername(username);
    controller.validateUsername(followedUsername);

    await new UserService().unfollowUser(username, followedUsername);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get('/:username/followers/', async (req, res, next) => {
  try {
    const { username } = req.params;

    new UserController().validateUsername(username);

    const data = await new UserService().getAllFollowers(username);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
