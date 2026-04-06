// #region Importok
import express from 'express';
import RateLimit from 'express-rate-limit';
// #endregion
// #region "Köztes rétegek" és vezérlők importálása
import AuthMiddleware from '../middlewares/auth/isLoggedIn.js';


import AddCarController from '../controllers/auction/Addcar.js';
import AddCarMiddleware from '../middlewares/auction/Addcar.js';


import AddauctionController from '../controllers/auction/Addauction.js';
import AddauctionMiddleware from '../middlewares/auction/Addauction.js';

import placeBidController from '../controllers/auction/placeBid.js';
import placeBidMiddleware from '../middlewares/auction/placeBid.js';

import ListAuctionsController from '../controllers/auction/list.js';
import ListAuctionsMiddleware from '../middlewares/auction/list.js';

import GetAuctionController from '../controllers/auction/getAuction.js';
import GetAuctionMiddleware from '../middlewares/auction/getAuction.js';

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
    }),
    placeBid: RateLimit({
        windowMs: 5 * 60 * 1000, // 5 perc
        max: 20, // IP-nként 20 kérés
        handler: getRateLimitHandler('placeBid')
    }),
    listAuctions: RateLimit({
        windowMs: 1 * 60 * 1000, // 1 perc
        max: 60, // IP-nként 60 kérés
        handler: getRateLimitHandler('listAuctions')
    }),
    getAuction: RateLimit({
        windowMs: 1 * 60 * 1000, // 1 perc
        max: 60, // IP-nként 60 kérés
        handler: getRateLimitHandler('getAuction')
    })
};

router.post('/addcar', [AuthMiddleware, RL.addCar, AddCarMiddleware], AddCarController);

router.post('/addauction', [AuthMiddleware, RL.addAuction, AddauctionMiddleware], AddauctionController);

router.post('/placebid', [AuthMiddleware, RL.placeBid, placeBidMiddleware], placeBidController);

router.get('/list', [RL.listAuctions, ListAuctionsMiddleware], ListAuctionsController);

router.get('/:auctionId', [RL.getAuction, GetAuctionMiddleware], GetAuctionController);


export default router;