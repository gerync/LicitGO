// ##region Importok
import express from 'express';
import rateLimit from 'express-rate-limit';

import RegisterController from '../controllers/auth/Register.js';
import RegisterMiddleware from '../middlewares/auth/Register.js';

import LoginController from '../controllers/auth/Login.js';
import LoginMiddleware from '../middlewares/auth/Login.js';

import Logout from '../controllers/auth/Logout.js';

import verifyTFAController from '../controllers/user/tfa/verify.js';
import verifyTFAMiddleware from '../middlewares/user/tfa/verify.js';
import tempTokenMiddleware from '../middlewares/auth/tempToken.js';

import { getRateLimitHandler } from '../utilities/RateLimitMessages.js';
// ##endregion
// #region Router létrehozása
const router = express.Router();
// #endregion

// #region Rate limiterek
const RL = {
    register: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 perc
        max: 5, // IP-nként 5 kérés
        handler: getRateLimitHandler('register')
    }),
    login: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 perc
        max: 10, // IP-nként 10 kérés
        handler: getRateLimitHandler('login')
    }),
    verifyTFA: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 perc
        max: 10, // IP-nként 10 kérés
        handler: getRateLimitHandler('verifyTFA')
    })
};
// #endregion

// #region Regisztráció, bejelentkezés, kijelentkezés
router.post('/register', RL.register, RegisterMiddleware, RegisterController);

router.post('/login', RL.login, LoginMiddleware, LoginController);

router.post('/logout', Logout);

router.post('/verify-2fa', [tempTokenMiddleware, RL.verifyTFA, verifyTFAMiddleware], verifyTFAController);
// #endregion

export default router;