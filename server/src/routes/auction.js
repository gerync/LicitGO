import express from 'express';
import RateLimit from 'express-rate-limit';

import AuthMiddleware from '../middlewares/AuthMiddleware';

import AddCarController from '../controllers/auction/Addcar';
import AddCarMiddleware from '../middlewares/auction/AddCarMiddleware';

const router = express.Router();

const addCarLimiter = RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});

router.post('/addcar', [AuthMiddleware, addCarLimiter, AddCarMiddleware], AddCarController);