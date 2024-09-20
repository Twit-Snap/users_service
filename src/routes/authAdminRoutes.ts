import express from 'express';
import {adminRepository} from "../repositories";

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
        const user = await adminRepository.create({username,email,password});
        res.send(user);
    } catch (error) {
        next(error);
    }
});


export default router;