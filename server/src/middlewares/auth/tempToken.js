import configs from '../../configs/Configs.js';
import jwt from 'jsonwebtoken';

// Middleware: Ideiglenes token (2FA) ellenőrzése - csak tfa_required flag-gel rendelkező tokenek engedélyezve

export default function tempTokenMiddleware(req, res, next) {
    // #region Nyelvbeállítás és auth token lekérése
    const lang = (req.cookies.language || 'EN').toUpperCase();
    const authToken = req.cookies.auth;
    if (!authToken) {
        return res.status(401).send(lang === 'HU' ? 'Nincs ideiglenes token.' : 'No temporary token provided.');
    }
    // #endregion

    // #region JWT dekódolása és tfa_required flag ellenőrzése
    try {
        const decoded = jwt.verify(authToken, configs.jwtSecret);
        if (!decoded.tfa_required) {
            return res.status(403).send(lang === 'HU' ? 'Érvénytelen token típus.' : 'Invalid token type.');
        }
        req.usertoken = decoded.usertoken;
        req.decoded = decoded;
    } catch (err) {
        return res.status(401).send(lang === 'HU' ? 'Érvénytelen vagy lejárt token.' : 'Invalid or expired token.');
    }
    // #endregion

    next();
}
