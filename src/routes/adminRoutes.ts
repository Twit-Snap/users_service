import express from 'express';
import {adminController} from "../controller";

const router = express.Router();


router.get('/', async (req, res, next) => {
    try {
        const user = await adminController.getUserList();
        res.send(user);

    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    const id = req.params.id;
    try {
        const user = await adminController.getUserById(id);

        res.send(user);
    } catch (error) {
        next(error);
    }
});


export default router;
