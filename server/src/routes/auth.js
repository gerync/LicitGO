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
// ##endregion
// ##region Router létrehozása
const router = express.Router();
// ##endregion

// ##region Rate limiterek
const registerLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });
// ##endregion

// ##region Regisztráció, bejelentkezés, kijelentkezés
router.post('/register', registerLimiter, RegisterMiddleware, RegisterController);

router.post('/login', loginLimiter, LoginMiddleware, LoginController);

router.post('/logout', Logout);

router.post('/verify-2fa', [tempTokenMiddleware, verifyTFAMiddleware], verifyTFAController);
// ##endregion

export default router;