import argon from 'argon2';
import crypto from 'crypto';

import DB from '../../database/DB.js';
import { encryptData } from '../../utilities/Encrypt.js';

// Új felhasználó regisztrációja, ütközések és egyedi token biztosítása
export default async function RegisterController(req, res) {
    // #region Sütik és kérés testéből az összes szükséges felhasználói adat kiemelése, nyelvi beállítás
    const lang = (req.cookies.language || 'EN').toUpperCase();
    const currency = req.cookies.currency || 'USD';
    const darkmode = req.cookies.darkmode || 'false';
    const { usertag, password, email, fullname, mobile, gender, birthdate } = req.body;
    // #endregion

    // #region Jelszó Argon2 hash-gelése, email/teljes név/telefonszám AES-256 titkosítása és IV generálása
    const passwordhash = await argon.hash(password);
    const encryptedEmail = encryptData(email);
    const encryptedFullname = encryptData(fullname);
    const encryptedMobile = encryptData(mobile);
    // #endregion

    // #region Adatbázis lekérdezés: email, felhasználónév, telefonszám egyediségének ellenőrzése, hibák visszaadása
    const checkQuery = `
        SELECT 
            SUM(CASE WHEN email = ? THEN 1 ELSE 0 END) AS emailCount,
            SUM(CASE WHEN usertag = ? THEN 1 ELSE 0 END) AS usertagCount,
            SUM(CASE WHEN mobile = ? THEN 1 ELSE 0 END) AS mobileCount
        FROM users
        WHERE email = ? OR usertag = ? OR mobile = ?`;
    const checkParams = [encryptedEmail, usertag, encryptedMobile, encryptedEmail, usertag, encryptedMobile];
    const rows = await DB.use(checkQuery, checkParams);
    if (rows[0].usertagCount > 0) {
        return res.status(409).send(lang === 'HU' ? 'A felhasználónév már foglalt.' : 'The usertag is already taken.');
    }
    if (rows[0].emailCount > 0) {
        return res.status(409).send(lang === 'HU' ? 'Az email cím már foglalt.' : 'The email is already taken.');
    }
    if (rows[0].mobileCount > 0) {
        return res.status(409).send(lang === 'HU' ? 'A telefonszám már foglalt.' : 'The mobile number is already taken.');
    }
    // #endregion

    // #region Crypto.randomBytes(64) segítégével 128-karakteres hex usertoken generálása, ütközés ellenőrzés while ciklussal
    let token = crypto.randomBytes(64).toString('hex');
    let tokenExists = true;
    while (tokenExists) {
        const tokenCheckQuery = 'SELECT COUNT(*) AS count FROM users WHERE usertoken = ?';
        const tokenCheckParams = [token];
        const tokenRows = await DB.use(tokenCheckQuery, tokenCheckParams);
        if (tokenRows[0].count === 0) {
            tokenExists = false;
        } else {
            token = crypto.randomBytes(64).toString('hex');
        }
    }
    // #endregion

    // #region Felhasználó sor beszúrása users táblába, beállítások létrehozása (language, darkmode, currency), válaszváltozat
    const insertQuery = `INSERT INTO users (usertoken, usertag, passwordhash, email, fullname, 
                            mobile, gender, birthdate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const insertParams = [token, usertag, passwordhash, encryptedEmail, encryptedFullname, encryptedMobile, gender, birthdate];
    const result = await DB.use(insertQuery, insertParams);
    if (result.affectedRows === 1) {
        // Alapértelmezett beállítások létrehozása a friss tokenhez
        const settingsQuery = 'INSERT INTO settings (usertoken, darkmode, language, currency) VALUES (?, ?, ?, ?)';
        const settingsParams = [token, darkmode, lang, currency];
        await DB.use(settingsQuery, settingsParams);
        return res.status(201).send(lang === 'HU' ? 'Sikeres regisztráció.' : 'Registration successful.');
    } else {
        return res.status(500).send(lang === 'HU' ? 'Hiba történt a regisztráció során.' : 'An error occurred during registration.');
    }
    // #endregion
}