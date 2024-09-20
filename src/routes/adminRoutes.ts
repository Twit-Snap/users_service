import express from 'express';
import { adminRepository } from '../repositories';

const router = express.Router();


router.post('/', async (req, res, next) => {
    //try {
        const {username,email, password} = req.body;
        const user = await adminRepository.create({username,email,password});
        res.send(user);

    //} catch (error) {
    //    next(error);
    //}
});


export default router;
