import pool from '../../../database/DB.js';
import hashdata from '../../../utilities/Hash.js';
import { encryptData, decryptData } from '../../../utilities/Encrypt.js';
import sendEmail from '../../../email/send.js';
import Configs from '../../../configs/Configs.js';
import crypto from 'crypto';

async function ensureEmailChangeColumns(conn) {
    const [hasNewEmail] = await conn.query("SHOW COLUMNS FROM emailcodes LIKE 'newemail'");
    if (hasNewEmail.length === 0) {
        await conn.query('ALTER TABLE emailcodes ADD COLUMN newemail VARCHAR(512)');
    }
    const [hasNewEmailHash] = await conn.query("SHOW COLUMNS FROM emailcodes LIKE 'newemail_hash'");
    if (hasNewEmailHash.length === 0) {
        await conn.query('ALTER TABLE emailcodes ADD COLUMN newemail_hash VARCHAR(64)');
    }
}

async function getUserRowByPlainToken(conn, plainToken) {
    const [rows] = await conn.query('SELECT usertoken, usertag, email FROM users');
    return rows.find(r => {
        try {
            return decryptData(r.usertoken) === plainToken;
        } catch (e) {
            return false;
        }
    });
}

export async function requestEmailChange(req, res) {
    const lang = req.lang;
    const newEmail = req.body.newEmail;
    const usertoken = req.usertoken;
    const conn = await pool.getConnection();

    try {
        if (!newEmail || typeof newEmail !== 'string') {
            throw new Error([ lang === 'HU' ? 'Érvénytelen új email cím.' : 'Invalid new email.', 400 ]);
        }

        const newEmailHash = hashdata(newEmail);
        const [existing] = await conn.query('SELECT 1 FROM users WHERE email_hash = ?', [newEmailHash]);
        if (existing.length > 0) {
            throw new Error([ lang === 'HU' ? 'Ez az email már használatban van.' : 'This email is already in use.', 409 ]);
        }

        await ensureEmailChangeColumns(conn);

        const userRow = await getUserRowByPlainToken(conn, usertoken);
        if (!userRow) {
            throw new Error([ lang === 'HU' ? 'Felhasználó nem található.' : 'User not found.', 404 ]);
        }
        const encryptedUsertoken = userRow.usertoken;

        const code = crypto.randomInt(100000, 1000000);
        const expires = new Date(Date.now() + Configs.emailChange.expiryMinutes * 60000);
        await conn.query(
            'INSERT INTO emailcodes (usertoken, code, type, expiresat, newemail, newemail_hash, used) VALUES (?, ?, ?, ?, ?, ?, FALSE)',
            [encryptedUsertoken, code, 'email-change', expires, encryptData(newEmail), newEmailHash]
        );

        const subject = lang === 'HU' ? 'Email cím megerősítése' : 'Confirm your new email';
        const info = { usertag: userRow.usertag, code };
        await sendEmail(newEmail, subject, info, 'switch-email', lang);

        return res.status(200).json({
            success: true,
            message: lang === 'HU' ? 'Küldtünk egy kódot az új email címre.' : 'We sent a code to your new email.'
        });
    } finally {
        conn.release();
    }
}

export async function verifyEmailChange(req, res) {
    const lang = req.lang;
    const { code, newEmail } = req.body;
    const usertoken = req.usertoken;
    const conn = await pool.getConnection();

    try {
        if (!code || !/^\d{6}$/.test(code.toString())) {
            throw new Error([ lang === 'HU' ? 'A kód 6 számjegy kell legyen.' : 'Code must be 6 digits.', 400 ]);
        }
        if (!newEmail || typeof newEmail !== 'string') {
            throw new Error([ lang === 'HU' ? 'Az új email megadása kötelező.' : 'New email is required.', 400 ]);
        }

        await ensureEmailChangeColumns(conn);

        const userRow = await getUserRowByPlainToken(conn, usertoken);
        if (!userRow) {
            throw new Error([ lang === 'HU' ? 'Felhasználó nem található.' : 'User not found.', 404 ]);
        }
        const encryptedUsertoken = userRow.usertoken;
        const newEmailHash = hashdata(newEmail);

        const [codeRows] = await conn.query(
            `SELECT id, code, expiresat, used, newemail, newemail_hash
             FROM emailcodes
             WHERE usertoken = ? AND type = 'email-change'
             ORDER BY expiresat DESC
             LIMIT 1`,
            [encryptedUsertoken]
        );

        if (codeRows.length === 0) {
            throw new Error([ lang === 'HU' ? 'Nincs aktív email váltási kód.' : 'No active email change code.', 404 ]);
        }

        const row = codeRows[0];
        if (row.used || new Date(row.expiresat) < new Date()) {
            throw new Error([ lang === 'HU' ? 'A kód lejárt. Kérjen újat.' : 'The code has expired. Request a new one.', 410 ]);
        }
        if (row.code.toString() !== code.toString()) {
            throw new Error([ lang === 'HU' ? 'Érvénytelen kód.' : 'Invalid code.', 401 ]);
        }
        if (row.newemail_hash !== newEmailHash) {
            throw new Error([ lang === 'HU' ? 'A kód nem ehhez az emailhez tartozik.' : 'The code does not match this email.', 400 ]);
        }

        await conn.beginTransaction();
        try {
            await conn.query(
                'UPDATE users SET email = ?, email_hash = ? WHERE usertoken = ?',
                [row.newemail, newEmailHash, encryptedUsertoken]
            );
            await conn.query('UPDATE emailcodes SET used = TRUE WHERE id = ?', [row.id]);
            await conn.commit();
        } catch (txErr) {
            await conn.rollback();
            throw txErr;
        }

        return res.status(200).json({
            success: true,
            message: lang === 'HU' ? 'Email cím sikeresen frissítve.' : 'Email updated successfully.'
        });
    } finally {
        conn.release();
    }
}
