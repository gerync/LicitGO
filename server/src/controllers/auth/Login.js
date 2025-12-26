import argon from 'argon2';
import jwt from 'jsonwebtoken';

import configs from '../../configs/Configs.js';
import { decryptData } from '../../utilities/Encrypt.js';
import { hashEmail, hashMobile } from '../../utilities/Hash.js';
import pool from '../../database/DB.js';

// Bejelentkezés: azonosítás, jelszó ellenőrzés és sütik kiállítása
export default async function LoginController(req, res) {
    // #region Adatbázis kapcsolat létrehozása, nyelvi beállítás, kérés paraméterek kiemelése
    const conn = await pool.getConnection();
    const lang = req.lang;
    const { identifier, password, keeplogin } = req.body;
    // #endregion

    // #region Felhasználó adaténak keresése (usertoken, jelszóhash) az azonosító alapján (email/usertag/mobil)
    // Először felhasználónév alapján keres
    let [rows] = await conn.query('SELECT users.usertoken, users.usertag, users.passwordhash, tfa.enabled as tfaenabled, tfa.secret as tfasecret FROM users LEFT JOIN tfa ON users.usertoken = tfa.usertoken WHERE users.usertag = ?', [identifier]);
    
    // Ha nincs felhasználónév találat, email és mobil hash alapján keres
    if (rows.length === 0) {
        const emailHash = hashEmail(identifier);
        const mobileHash = hashMobile(identifier);
        [rows] = await conn.query('SELECT users.usertoken, users.usertag, users.passwordhash, tfa.enabled as tfaenabled, tfa.secret as tfasecret FROM users LEFT JOIN tfa ON users.usertoken = tfa.usertoken WHERE users.email_hash = ? OR users.mobile_hash = ?', [emailHash, mobileHash]);
    }
    
    // Hibás azonosító esetén hiba visszaadása
    if (rows.length === 0) {
        pool.releaseConnection(conn);
        throw new Error([ lang === 'HU' ? 'Hibás felhasználónév vagy jelszó.' : 'Invalid identifier or password.', 404 ]);
    }
    const matchedUser = rows[0];
    // #endregion

    // #region Argon2 hash hasznalata, megadott jelszó ellenőrzése az adatbázisban tárolt hash-el szemben
    const passwordhash = matchedUser.passwordhash;
    const validPassword = await argon.verify(passwordhash, password);
    if (!validPassword) {
        pool.releaseConnection(conn);
        throw new Error([ lang === 'HU' ? 'Hibás felhasználónév vagy jelszó.' : 'Invalid identifier or password.', 401 ]);
    }
    // #endregion
    
    // #region Felhasználói beállítások lekérése titkosított usertoken-nel (még decrypt előtt)
    const encryptedUsertoken = matchedUser.usertoken;
    let [settingsRows] = await conn.query('SELECT language, darkmode, currency FROM settings WHERE usertoken = ?', [encryptedUsertoken]);
    if (settingsRows.length === 0) {
        await conn.query('INSERT INTO settings (usertoken) VALUES (?)', [encryptedUsertoken]);
        [settingsRows] = await conn.query('SELECT language, darkmode, currency FROM settings WHERE usertoken = ?', [encryptedUsertoken]);
    }
    // #endregion
    
    const decryptedUsertoken = decryptData(matchedUser.usertoken);
    // #region Kétlépcsős azonosítás ellenőrzése - ha engedélyezve van, 2FA kód szükséges
    if (matchedUser.tfaenabled) {
        const tempToken = jwt.sign({ usertoken: decryptedUsertoken, tfa_required: true }, configs.jwtSecret, {
            expiresIn: '5m',
        });
        pool.releaseConnection(conn);
        return res.status(203).json({
            message: lang === 'HU' ? 'Kétlépcsős azonosítás szükséges.' : 'Two-factor authentication required.',
            temp_token: tempToken,
        });
    }
    // #endregion
    // #region JWT token létrehozása (keeplogin alapján 30 vagy 1 nap lejárattal)
    // Normal login flow - 2FA not enabled
    const token = jwt.sign({ usertoken: decryptedUsertoken }, configs.jwtSecret, {
        expiresIn: keeplogin ? '30d' : '1d',
    });
    pool.releaseConnection(conn);
    // #endregion

    // #region HTTPOnly auth süti, nyelvnyelvek, sötét mód, valuta sütik beállítása keeplogin és bejelentkezett felhasználó alapján
    const maxage = keeplogin ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const cookieBase = { maxAge: maxage, sameSite: 'lax', secure: configs.environment.isProduction };
    res.cookie('auth', token, { ...cookieBase, httpOnly: true });
    res.cookie('usertag', matchedUser.usertag, cookieBase);
    res.cookie('language', settingsRows[0].language || 'en', cookieBase);
    res.cookie('darkmode', settingsRows[0].darkmode ? 'true' : 'false', cookieBase);
    res.cookie('currency', settingsRows[0].currency || 'USD', cookieBase);
    return res.status(200).json({ message: lang === 'HU' ? 'Sikeres bejelentkezés.' : 'Login successful.' });
    // #endregion
}