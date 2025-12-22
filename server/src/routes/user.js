// ##region Importok
import express from 'express';
import RateLimit from 'express-rate-limit';
// ##endregion
// ##region Köztes rétegek és vezérlők importálása
import { getRateLimitHandler } from '../utilities/RateLimitMessages.js';

import isLoggedIn from '../middlewares/auth/isLoggedIn.js';

import changeDataMiddleware from '../middlewares/user/changedata.js';
import ChangeDataController from '../controllers/user/changedata.js';

import userSettingsMiddleware from '../middlewares/user/settings.js';
import UserSettingsController from '../controllers/user/settings.js';

import toggleTFAMiddleware from '../middlewares/user/tfa/toggle.js';
import ToggleTFAController from '../controllers/user/tfa/toggle.js';

import profileMiddleware from '../middlewares/user/profile.js';
import ProfileController from '../controllers/user/profile.js';
// #endregion
const RL = {
    changeData: RateLimit({
        windowMs: 5 * 60 * 1000, // 5 perc
        max: 10, // IP-nként 10 kérés
        handler: getRateLimitHandler('changeData')
    }),
    userSettings: RateLimit({
        windowMs: 5 * 60 * 1000, // 5 perc
        max: 10, // IP-nként 10 kérés
        handler: getRateLimitHandler('userSettings')
    }),
    toggleTFA: RateLimit({
        windowMs: 5 * 60 * 1000, // 5 perc
        max: 5, // IP-nként 5 kérés
        handler: getRateLimitHandler('toggleTFA')
    }),
    profile: RateLimit({
        windowMs: 1 * 60 * 1000, // 1 perc
        max: 30, // IP-nként 30 kérés
        handler: getRateLimitHandler('profile')
    })
};


const router = express.Router();

// #region Felhasználói adatok módosítása
router.put('/changedata', [isLoggedIn, RL.changeData, changeDataMiddleware], ChangeDataController);
// #endregion
// #region Felhasználói beállítások módosítása
router.put('/settings', [RL.userSettings, userSettingsMiddleware], UserSettingsController);
// #endregion
// #region Kétlépcsős azonosítás toggle
router.post('/tfa/toggle', [isLoggedIn, RL.toggleTFA, toggleTFAMiddleware], ToggleTFAController);
// #endregion
// #region Felhasználói profil lekérése
router.get('/profile/:usertag', [RL.profile, profileMiddleware], ProfileController);
// #endregion

export default router;