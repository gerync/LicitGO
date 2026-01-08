import { authenticator } from 'otplib';
import QRCode from 'qrcode';

import pool from '../../../database/DB.js';
import { encryptData } from '../../../utilities/Encrypt.js';
import { decryptData } from '../../../utilities/Encrypt.js';
import sendEmail from '../../../email/send.js';
import Configs from '../../../configs/Configs.js';

// Controller: 2FA engedélyezése - titkos kulcs generálása, QR kód létrehozása, adatbázisba mentés
export async function EnableTwoFactorController(req, res) {
    // #region Adatbázis kapcsolat létrehozása, nyelvi beállítás, usertoken lekérése
    const conn = await pool.getConnection();
    const lang = req.lang;
    const { usertoken } = req;
    const { code } = req.body;
    // #endregion

    try {
        const encryptedUsertoken = encryptData(usertoken);

        // #region Ellenőrzi, hogy 2FA már engedélyezve van-e
        const [tfaRows] = await conn.query(
            'SELECT enabled, secret FROM tfa WHERE usertoken = ?',
            [encryptedUsertoken]
        );

        // Ha már engedélyezve van, hibaüzenet
        if (tfaRows.length > 0 && tfaRows[0].enabled) {
            pool.releaseConnection(conn);
            throw new Error([
                lang === 'HU' ? 'A kétlépcsős azonosítás már engedélyezve van.' : 'Two-factor authentication is already enabled.',
                400
            ]);
        }
        // #endregion

        // #region Ha nincs code paraméter, új titkos kulcs generálása és QR kód visszaadása
        if (!code) {
            // Titkos kulcs generálása
            const secret = authenticator.generateSecret();

            // Felhasználónév lekérése az adatbázisból
            const [userRows] = await conn.query(
                'SELECT usertag FROM users WHERE usertoken = ?',
                [encryptedUsertoken]
            );

            if (userRows.length === 0) {
                pool.releaseConnection(conn);
                throw new Error([
                    lang === 'HU' ? 'Felhasználó nem található.' : 'User not found.',
                    404
                ]);
            }

            const usertag = userRows[0].usertag;

            // OTP Auth URL generálása
            const otpauthUrl = authenticator.keyuri(usertag, 'LicitGO', secret);

            // QR kód generálása
            const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

            // Titkos kulcs mentése vagy frissítése az adatbázisban (de még nem engedélyezett)
            if (tfaRows.length === 0) {
                await conn.query(
                    'INSERT INTO tfa (usertoken, secret, enabled) VALUES (?, ?, FALSE)',
                    [encryptedUsertoken, secret]
                );
            } else {
                await conn.query(
                    'UPDATE tfa SET secret = ?, enabled = FALSE WHERE usertoken = ?',
                    [secret, encryptedUsertoken]
                );
            }

            pool.releaseConnection(conn);

            return res.status(200).json({
                message: lang === 'HU' ? 'QR kód generálva. Szkennelje be az alkalmazásával.' : 'QR code generated. Scan with your authenticator app.',
                qrCode: qrCodeUrl,
                secret: secret
            });
        }
        // #endregion

        // #region Ha van code paraméter, verifikáció és 2FA engedélyezése
        // Titkos kulcs lekérése
        if (tfaRows.length === 0 || !tfaRows[0].secret) {
            pool.releaseConnection(conn);
            throw new Error([
                lang === 'HU' ? 'Nincs generált titkos kulcs. Először kérjen QR kódot.' : 'No secret generated. Request QR code first.',
                400
            ]);
        }

        const secret = tfaRows[0].secret;

        // Kód ellenőrzése
        const isValid = authenticator.verify({
            token: code,
            secret: secret
        });

        if (!isValid) {
            pool.releaseConnection(conn);
            throw new Error([
                lang === 'HU' ? 'Érvénytelen kód. Próbálja újra.' : 'Invalid code. Please try again.',
                401
            ]);
        }

        // 2FA engedélyezése az adatbázisban
        await conn.query(
            'UPDATE tfa SET enabled = TRUE WHERE usertoken = ?',
            [encryptedUsertoken]
        );

        pool.releaseConnection(conn);

        // Email értesítés küldése az engedélyezésről
        const [[userRow]] = await pool.query('SELECT email, usertag FROM users WHERE usertoken = ?', [encryptedUsertoken]);
        if (userRow?.email) {
            const recipientEmail = decryptData(userRow.email);
            const recipientLang = req.lang;
            const subject = recipientLang === 'HU' ? 'Kétlépcsős azonosítás engedélyezve' : 'Two-factor authentication enabled';
            const info = { usertag: userRow.usertag, code };
            try {
                await sendEmail(recipientEmail, subject, info, 'enable-2fa', recipientLang);
            } catch (emailErr) {
                // Ha az email értesítés sikertelen, a 2FA engedélyezés akkor is érvényes marad
            }
        }

        return res.status(200).json({
            message: lang === 'HU' ? 'Kétlépcsős azonosítás sikeresen engedélyezve.' : 'Two-factor authentication successfully enabled.'
        });
        // #endregion
    } catch (error) {
        pool.releaseConnection(conn);
        throw error;
    }
}
