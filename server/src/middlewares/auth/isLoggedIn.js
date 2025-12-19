import configs from '../../configs/Configs.js';
import jwt from 'jsonwebtoken';

// Hitelesítési middleware: JWT dekódolás, lejárat ellenőrzés, usertoken továbbítása a következő lépéseknek
export default function isLoggedIn(req, res, next) {
    // #region Nyelvbeállítás sütiből, auth token élérhető-e - 401 ha hiányzik auth cookie
    const lang = (req.cookies.language || 'EN').toUpperCase();
    const authToken = req.cookies.auth;
    if (!authToken) {
        return res.status(401).send(lang === 'HU' ? 'Nincs bejelentkezve.' : 'You are not logged in.');
    }
    // #endregion

    // #region JWT token érvényessége (lejárt/manipulált token 401-et ad), usertoken kiemelése a dekódolt objektumból
    // verify dob hibát lejárt vagy manipulált tokenre - itt feltartóztatjuk
    try {
        const decoded = jwt.verify(authToken, configs.jwtSecret);
        if (!decoded.usertoken) {
            return res.status(401).send(lang === 'HU' ? 'Érvénytelen token.' : 'Invalid token.');
        }

        if (decoded.tfa_required) {
            return res.status(401).send(lang === 'HU' ? 'Kétlépcsős azonosítás verifikációja szükséges.' : 'Two-factor authentication verification required.');
        }

        req.usertoken = decoded.usertoken;
        req.user = decoded;
    } catch (err) {
        return res.status(401).send(lang === 'HU' ? 'Érvénytelen vagy lejárt token.' : 'Invalid or expired token.');
    }
    // #endregion

    // #region Ideiglenes token ellenőrzése - ha tfa_required flag van, 2FA verifikáció szükséges
    // #endregion
    next();
}