import pool from '../../../database/DB.js';
import otpauth from 'otpauth';

// Kétlépcsős azonosítás (2FA) engedélyezése vagy letiltása, tranzakcióval és biztonságos kezeléssel
export default async function toggleTFAController(req, res) {
    // #region Kapcsolat és adatkiemelés
    const lang = (req.cookies.language || 'EN').toUpperCase();
    const { enable } = req.body; // boolean: true = engedélyezés, false = letiltás
    const conn = await pool.getConnection();
    // #endregion
    // #region Tranzakció indítása
    await conn.beginTransaction();
    // #endregion

    // #region Felhasználó azonosító (usertag) lekérése
    const [userRows] = await conn.query('SELECT usertag FROM users WHERE usertoken = ? LIMIT 1', [req.usertoken]);
    if (!userRows || userRows.length === 0) {
        pool.releaseConnection(conn);
        throw new Error('USER_NOT_FOUND');
    }
    const usertag = userRows[0].usertag;
    // #endregion

    if (enable) {
        // #region TOTP titok generálása és OTPAuth URI összeállítása (30s periódus, 6 digit)
        const secret = otpauth.Secret.fromRandom().toString(); // Base32 titok
        const otpauthURL = new otpauth.URI({
            secret: secret,
            label: `${usertag} - LicitGO`,
            issuer: 'LicitGO',
            type: 'totp',
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
        });
        // #endregion

        // #region Tartalék kódok generálása (10x 8 karakter)
        const backupCodes = [];
        for (let i = 0; i < 10; i++) {
            const code = otpauth.Secret.fromRandom().toString().slice(0, 8);
            backupCodes.push(code);
        }
        const backupCodesString = backupCodes.join(',');
        // #endregion

        // #region 2FA bekapcsolása, titok és backup kódok mentése
        await conn.query('UPDATE users SET tfaenabled = 1, tfasecret = ?, tfabackupcodes = ? WHERE usertoken = ?', [secret, backupCodesString, req.usertoken]);
        // #endregion

        // #region Kapcsolat elengedése és válasz (nem küldünk vissza titkot, csak QR/URI)
        pool.releaseConnection(conn);
        return res.status(200).json({
            message: lang === 'HU' ? 'Kétlépcsős azonosítás engedélyezve.' : 'Two-factor authentication enabled.',
            otpauthURL: otpauthURL.toString(),
        });
        // #endregion
    }
    
    else {
        // #region 2FA letiltása és titok törlése
        await conn.query('UPDATE users SET tfaenabled = 0, tfasecret = NULL, tfabackupcodes = NULL WHERE usertoken = ?', [req.usertoken]);
        // #endregion

        // #region Kapcsolat elengedése és válasz
        pool.releaseConnection(conn);
        return res.status(200).json({
            message: lang === 'HU' ? 'Kétlépcsős azonosítás letiltva.' : 'Two-factor authentication disabled.',
        });
        // #endregion
    }
}