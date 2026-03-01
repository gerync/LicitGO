import argon from 'argon2';
import crypto from 'crypto';

import pool from '../../database/DB.js';
import { encryptData } from '../../utilities/Encrypt.js';
import hashdata from '../../utilities/Hash.js';
import { deletePfpFile } from '../../utilities/ManageImages.js';
import Configs from '../../configs/Configs.js';
import sendEmail from '../../email/send.js';

// New user registration with optional profile picture
export default async function RegisterController(req, res) {
    const lang = req.lang;
    const currency = req.cookies.currency || 'USD';
    const darkmode = req.cookies.darkmode || 'false';
    const { usertag, password, email, fullname, mobile, gender, birthdate } = req.body;
    const pfpFile = req.file;
    const conn = await pool.getConnection();

    const passwordhash = await argon.hash(password);
    const encryptedEmail = encryptData(email);
    const encryptedFullname = encryptData(fullname);
    const encryptedMobile = encryptData(mobile);
    const emailHash = hashdata(email);
    const mobileHash = hashdata(mobile);

    const insertQuery = 'INSERT INTO users (usertag, passwordhash, email, email_hash, fullname, mobile, mobile_hash, gender, birthdate, usertoken) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    let usertoken = crypto.randomBytes(32).toString('hex');
    usertoken = encryptData(usertoken);

    const settingsQuery = 'INSERT INTO settings (usertoken, language, darkmode, currency) VALUES (?, ?, ?, ?)';
    const buildSettingsParams = () => [usertoken, lang, darkmode === 'true' ? 1 : 0, currency];

    const mapDuplicateError = (error) => {
        if (error.code !== 'ER_DUP_ENTRY') {
            return null;
        }
        if (error.message.includes("'email'") || error.message.includes("'email_hash'")) {
            return new Error([ lang === 'HU' ? 'Ez az email cim mar hasznalatban van.' : 'This email address is already in use.', 409 ]);
        }
        if (error.message.includes("'usertag'")) {
            return new Error([ lang === 'HU' ? 'Ez a felhasznalonev mar foglalt.' : 'This usertag is already taken.', 409 ]);
        }
        if (error.message.includes("'mobile'") || error.message.includes("'mobile_hash'")) {
            return new Error([ lang === 'HU' ? 'Ez a telefonszam mar hasznalatban van.' : 'This mobile number is already in use.', 409 ]);
        }
        return null;
    };

    try {
        let inserted = false;
        let insertParams = [usertag, passwordhash, encryptedEmail, emailHash, encryptedFullname, encryptedMobile, mobileHash, gender, birthdate, usertoken];

        while (!inserted) {
            try {
                await conn.query(insertQuery, insertParams);
                inserted = true;
            }
            catch (error) {
                if (error.code === 'ER_DUP_ENTRY' && error.message.includes("'usertoken'")) {
                    usertoken = encryptData(crypto.randomBytes(32).toString('hex'));
                    insertParams[insertParams.length - 1] = usertoken;
                    continue;
                }
                const mapped = mapDuplicateError(error);
                if (mapped) {
                    throw mapped;
                }
                throw error;
            }
        }

        await conn.query(settingsQuery, buildSettingsParams());

        if (pfpFile) {
            await conn.query('INSERT INTO profpics (usertoken, filename) VALUES (?, ?)', [usertoken, pfpFile.filename]);
        }

        // #region Regisztráció utáni email verifikációs kód küldése
        const verificationCode = crypto.randomInt(100000, 1000000); // 6 jegyű kód (cryptographically secure)
        const verificationExpiry = new Date(Date.now() + Configs.emailVerification.expiryMinutes * 60000);
        await conn.query(
            'INSERT INTO emailcodes (usertoken, code, type, expiresat, newemail, newemail_hash) VALUES (?, ?, ?, ?, NULL, NULL)',
            [usertoken, verificationCode, 'verification', verificationExpiry]
        );

        const verificationSubject = lang === 'HU' ? 'Email megerősítés' : 'Verify your email';
        const verificationInfo = { code: verificationCode, usertag };
        await sendEmail(email, verificationSubject, verificationInfo, 'verification', lang);
        // #endregion

        return res.status(201).json({
            success: true,
            message: lang === 'HU' ? 'Sikeres regisztracio. Kérjük, erősítse meg az email címét a kiküldött kóddal.' : 'Registration successful. Please verify your email address with the code we sent.',
        });
    }
    catch (error) {
        if (pfpFile) {
            await deletePfpFile(pfpFile.filename).catch(() => {});
        }
        const mapped = mapDuplicateError(error);
        if (mapped) {
            throw mapped;
        }
        throw error;
    }
    finally {
        conn.release();
    }
}
