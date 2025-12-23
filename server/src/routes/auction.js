// #region Importok
import express from 'express';
import RateLimit from 'express-rate-limit';
// #endregion
// #region Köztes rétegek és vezérlők importálása
import AuthMiddleware from '../middlewares/auth/isLoggedIn.js';

import AddCarController from '../controllers/auction/Addcar.js';
import AddCarMiddleware from '../middlewares/auction/AddCar.js';


import AddauctionController from '../controllers/auction/Addauction.js';
import AddauctionMiddleware from '../middlewares/auction/Addauction.js';

import { getRateLimitHandler } from '../utilities/RateLimitMessages.js';

// #endregion
const router = express.Router();

const RL = {
    addCar: RateLimit({
        windowMs: 5 * 60 * 1000, // 5 perc
        max: 5, // IP-nként 5 kérés
        handler: getRateLimitHandler('addCar')
    }),
    addAuction: RateLimit({
        windowMs: 5 * 60 * 1000, // 5 perc
        max: 10, // IP-nként 10 kérés
        handler: getRateLimitHandler('addAuction')
    })
};

router.post('/addcar', [AuthMiddleware, RL.addCar, AddCarMiddleware], AddCarController);

router.post('/addauction', [AuthMiddleware, RL.addAuction, AddauctionMiddleware], AddauctionController);

export default router;