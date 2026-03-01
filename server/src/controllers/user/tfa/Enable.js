import { authenticator } from 'otplib';
import QRCode from 'qrcode';

import pool from '../../../database/DB.js';
import { encryptData, decryptData } from '../../../utilities/Encrypt.js';
import sendEmail from '../../../email/send.js';
import Configs from '../../../configs/Configs.js';

// Controller: 2FA engedélyezése - titkos kulcs generálása, QR kód létrehozása, adatbázisba mentés
export async function EnableTwoFactorController(req, res) {
    const conn = await pool.getConnection();
    const lang = req.lang;
    const { usertoken } = req;
    const { code } = req.body;

    try {
        const encryptedUsertoken = encryptData(usertoken);

        const [tfaRows] = await conn.query(
            'SELECT enabled, secret FROM tfa WHERE usertoken = ?',
            [encryptedUsertoken]
        );

        if (tfaRows.length > 0 && tfaRows[0].enabled) {
            conn.release();
            throw new Error([
                lang === 'HU' ? 'A kétlépcsős azonosítás már engedélyezve van.' : 'Two-factor authentication is already enabled.',
                400
            ]);
        }

        // If no code provided -> generate secret and return QR
        if (!code) {
            const secret = authenticator.generateSecret();

            const [userRows] = await conn.query(
                'SELECT usertag FROM users WHERE usertoken = ?',
                [encryptedUsertoken]
            );

            if (userRows.length === 0) {
                conn.release();
                throw new Error([lang === 'HU' ? 'Felhasználó nem található.' : 'User not found.', 404]);
            }

            const usertag = userRows[0].usertag;
            const otpauthUrl = authenticator.keyuri(usertag, 'LicitGO', secret);
            const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

            if (tfaRows.length === 0) {
                await conn.query('INSERT INTO tfa (usertoken, secret, enabled) VALUES (?, ?, FALSE)', [encryptedUsertoken, secret]);
            } else {
                await conn.query('UPDATE tfa SET secret = ?, enabled = FALSE WHERE usertoken = ?', [secret, encryptedUsertoken]);
            }

            conn.release();
            return res.status(200).json({
                message: lang === 'HU' ? 'QR kód generálva. Szkennelje be az alkalmazásával.' : 'QR code generated. Scan with your authenticator app.',
                qrCode: qrCodeUrl,
                secret: secret
            });
        }

        // If code provided -> verify and enable
        if (tfaRows.length === 0 || !tfaRows[0].secret) {
            conn.release();
            throw new Error([lang === 'HU' ? 'Nincs elérhető titkos kulcs.' : 'No secret available.', 400]);
        }

        const secret = tfaRows[0].secret;
        const isValid = authenticator.verify({ token: code, secret });
        if (!isValid) {
            conn.release();
            throw new Error([lang === 'HU' ? 'Érvénytelen kód. Próbálja újra.' : 'Invalid code. Please try again.', 401]);
        }

        await conn.query('UPDATE tfa SET enabled = TRUE WHERE usertoken = ?', [encryptedUsertoken]);

        const [[userRow]] = await conn.query('SELECT email, usertag FROM users WHERE usertoken = ?', [encryptedUsertoken]);
        if (userRow?.email) {
            const recipientEmail = decryptData(userRow.email);
            const recipientLang = req.lang;
            const subject = recipientLang === 'HU' ? 'Kétlépcsős azonosítás engedélyezve' : 'Two-factor authentication enabled';
            const info = { usertag: userRow.usertag, code };
            try {
                await sendEmail(recipientEmail, subject, info, 'enable-2fa', recipientLang);
            } catch (emailErr) {
                // ignore email errors
            }
        }

        conn.release();
        return res.status(200).json({ message: lang === 'HU' ? 'Kétlépcsős azonosítás sikeresen engedélyezve.' : 'Two-factor authentication successfully enabled.' });
    } catch (error) {
        conn.release();
        throw error;
    }
}

export default { EnableTwoFactorController };
