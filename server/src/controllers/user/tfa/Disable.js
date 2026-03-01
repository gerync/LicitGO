import { authenticator } from 'otplib';
import argon from 'argon2';
import crypto from 'crypto';

import pool from '../../../database/DB.js';
import { encryptData, decryptData } from '../../../utilities/Encrypt.js';
import sendEmail from '../../../email/send.js';

// Controller: 2FA letiltása - 2FA kód / backup kód / email kód alapú verifikáció
export async function DisableTwoFactorController(req, res) {
    // #region Adatbázis kapcsolat létrehozása, nyelvi beállítás, paraméterek lekérése
    const conn = await pool.getConnection();
    const lang = req.lang;
    const { usertoken } = req;
    const { tfaCode, backupCode, emailCode, requestEmail } = req.body;
    // #endregion

    try {
        const encryptedUsertoken = encryptData(usertoken);

        // #region Ellenőrzi, hogy 2FA engedélyezve van-e
        const [tfaRows] = await conn.query(
            'SELECT enabled, secret, backupcodes FROM tfa WHERE usertoken = ?',
            [encryptedUsertoken]
        );

        if (tfaRows.length === 0 || !tfaRows[0].enabled) {
            conn.release();
            throw new Error([
                lang === 'HU' ? 'A kétlépcsős azonosítás nincs engedélyezve.' : 'Two-factor authentication is not enabled.',
                400
            ]);
        }
        // #endregion

        // #region Ha email kódot kérnek, generálás és küldés
        if (requestEmail === true) {
            // Email lekérése
            const [userRows] = await conn.query(
                'SELECT email, usertag FROM users WHERE usertoken = ?',
                [encryptedUsertoken]
            );

            if (userRows.length === 0) {
                conn.release();
                throw new Error([
                    lang === 'HU' ? 'Felhasználó nem található.' : 'User not found.',
                    404
                ]);
            }

            const email = decryptData(userRows[0].email);
            const usertag = userRows[0].usertag;

            // 6 számjegyű kód generálása
            const code = crypto.randomInt(100000, 1000000).toString();

            // Kód mentése az adatbázisba 15 perces lejárattal
            await conn.query(
                'INSERT INTO emailcodes (usertoken, code, expiresat, type, newemail, newemail_hash) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE), ?, NULL, NULL)',
                [encryptedUsertoken, code, 'tfa-disable']
            );

            // Email küldése
            await sendEmail(
                email,
                lang === 'HU' ? 'Kétlépcsős azonosítás letiltása' : 'Disable Two-Factor Authentication',
                { code, usertag },
                'disable-2fa',
                lang
            );

            conn.release();

            return res.status(200).json({
                message: lang === 'HU' ? 'Email kód elküldve. Ellenőrizze postafiókját.' : 'Email code sent. Check your inbox.'
            });
        }
        // #endregion

        // #region 1. módszer: 2FA kód ellenőrzése
        if (tfaCode) {
            const tfaSecret = tfaRows[0].secret;

            const isValid = authenticator.verify({
                token: tfaCode,
                secret: tfaSecret
            });

            if (!isValid) {
                conn.release();
                throw new Error([
                    lang === 'HU' ? 'Érvénytelen 2FA kód.' : 'Invalid 2FA code.',
                    401
                ]);
            }

            // 2FA letiltása
            await conn.query(
                'UPDATE tfa SET enabled = FALSE, secret = NULL, backupcodes = NULL WHERE usertoken = ?',
                [encryptedUsertoken]
            );

            conn.release();

            return res.status(200).json({
                message: lang === 'HU' ? 'Kétlépcsős azonosítás sikeresen letiltva.' : 'Two-factor authentication successfully disabled.'
            });
        }
        // #endregion

        // #region 2. módszer: Backup kód ellenőrzése
        if (backupCode) {
            const backupCodes = tfaRows[0].backupcodes ? JSON.parse(tfaRows[0].backupcodes) : [];

            // Ellenőrzi, hogy a backup kód érvényes-e (hash összehasonlítás)
            let isValidBackupCode = false;
            for (const storedCode of backupCodes) {
                const isMatch = await argon.verify(storedCode, backupCode);
                if (isMatch) {
                    isValidBackupCode = true;
                    break;
                }
            }

            if (!isValidBackupCode) {
                conn.release();
                throw new Error([
                    lang === 'HU' ? 'Érvénytelen backup kód.' : 'Invalid backup code.',
                    401
                ]);
            }

            // 2FA letiltása
            await conn.query(
                'UPDATE tfa SET enabled = FALSE, secret = NULL, backupcodes = NULL WHERE usertoken = ?',
                [encryptedUsertoken]
            );

            conn.release();

            return res.status(200).json({
                message: lang === 'HU' ? 'Kétlépcsős azonosítás sikeresen letiltva.' : 'Two-factor authentication successfully disabled.'
            });
        }
        // #endregion

        // #region 3. módszer: Email kód ellenőrzése
        if (emailCode) {
            // Email kód lekérése az adatbázisból
            const [codeRows] = await conn.query(
                'SELECT id, code, expiresat, used FROM emailcodes WHERE usertoken = ? AND type = ? AND used = FALSE ORDER BY expiresat DESC LIMIT 1',
                [encryptedUsertoken, 'tfa-disable']
            );

            if (codeRows.length === 0) {
                conn.release();
                throw new Error([
                    lang === 'HU' ? 'Nincs aktív email kód. Kérjen újat.' : 'No active email code. Request a new one.',
                    404
                ]);
            }

            const storedCode = codeRows[0].code;
            const expiresAt = new Date(codeRows[0].expiresat);
            const codeId = codeRows[0].id;

            // Lejárat ellenőrzése
            if (new Date() > expiresAt) {
                conn.release();
                throw new Error([
                    lang === 'HU' ? 'Az email kód lejárt. Kérjen újat.' : 'Email code expired. Request a new one.',
                    401
                ]);
            }

            // Kód ellenőrzése
            if (emailCode !== storedCode) {
                conn.release();
                throw new Error([
                    lang === 'HU' ? 'Érvénytelen email kód.' : 'Invalid email code.',
                    401
                ]);
            }

            // Kód használtként jelölése
            await conn.query('UPDATE emailcodes SET used = TRUE WHERE id = ?', [codeId]);

            // 2FA letiltása
            await conn.query(
                'UPDATE tfa SET enabled = FALSE, secret = NULL, backupcodes = NULL WHERE usertoken = ?',
                [encryptedUsertoken]
            );

            conn.release();

            return res.status(200).json({
                message: lang === 'HU' ? 'Kétlépcsős azonosítás sikeresen letiltva.' : 'Two-factor authentication successfully disabled.'
            });
        }
        // #endregion

        conn.release();
        throw new Error([
            lang === 'HU' ? 'Érvénytelen letiltási módszer.' : 'Invalid disable method.',
            400
        ]);
    } catch (error) {
        conn.release();
        throw error;
    }
}
