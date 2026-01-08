import pool from '../../database/DB.js';
import hashdata from '../../utilities/Hash.js';
import { encryptData } from '../../utilities/Encrypt.js';
import Configs from '../../configs/Configs.js';

export default async function VerifyEmailController(req, res) {
    const { email, code } = req.body;
    const lang = req.lang;
    const conn = await pool.getConnection();

    try {
        const emailHash = hashdata(email);
        const [userRows] = await conn.query('SELECT usertoken, type FROM users WHERE email_hash = ?', [emailHash]);
        if (userRows.length === 0) {
            throw new Error([ lang === 'HU' ? 'Felhasználó nem található ehhez az emailhez.' : 'User not found for this email.', 404 ]);
        }

        const dbUsertoken = userRows[0].usertoken; // already encrypted
        const [codeRows] = await conn.query(
            'SELECT id, code, expiresat, used FROM emailcodes WHERE usertoken = ? AND type = ? ORDER BY expiresat DESC LIMIT 1',
            [dbUsertoken, 'verification']
        );

        if (codeRows.length === 0) {
            throw new Error([ lang === 'HU' ? 'Nincs aktív verifikációs kód. Kérjen újat.' : 'No active verification code. Request a new one.', 404 ]);
        }

        const row = codeRows[0];
        if (row.used || new Date(row.expiresat) < new Date()) {
            throw new Error([ lang === 'HU' ? 'A verifikációs kód lejárt. Kérjen újat.' : 'Verification code expired. Request a new one.', 410 ]);
        }
        if (row.code.toString() !== code.toString()) {
            throw new Error([ lang === 'HU' ? 'Érvénytelen verifikációs kód.' : 'Invalid verification code.', 401 ]);
        }

        await conn.beginTransaction();
        try {
            await conn.query('UPDATE users SET type = ? WHERE usertoken = ?', ['verified', dbUsertoken]);
            await conn.query('UPDATE emailcodes SET used = TRUE WHERE id = ?', [row.id]);
            await conn.commit();
        } catch (txErr) {
            await conn.rollback();
            throw txErr;
        }

        return res.status(200).json({
            success: true,
            message: lang === 'HU' ? 'Email sikeresen megerősítve.' : 'Email verified successfully.'
        });
    } finally {
        conn.release();
    }
}
