import configs from '../../configs/Configs.js';
import jwt from 'jsonwebtoken';

// Middleware: Ideiglenes token (2FA) ellenőrzése - csak tfa_required flag-gel rendelkező tokenek engedélyezve

export default function tempTokenMiddleware(req, res, next) {
    // #region Nyelvbeállítás és auth token lekérése
    const lang = req.lang;
    // Accept token from cookie or Authorization header (Bearer)
    let authToken = null;
    if (req.cookies && req.cookies.auth) authToken = req.cookies.auth;
    const authHeader = req.headers && (req.headers.authorization || req.headers.Authorization);
    if (!authToken && authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        authToken = authHeader.slice(7).trim();
    }
    // Also allow explicit token in body (e.g., from client) as fallback
    if (!authToken && req.body && req.body.token) authToken = req.body.token;
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
