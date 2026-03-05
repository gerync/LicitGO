import { authenticator } from 'otplib';
import jwt from 'jsonwebtoken';

import configs from '../../configs/Configs.js';
import pool from '../../database/DB.js';

// Controller: 2FA kód verifikálása és JWT token kiállítása sikeres azonosítás esetén
export default async function VerifyTwoFactorController(req, res) {
    // #region Adatbázis kapcsolat létrehozása, nyelvi beállítás, paraméterek lekérése
    const conn = await pool.getConnection();
    const lang = req.lang;
    const { tfaCode, usertoken } = req;
    const { keeplogin } = req.body;
    // #endregion

    try {
        // #region 2FA secret lekérése az adatbázisból titkosított usertoken alapján
        // `usertoken` here is expected to already be the encrypted usertoken (from the temp token)
        const encryptedUsertoken = usertoken;
        const [tfaRows] = await conn.query(
            'SELECT tfa.secret, users.usertag FROM tfa LEFT JOIN users ON tfa.usertoken = users.usertoken WHERE tfa.usertoken = ? AND tfa.enabled = TRUE',
            [encryptedUsertoken]
        );

        if (tfaRows.length === 0) {
            conn.release();
            throw new Error([
                lang === 'HU' ? 'Kétlépcsős azonosítás nincs engedélyezve.' : 'Two-factor authentication is not enabled.',
                404
            ]);
        }

        const tfaSecret = tfaRows[0].secret;
        const usertag = tfaRows[0].usertag;
        // #endregion

        // #region 2FA kód ellenőrzése otplib segítségével
        const isValid = authenticator.verify({
            token: tfaCode,
            secret: tfaSecret
        });

        if (!isValid) {
            conn.release();
            throw new Error([
                lang === 'HU' ? 'Érvénytelen kétlépcsős azonosítási kód.' : 'Invalid two-factor authentication code.',
                401
            ]);
        }
        // #endregion

        // #region Felhasználói beállítások lekérése
        let [settingsRows] = await conn.query(
            'SELECT language, darkmode, currency FROM settings WHERE usertoken = ?',
            [encryptedUsertoken]
        );
        
        if (settingsRows.length === 0) {
            await conn.query('INSERT INTO settings (usertoken) VALUES (?)', [encryptedUsertoken]);
            [settingsRows] = await conn.query(
                'SELECT language, darkmode, currency FROM settings WHERE usertoken = ?',
                [encryptedUsertoken]
            );
        }
        // #endregion

        // #region JWT token létrehozása (keeplogin alapján 30 vagy 1 nap lejárattal)
        const token = jwt.sign({ usertoken }, configs.jwtSecret, {
            expiresIn: keeplogin ? '30d' : '1d',
        });
        // #endregion

        // #region Utolsó bejelentkezés időpontjának frissítése
        await conn.query('UPDATE users SET lastlogin = NOW() WHERE usertoken = ?', [encryptedUsertoken]);
        conn.release();
        // #endregion

        // #region HTTPOnly auth süti, nyelvnyelvek, sötét mód, valuta sütik beállítása
        const maxage = keeplogin ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
        const cookieBase = { maxAge: maxage, sameSite: 'lax', secure: configs.environment.isProduction };
        res.cookie('auth', token, { ...cookieBase, httpOnly: true });
        res.cookie('usertag', usertag, cookieBase);
        res.cookie('language', settingsRows[0].language || 'en', cookieBase);
        res.cookie('darkmode', settingsRows[0].darkmode ? 'true' : 'false', cookieBase);
        res.cookie('currency', settingsRows[0].currency || 'USD', cookieBase);
        
        return res.status(200).json({ 
            message: lang === 'HU' ? 'Sikeres kétlépcsős azonosítás.' : 'Two-factor authentication successful.' 
        });
        // #endregion
    } catch (error) {
        conn.release();
        throw error;
    }
}
