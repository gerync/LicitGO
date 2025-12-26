import argon from 'argon2';
import crypto from 'crypto';

import pool from '../../database/DB.js';
import { encryptData } from '../../utilities/Encrypt.js';
import { hashEmail, hashMobile } from '../../utilities/Hash.js';

// Új felhasználó regisztrációja, ütközések és egyedi token biztosítása
export default async function RegisterController(req, res) {
    // #region Sütik és kérés testéből az összes szükséges felhasználói adat kiemelése, nyelvi beállítás
    const lang = req.lang;
    const currency = req.cookies.currency || 'USD';
    const darkmode = req.cookies.darkmode || 'false';
    const { usertag, password, email, fullname, mobile, gender, birthdate } = req.body;
    const conn = await pool.getConnection();
    // #endregion

    // #region Jelszó Argon2 hash-gelése, email/teljes név/telefonszám AES-256 titkosítása és IV generálása
    const passwordhash = await argon.hash(password);
    const encryptedEmail = encryptData(email);
    const encryptedFullname = encryptData(fullname);
    const encryptedMobile = encryptData(mobile);
    const emailHash = hashEmail(email);
    const mobileHash = hashMobile(mobile);
    // #endregion

    // #region Adatbázis lekérdezés: email, felhasználónév, telefonszám egyediségének ellenőrzése, hibák visszaadása
    const insertQuery = 'INSERT INTO users (usertag, passwordhash, email, email_hash, fullname, mobile, mobile_hash, gender, birthdate, usertoken) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    let usertoken = crypto.randomBytes(32).toString('hex');
    usertoken = encryptData(usertoken);
    const params = [usertag, passwordhash, encryptedEmail, emailHash, encryptedFullname, encryptedMobile, mobileHash, gender, birthdate, usertoken];
    try {
        await conn.query(insertQuery, params);
    }
    catch (error) {
        pool.releaseConnection(conn);
        // #region Ütközés kezelése: egyedi mezők (email, usertag, mobile, usertoken) alapján megfelelő hibák dobása
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.message.includes('users.email')) {
                throw new Error([ lang === 'HU' ? 'Ez az email cím már használatban van.' : 'This email address is already in use.', 409 ]);
            }
            else if (error.message.includes('users.email_hash')) {
                throw new Error([ lang === 'HU' ? 'Ez az email cím már használatban van.' : 'This email address is already in use.', 409 ]);
            }
            else if (error.message.includes('users.usertag')) {
                throw new Error([ lang === 'HU' ? 'Ez a felhasználónév már foglalt.' : 'This usertag is already taken.', 409 ]);
            }
            else if (error.message.includes('users.mobile')) {
                throw new Error([ lang === 'HU' ? 'Ez a telefonszám már használatban van.' : 'This mobile number is already in use.', 409 ]);
            }
            else if (error.message.includes('users.mobile_hash')) {
                throw new Error([ lang === 'HU' ? 'Ez a telefonszám már használatban van.' : 'This mobile number is already in use.', 409 ]);
            }
            // #region Ütközés a usertoken-nél - új token generálása és újrapróbálkozások az adatbázis beszúrással
            else if (error.message.includes('users.usertoken')) {
                let isInserted = false;
                while (!isInserted) {
                    try {
                        usertoken = crypto.randomBytes(32).toString('hex');
                        usertoken = encryptData(usertoken);
                        const retryParams = [usertag, passwordhash, encryptedEmail, encryptedFullname, encryptedMobile, gender, birthdate, usertoken];
                        await conn.query(insertQuery, retryParams);
                        isInserted = true;
                    } catch (retryError) {
                        if (retryError.code !== 'ER_DUP_ENTRY' || !retryError.message.includes('users.usertoken')) {
                            throw retryError;
                        }
                    }
                }
            }
            // #endregion
        }
        // #endregion
        throw error;
    }
    // #endregion

    // #region Felhasználói beállítások létrehozása alapértelmezett értékekkel (nyelv, sötét mód, pénznem)
    const settingsQuery = 'INSERT INTO settings (usertoken, language, darkmode, currency) VALUES (?, ?, ?, ?)';
    const settingsParams = [usertoken, lang, darkmode === 'true' ? 1 : 0, currency];
    await conn.query(settingsQuery, settingsParams);
    // #endregion
    pool.releaseConnection(conn);

    // #region Sikeres regisztrációs válasz visszaadása (201)
    return res.status(201).json({
        success: true,
        message: lang === 'HU' ? 'Sikeres regisztráció.' : 'Registration successful.',
    });
    // #endregion
}