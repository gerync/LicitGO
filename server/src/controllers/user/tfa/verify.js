import DB from '../../../database/DB.js';
import otpauth from 'otpauth';

// Kétlépcsős azonosítás (2FA) ellenőrzése TOTP kóddal
export default async function verifyTFAController(req, res) {
    // #region Kapcsolat és adatkiemelés
    const lang = (req.cookies.language || 'EN').toUpperCase();
    const { code } = req.body;
    const conn = await DB.pool.getConnection();
    // #endregion

    try {
        // #region Felhasználó 2FA titkának és státuszának lekérése
        const [userRows] = await conn.query('SELECT tfaenabled, tfasecret FROM users WHERE usertoken = ? LIMIT 1', [req.usertoken]);
        if (!userRows || userRows.length === 0) {
            return res.status(404).send(lang === 'HU' ? 'Felhasználó nem található.' : 'User not found.');
        }
        const { tfaenabled, tfasecret } = userRows[0];
        if (!tfaenabled || !tfasecret) {
            return res.status(400).send(lang === 'HU' ? 'A kétlépcsős azonosítás nincs engedélyezve.' : 'Two-factor authentication is not enabled.');
        }
        // #endregion

        // #region TOTP token validálása
        const totp = new otpauth.TOTP({
            secret: otpauth.Secret.fromBase32(tfasecret),
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
        });
        const delta = totp.validate({ token: code, window: 1 }); // ±1 time window (30s)
        if (delta === null) {
            return res.status(401).send(lang === 'HU' ? 'Érvénytelen kód.' : 'Invalid code.');
        }
        // #endregion

        // #region Sikeres ellenőrzés válasza
        return res.status(200).json({
            message: lang === 'HU' ? 'Kód sikeresen ellenőrizve.' : 'Code verified successfully.',
        });
        // #endregion
    } catch (err) {
        return res.status(500).send(lang === 'HU' ? 'Szerver hiba történt.' : 'Internal server error.');
    } finally {
        // #region Kapcsolat lezárása
        conn.release();
        // #endregion
    }
}
