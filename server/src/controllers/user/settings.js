import pool from '../../database/DB.js';

export async function setUserSettings(req, res) {
    const lang = (req.cookies.language || 'EN').toUpperCase();
    const usertoken = req.usertoken;
    const { language, darkmode, currency } = req.body;
    const cookieBase = { maxAge: 30 * 24 * 60 * 60 * 1000, sameSite: 'lax' };
    // Adatbázis frissítés csak bejelentkezve felhasználók számára
    if (usertoken) {
        const updateFields = [];
        const updateParams = [];
        const conn = await pool.getConnection();

        if (language) {
            updateFields.push('language = ?');
            updateParams.push(language); // Már ellenőrzötten van a middleware-ben
        }
        if (darkmode !== undefined) {
            updateFields.push('darkmode = ?');
            updateParams.push(darkmode === 'true' || darkmode === true ? 1 : 0);
        }
        if (currency) {
            updateFields.push('currency = ?');
            updateParams.push(currency); // Már ellenőrzötten van a middleware-ben
        }

        if (updateFields.length > 0) {
            const updateQuery = `UPDATE settings SET ${updateFields.join(', ')} WHERE usertoken = ?`;
            updateParams.push(usertoken);
            const [result] = await conn.query(updateQuery, updateParams);

            // Ellenőrizze, hogy az update sikeres volt-e
            if (!result || result.affectedRows === 0) {
                pool.releaseConnection(conn);
                return res.status(500).json({ error: lang === 'HU' ? 'Az adatbázis frissítése sikertelen.' : 'Database update failed.' });
            }
        }
        pool.releaseConnection(conn);
    }

    // Süti beállítás (bejelentkezve és nem bejelentkezve felhasználók számára)
    if (language) {
        res.cookie('language', language, cookieBase);
    }
    if (darkmode !== undefined) {
        res.cookie('darkmode', darkmode.toString(), cookieBase);
    }
    if (currency) {
        res.cookie('currency', currency, cookieBase);
    }

    return res.status(200).json({ message: lang === 'HU' ? 'Beállítások sikeresen frissítve.' : 'Settings updated successfully.' });
}