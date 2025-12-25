import argon from 'argon2';
import jwt from 'jsonwebtoken';

import configs from '../../configs/Configs.js';
import { encryptData, decryptData } from '../../utilities/Encrypt.js';
import pool from '../../database/DB.js';

// Bejelentkezés: azonosítás, jelszó ellenőrzés és sütik kiállítása
export default async function LoginController(req, res) {
    // #region Adatbázis kapcsolat létrehozása, nyelvi beállítás, kérés paraméterek kiemelése
    const conn = await pool.getConnection();
    const lang = req.lang;
    const { identifier, password, keeplogin } = req.body;
    // #endregion

    // #region Felhasználó adaténak keresése (usertoken, jelszóhash) az azonosító alapján (email/usertag/mobil)
    const selectQuery = 'SELECT usertoken, usertag, passwordhash, tfa.enabled as tfaenabled, tfa.secret as tfasecret FROM users INNER JOIN tfa ON users.usertoken = tfa.usertoken WHERE email = ? OR usertag = ? OR mobile = ?';
    const encryptedIdentifier = encryptData(identifier);
    const selectParams = [encryptedIdentifier, identifier, encryptedIdentifier];
    let [rows] = await conn.query(selectQuery, selectParams);
    // Hibás azonosító esetén hiba visszaadása
    if (rows.length === 0) {
        pool.releaseConnection(conn);
        throw new Error([ lang === 'HU' ? 'Hibás felhasználónév vagy jelszó.' : 'Invalid identifier or password.', 404 ]);
    }
    // #endregion

    // #region Argon2 hash hasznalata, megadott jelszó ellenőrzése az adatbázisban tárolt hash-el szemben
    const passwordhash = rows[0].passwordhash;
    const validPassword = await argon.verify(passwordhash, password);
    if (!validPassword) {
        pool.releaseConnection(conn);
        throw new Error([ lang === 'HU' ? 'Hibás felhasználónév vagy jelszó.' : 'Invalid identifier or password.', 401 ]);
    }
    // #endregion
    rows[0].usertoken = decryptData(rows[0].usertoken);
    // #region Kétlépcsős azonosítás ellenőrzése - ha engedélyezve van, 2FA kód szükséges
    if (rows[0].tfaenabled) {
        const tempToken = jwt.sign({ usertoken: rows[0].usertoken, tfa_required: true }, configs.jwtSecret, {
            expiresIn: '5m',
        });
        pool.releaseConnection(conn);
        return res.status(203).json({
            message: lang === 'HU' ? 'Kétlépcsős azonosítás szükséges.' : 'Two-factor authentication required.',
            temp_token: tempToken,
        });
    }
    // #endregion
    // #region JWT token létrehozása (keeplogin alapján 30 vagy 1 nap lejárattal), felhasználói beállítások lekérése vagy létrehozása
    // Normal login flow - 2FA not enabled
    const token = jwt.sign({ usertoken: rows[0].usertoken }, configs.jwtSecret, {
        expiresIn: keeplogin ? '30d' : '1d',
    });
     let settings = await conn.query('SELECT language, darkmode, currency FROM settings WHERE usertoken = ?', [rows[0].usertoken]);
     if (settings.length === 0) {
         await conn.query('INSERT INTO settings (usertoken) VALUES (?)', [rows[0].usertoken]);
         settings = await conn.query('SELECT language, darkmode, currency FROM settings WHERE usertoken = ?', [rows[0].usertoken]);
     }
    pool.releaseConnection(conn);
    // #endregion

    // #region HTTPOnly auth süti, nyelvnyelvek, sötét mód, valuta sütik beállítása keeplogin és bejelentkezett felhasználó alapján
    const maxage = keeplogin ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const cookieBase = { maxAge: maxage, sameSite: 'lax', secure: configs.environment.isProduction };
    res.cookie('auth', token, { ...cookieBase, httpOnly: true });
    res.cookie('usertag', rows[0].usertag, cookieBase);
    res.cookie('language', settings[0].language || 'en', cookieBase);
    res.cookie('darkmode', settings[0].darkmode ? 'true' : 'false', cookieBase);
    res.cookie('currency', settings[0].currency || 'USD', cookieBase);
    return res.status(200).json({ message: lang === 'HU' ? 'Sikeres bejelentkezés.' : 'Login successful.' });
    // #endregion
}