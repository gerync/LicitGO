// ##region Importok
import express from 'express';
import rateLimit from 'express-rate-limit';

import RegisterController from '../controllers/auth/Register.js';
import RegisterMiddleware from '../middlewares/auth/Register.js';
import { uploadPfpSingle } from '../utilities/ManageImages.js';

import LoginController from '../controllers/auth/Login.js';
import LoginMiddleware from '../middlewares/auth/Login.js';

import Logout from '../controllers/auth/Logout.js';

import VerifyTFAcontroller from '../controllers/auth/VerifyTFA.js';
import VerifyTFAMiddleware from '../middlewares/auth/VerifyTFA.js';
import VerifyEmailController from '../controllers/auth/VerifyEmail.js';
import VerifyEmailMiddleware from '../middlewares/auth/VerifyEmail.js';

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
    verifyEmail: rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 10,
        handler: getRateLimitHandler('verifyEmail')
    })
};
// #endregion

// #region Regisztráció, bejelentkezés, kijelentkezés
router.post('/register', RL.register, uploadPfpSingle, RegisterMiddleware, RegisterController);

router.post('/login', RL.login, LoginMiddleware, LoginController);

router.post('/verify-tfa', VerifyTFAMiddleware, VerifyTFAcontroller);

router.post('/verify-email', RL.verifyEmail, VerifyEmailMiddleware, VerifyEmailController);

router.post('/logout', Logout);
// #endregion

export default router;