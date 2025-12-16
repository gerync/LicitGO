// ##region Importok
import express from 'express';

import RegisterController from '../controllers/auth/Register.js';
import RegisterMiddleware from '../middlewares/auth/Register.js';

import LoginController from '../controllers/auth/Login.js';
import LoginMiddleware from '../middlewares/auth/Login.js';

import Logout from '../controllers/auth/Logout.js';
// ##endregion
// ##region Router létrehozása
const router = express.Router();
// ##endregion

// ##region Regisztráció, bejelentkezés, kijelentkezés
router.post('/register', RegisterMiddleware, RegisterController);

router.post('/login', LoginMiddleware, LoginController);

router.post('/logout', Logout);
// ##endregion

export default router;