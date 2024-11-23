import express from 'express';
import { UserService } from '../services/userService';

const router = express.Router();
const userService = new UserService();

// Endpoint to get all interests
router.get('/interests', async (req, res, next) => {
    try {
        const data = await userService.getAllInterests();
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
});

export default router;
