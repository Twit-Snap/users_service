import express from 'express';
import {adminController} from "../controller";

const router = express.Router();

// Define your routes here
router.get('/', (req, res) => {
    res.send('Hello, Auth!');
});
/*
router.post('/admin/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        console.log(email, password);
        res.send('Login route');
    } catch (error) {
        next(error);
    }
});
*/


router.post('/register', async (req, res, next) => {
    try {
        const { username, email, password  } = req.body;
        console.log(email, password, username);

        const user = await adminController.createAdmin(req);
        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const {email, password} = req.body;
        console.log(email, password);

        const user = await adminController.loginAdmin(req);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }

});

export default router;