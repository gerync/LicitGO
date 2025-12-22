import pool from '../../../database/DB.js';
import otpauth from 'otpauth';
import jwt from 'jsonwebtoken';
import configs from '../../../configs/Configs.js';

// Kétlépcsős azonosítás (2FA) ellenőrzése TOTP kóddal, majd teljes auth token kiállítása
export default async function verifyTFAController(req, res) {
    // #region Kapcsolat és adatkiemelés
    const lang = req.lang;
    const { code, keeplogin } = req.body;
    const conn = await pool.getConnection();
    // #endregion
    // #region Felhasználó 2FA titkának és státuszának lekérése
    const [userRows] = await conn.query('SELECT tfaenabled, tfasecret FROM users WHERE usertoken = ? LIMIT 1', [req.usertoken]);
    if (!userRows || userRows.length === 0) {
        pool.releaseConnection(conn);
        throw new Error([ lang === 'HU' ? 'Felhasználó nem található.' : 'User not found.', 404 ]);
    }
    const { tfaenabled, tfasecret } = userRows[0];
    if (!tfaenabled || !tfasecret) {
        pool.releaseConnection(conn);
        throw new Error([ lang === 'HU' ? 'A kétlépcsős azonosítás nincs engedélyezve.' : 'Two-factor authentication is not enabled.', 400 ]);
    }
    // #endregion

    // #region TOTP token validálása (±1 time window, 60s)
    const totp = new otpauth.TOTP({
        secret: otpauth.Secret.fromBase32(tfasecret),
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
    });
    const delta = totp.validate({ token: code, window: 1 });
    if (delta === null) {
        pool.releaseConnection(conn);
        return res.status(401).json({ error: lang === 'HU' ? 'Érvénytelen kód.' : 'Invalid code.' });
    }
    // #endregion

    // #region Felhasználó beállításainak lekérése (language, darkmode, currency)
    const [settingsRows] = await conn.query('SELECT language, darkmode, currency FROM settings WHERE usertoken = ? LIMIT 1', [req.usertoken]);
    let settings = settingsRows && settingsRows.length > 0 ? settingsRows[0] : { language: 'en', darkmode: false, currency: 'USD' };
    // #endregion

    // #region Teljes auth JWT token létrehozása (keeplogin alapján 30 vagy 1 nap)
    const token = jwt.sign({ usertoken: req.usertoken }, configs.jwtSecret, {
        expiresIn: keeplogin ? '30d' : '1d',
    });
    // #endregion

    // #region Sütik beállítása: HTTPOnly auth, language, darkmode, currency
    const maxage = keeplogin ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const cookieBase = { maxAge: maxage, sameSite: 'lax', secure: configs.environment.isProduction };
    res.cookie('auth', token, { ...cookieBase, httpOnly: true });
    res.cookie('language', settings.language || 'en', cookieBase);
    res.cookie('darkmode', settings.darkmode ? 'true' : 'false', cookieBase);
    res.cookie('currency', settings.currency || 'USD', cookieBase);
    // #endregion
    pool.releaseConnection(conn);
    // #region Sikeres 2FA verifikáció és bejelentkezés válasza
    return res.status(200).json({
        message: lang === 'HU' ? 'Kétlépcsős azonosítás ellenőrizve, bejelentkezve.' : 'Two-factor authentication verified, logged in successfully.',
    });
}
