// ##region Importok
import express from 'express';

import isLoggedIn from '../middlewares/auth/isLoggedIn.js';

import changeDataMiddleware from '../middlewares/user/changedata.js';
import ChangeDataController from '../controllers/user/changedata.js';

import userSettingsMiddleware from '../middlewares/user/settings.js';
import UserSettingsController from '../controllers/user/settings.js';

import toggleTFAMiddleware from '../middlewares/user/tfa/toggle.js';
import ToggleTFAController from '../controllers/user/tfa/toggle.js';
// ##endregion

const router = express.Router();

// ##region Felhasználói adatok módosítása
router.put('/changedata', [isLoggedIn, changeDataMiddleware], ChangeDataController);
// ##endregion
// ##region Felhasználói beállítások módosítása
router.put('/settings', [isLoggedIn, userSettingsMiddleware], UserSettingsController);
// ##endregion
// ##region Kétlépcsős azonosítás toggle
router.post('/tfa/toggle', [isLoggedIn, toggleTFAMiddleware], ToggleTFAController);
// ##endregion

export default router;