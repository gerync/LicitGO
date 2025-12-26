// #region Importok
import express from 'express';
import RateLimit from 'express-rate-limit';
// #endregion
// #region Köztes rétegek és vezérlők importálása
import { getRateLimitHandler } from '../utilities/RateLimitMessages.js';

import isLoggedIn from '../middlewares/auth/isLoggedIn.js';

import changeDataMiddleware from '../middlewares/user/changedata.js';
import { changeDataController } from '../controllers/user/changedata.js';

import userSettingsMiddleware from '../middlewares/user/settings.js';
import { setUserSettings } from '../controllers/user/settings.js';

import profileMiddleware from '../middlewares/user/profile.js';
import { getProfileController } from '../controllers/user/profile.js';

import { PasswordResetRequestMiddleware, PasswordResetMiddleware } from '../middlewares/user/password/reset.js';
import { PasswordResetRequestController, PasswordResetController } from '../controllers/user/password/reset.js';

import changePasswordMiddleware from '../middlewares/user/password/change.js';
import changePasswordController from '../controllers/user/password/change.js';
// #endregion
// #region Rate limiterek
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
    profile: RateLimit({
        windowMs: 1 * 60 * 1000, // 1 perc
        max: 30, // IP-nként 30 kérés
        handler: getRateLimitHandler('profile')
    }),
    passwordResetRequest: RateLimit({
        windowMs: 5 * 60 * 1000, // 5 perc
        max: 5, // IP-nként 5 kérés
        handler: getRateLimitHandler('passwordResetRequest')
    }),
    passwordReset: RateLimit({
        windowMs: 5 * 60 * 1000, // 5 perc
        max: 5, // IP-nként 5 kérés
        handler: getRateLimitHandler('passwordReset')
    })
};
// #endregion
// #region Router létrehozása
const router = express.Router();
// #endregion
// #region Felhasználói adatok módosítása
router.put('/changedata', [isLoggedIn, RL.changeData, changeDataMiddleware], changeDataController);
// #endregion
// #region Felhasználói beállítások módosítása
router.put('/settings', [RL.userSettings, userSettingsMiddleware], setUserSettings);
// #endregion
// #region Felhasználói profil lekérése
router.get('/profile/:usertag', [RL.profile, profileMiddleware], getProfileController);
// #endregion
// #region Jelszó visszaállítás kérése
router.post('/password/reset/request', [RL.passwordResetRequest, PasswordResetRequestMiddleware], PasswordResetRequestController);
// #endregion
// #region Jelszó visszaállítás végrehajtása
router.post('/password/reset', [RL.passwordReset, PasswordResetMiddleware], PasswordResetController);
// #endregion
// #region Jelszó módosítása bejelentkezett felhasználó számára
router.put('/password/change', [isLoggedIn, changePasswordMiddleware], changePasswordController);
// #endregion
// #region Exportálás
export default router;
// #endregion