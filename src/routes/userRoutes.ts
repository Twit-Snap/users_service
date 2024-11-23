import express from 'express';
import { ModifiableUser, User } from 'user';
import { MetricController } from '../controllers/metricController';
import { UserController } from '../controllers/userController';
import { UserService } from '../services/userService';
import { UserRequest } from '../types/jwt';
import { sendPushNotification } from '../utils/sendNotification';
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const jwtUser = (req as UserRequest).user;

    const params = {
      has: req.query.has ? req.query.has.toString() : '',
      createdAt: req.query.createdAt ? req.query.createdAt.toString() : undefined,
      limit: req.query.limit ? +req.query.limit : undefined,
      amount: req.query.amount?.toString() === 'true',
      offset: req.query.offset ? +req.query.offset : 0,
      equalDate: req.query.equalDate === 'true'
    };

    if (params.amount) {
      const amount = await new UserService().getAmount(params);
      res.send(amount);
      return;
    }

    const users: User[] = await new UserService().getList(jwtUser, params);
    res.send(users);
  } catch (error) {
    next(error);
  }
});

router.get('/interests', async (req, res, next) => {
  try {
    const authUser = (req as unknown as UserRequest).user;
    const user = await new UserService().getUserInterests(authUser.userId);
    res.send(user);
  } catch (error) {
    next(error);
  }
});

//associate interests to user
router.post('/interests', async (req, res, next) => {
  try {
    const authUser = (req as unknown as UserRequest).user;
    const interests = req.body.interests as number[];
    const success = await new UserController().associateInterestsToUser(authUser.userId, interests);
    res.send({success});
  } catch (error) {
    next(error);
  }
});

router.get('/:username', async (req, res, next) => {
  try {
    const authUser = (req as unknown as UserRequest).user;
    const username = req.params.username;
    const params = {
      reduce: req.query.reduce?.toString() === 'true'
    };
    const user = await new UserController().getUserByUsername(username, authUser, params);
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

    const ret = await new UserService().followUser(username, followedUsername);

    if (ret.followedUser.expoToken) {
      sendPushNotification(
        ret.followedUser.expoToken,
        'New Follower!',
        `${ret.user.username} just started following you`,
        {
          params: { username: ret.user.username },
          type: 'user'
        }
      );
    }

    res.status(201).json(ret.follow);
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

router.patch('/:username', async (req, res, next) => {
  try {
    const newValues: ModifiableUser = req.body;
    const username = req.params.username;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const jwtUser = (req as any).user;

    const controller = new UserController();

    controller.validateUsername(username);
    controller.canUserChangeBlock(jwtUser, newValues);
    controller.newValuesHasExtraKeys(newValues);

    const data = await new UserService().modifyUser(username, newValues);
    if (newValues.isBlocked) {
      await new MetricController().postBlockMetric(data.username);
    }

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

router.post('/location', async (req, res, next) => {
  try {
    const jwtUser = (req as UserRequest).user;
    const { latitude, longitude } = req.body;

    await new UserService().updateUserLocation(jwtUser.username, { latitude, longitude });
  } catch (error) {
    next(error);
  }
});

router.post('/notifications', async (req, res, next) => {
  try {
    const title = req.body.title || 'Title';
    const body = req.body.body || 'Body';

    var data = (req.body.data as { senderId: number }) || {
      senderId: 0
    };

    const tokens = await new UserService().getAllExpoTokens(data.senderId);

    console.log(tokens);

    tokens.forEach(({ expoToken }) => {
      sendPushNotification(expoToken, title, body, data);
    });
  } catch (error) {
    next(error);
  }
});

export default router;
