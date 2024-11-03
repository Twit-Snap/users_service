import express from 'express';
import { User } from 'user';
import { UserController } from '../controllers/userController';
import { UserService } from '../services/userService';
import { UserRequest } from '../types/jwt';
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const jwtUser = (req as UserRequest).user;

    const params = {
      has: req.query.has ? req.query.has.toString() : '',
      createdAt: req.query.createdAt ? req.query.createdAt.toString() : undefined,
      limit: req.query.limit ? +req.query.limit : undefined
    };

    const users: User[] = await new UserService().getList(jwtUser, params);
    res.send(users);
  } catch (error) {
    next(error);
  }
});

router.get('/:username', async (req, res, next) => {
  try {
    const authUser = (req as unknown as UserRequest).user;
    const username = req.params.username;

    const user = await new UserController().getUserByUsername(username, authUser);
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

    const params = {
      byFollowers: req.query.byFollowers === 'true' ? true : false,
      has: req.query.has ? req.query.has.toString() : '',
      createdAt: req.query.createdAt ? req.query.createdAt.toString() : undefined,
      limit: req.query.limit ? +req.query.limit : undefined
    };

    new UserController().validateUsername(username);

    const authUser = (req as unknown as UserRequest).user;

    const data = await new UserService().getAllFollows(authUser, username, params);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/:username/followers/:followedUsername', async (req, res, next) => {
  try {
    const { username, followedUsername } = req.params;

    const controller = new UserController();

    controller.validateUsername(username);
    controller.validateUsername(followedUsername);

    const data = await new UserService().getFollow(username, followedUsername);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
