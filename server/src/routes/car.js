import express from 'express';
import getCarController from '../controllers/car/getCar.js';

const router = express.Router();

router.get('/:carId', getCarController);

export default router;
