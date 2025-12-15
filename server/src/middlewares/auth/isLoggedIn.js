import configs from '../../configs/Configs.js';
import jwt from 'jsonwebtoken';

// Hitelesítési middleware: JWT dekódolás, lejárat ellenőrzés, usertoken továbbítása a következő lépéseknek
export default function isLoggedIn(req, res, next) {
    const lang = req.cookies.language.toUpperCase() || 'EN'
    const authToken = req.cookies.auth;
    if (!authToken) {
        return res.status(401).send(lang === 'HU' ? 'Nincs bejelentkezve.' : 'You are not logged in.');
    }
    // verify dob hibát lejárt vagy manipulált tokenre
    const decoded = jwt.verify(authToken, configs.jwtSecret);
    if (!decoded.usertoken) {
        return res.status(401).send(lang === 'HU' ? 'Érvénytelen token.' : 'Invalid token.');
    }
    // azonosító továbbítása a következő middleware-eknek/vezérlőknek
    req.usertoken = decoded.usertoken;
    req.user = decoded;
    next();
}