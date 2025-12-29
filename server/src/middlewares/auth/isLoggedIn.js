import configs from '../../configs/Configs.js';
import jwt from 'jsonwebtoken';

// Hitelesítési middleware: JWT dekódolás, lejárat ellenőrzés, usertoken továbbítása a következő lépéseknek
export default function isLoggedIn(req, res, next) {
    // #region Nyelvbeállítás sütiből, auth token élérhető-e - 401 ha hiányzik auth cookie
    const lang = req.lang;
    const authToken = req.cookies.auth;
    console.log('Auth middleware - Token present:', !!authToken);
    console.log('All cookies:', Object.keys(req.cookies));
    if (!authToken) {
        throw new Error([ lang === 'HU' ? 'Nem vagy bejelentkezve.' : 'You are not logged in.', 401 ]);
    }
    // #endregion

    // #region JWT token érvényessége (lejárt/manipulált token 401-et ad), usertoken kiemelése a dekódolt objektumból
    // verify dob hibát lejárt vagy manipulált tokenre - itt feltartóztatjuk
    try {
        console.log('Attempting to verify token...');
        const decoded = jwt.verify(authToken, configs.jwtSecret);
        /*
        console.log('Token verified successfully');
        console.log('Decoded token:', { hasUsertoken: !!decoded.usertoken, tfaRequired: decoded.tfa_required, exp: decoded.exp });
        */
        
        if (!decoded.usertoken) {
            throw new Error([ lang === 'HU' ? 'Érvénytelen token.' : 'Invalid token.', 401 ]);
        }

        if (decoded.tfa_required) {
            throw new Error([ lang === 'HU' ? 'Kétlépcsős azonosítás verifikációja szükséges.' : 'Two-factor authentication verification required.', 401 ]);
        }

        req.usertoken = decoded.usertoken; // Already decrypted in Login controller
        req.user = decoded;
        req.lang = lang;
        console.log('User authenticated successfully');
    } catch (err) {
        console.log('Token verification failed:', err.message);
        throw new Error([ lang === 'HU' ? 'Érvénytelen vagy lejárt token.' : 'Invalid or expired token.', 401 ]);
    }
    // #endregion

    // #region Ideiglenes token ellenőrzése - ha tfa_required flag van, 2FA verifikáció szükséges
    // #endregion
    next();
}