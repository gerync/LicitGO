import configs from '../../configs/Configs.js';
import jwt from 'jsonwebtoken';

// Middleware: Ideiglenes token (2FA) ellenőrzése - csak tfa_required flag-gel rendelkező tokenek engedélyezve

export default function tempTokenMiddleware(req, res, next) {
    // #region Nyelvbeállítás és auth token lekérése
    const lang = req.lang;
    const authToken = req.cookies.auth;
    if (!authToken) {
        throw new Error(lang === 'HU' ? 'Nincs hitelesítési token.' : 'No authentication token provided.', 401);
    }
    // #endregion

    // #region JWT dekódolása és tfa_required flag ellenőrzése
    try {
        const decoded = jwt.verify(authToken, configs.jwtSecret);
        if (!decoded.tfa_required) {
            throw new Error(lang === 'HU' ? 'Érvénytelen token típus.' : 'Invalid token type.', 403);
        }
        req.usertoken = decoded.usertoken;
        req.decoded = decoded;
    } catch (err) {
        throw new Error(lang === 'HU' ? 'Érvénytelen vagy lejárt token.' : 'Invalid or expired token.', 401);
    }
    // #endregion

    next();
}
