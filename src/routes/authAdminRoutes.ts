import express from 'express';
import {adminController} from "../controller";
import {UserRegisterDto} from "userAuth";

const router = express.Router();

router.post('/register', async (req, res, next) => {
    try {
        const { username, email, password  } = req.body;
        console.log(email, password, username);
        //const userRegisterDTO: UserRegisterDto = req.body;
        const user = await adminController.createAdmin(req);
        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);

    const user = await adminController.loginAdmin(req);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
