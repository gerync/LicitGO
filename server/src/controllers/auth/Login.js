import argon from 'argon2';
import jwt from 'jsonwebtoken';

import configs from '../../configs/Configs.js';
import { encryptData } from '../../utilities/Encrypt.js';
import DB from '../../database/DB.js';
import { config } from 'dotenv';

// Bejelentkezés: azonosítás, jelszó ellenőrzés és sütik kiállítása
export default async function LoginController(req, res) {
    // #region Adatbázis kapcsolat létrehozása, nyelvi beállítás, kérés paraméterek kiemelése
    const conn = await DB.pool.getConnection();
    const lang = (req.cookies.language || 'EN').toUpperCase();
    const { identifier, password, keeplogin } = req.body;
    // #endregion

    // #region Felhasználó adaténak keresése (usertoken, jelszóhash) az azonosító alapján (email/usertag/mobil)
    const selectQuery = 'SELECT usertoken, usertag, passwordhash, tfaenabled, tfasecret FROM users WHERE email = ? OR usertag = ? OR mobile = ?';
    const encryptedIdentifier = encryptData(identifier);
    const selectParams = [encryptedIdentifier, identifier, encryptedIdentifier];
    const rows = await DB.use(selectQuery, selectParams);
    if (rows.length === 0) {
        conn.release();
        return res.status(404).send(lang === 'HU' ? 'Hibás felhasználónév vagy jelszó.' : 'Invalid identifier or password.');
    }
    // #endregion

    // #region Argon2 hash hasznalata, megadott jelszó ellenőrzése az adatbázisban tárolt hash-el szemben
    const passwordhash = rows[0].passwordhash;
    const validPassword = await argon.verify(passwordhash, password);
    if (!validPassword) {
        conn.release();
        return res.status(401).send(lang === 'HU' ? 'Hibás felhasználónév vagy jelszó.' : 'Invalid identifier or password.');
    }
    // #endregion

    // #region Kétlépcsős azonosítás ellenőrzése - ha engedélyezve van, 2FA kód szükséges
    if (rows[0].tfaenabled) {
        const tempToken = jwt.sign({ usertoken: rows[0].usertoken, tfa_required: true }, configs.jwtSecret, {
            expiresIn: '5m',
        });
        conn.release();
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
     let settings = await DB.use('SELECT language, darkmode, currency FROM settings WHERE usertoken = ?', [rows[0].usertoken]);
     if (settings.length === 0) {
         await DB.use('INSERT INTO settings (usertoken) VALUES (?)', [rows[0].usertoken]);
         settings = await DB.use('SELECT language, darkmode, currency FROM settings WHERE usertoken = ?', [rows[0].usertoken]);
     }
    conn.release();
    // #endregion

    // #region HTTPOnly auth süti, nyelvnyelvek, sötét mód, valuta sütik beállítása keeplogin és bejelentkezett felhasználó alapján
    const maxage = keeplogin ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const cookieBase = { maxAge: maxage, sameSite: 'lax', secure: configs.environment.isProduction };
    res.cookie('auth', token, { ...cookieBase, httpOnly: true });
    res.cookie('usertag', rows[0].usertag, cookieBase);
    res.cookie('language', settings[0].language || 'en', cookieBase);
    res.cookie('darkmode', settings[0].darkmode ? 'true' : 'false', cookieBase);
    res.cookie('currency', settings[0].currency || 'USD', cookieBase);
    return res.status(200).send(lang === 'HU' ? 'Sikeres bejelentkezés.' : 'Login successful.');
    // #endregion
}