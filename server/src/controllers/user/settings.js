import DB from '../../database/DB.js';

export async function setUserSettings(req, res) {
    const conn = await DB.pool.getConnection();
    const lang = (req.cookies.language || 'EN').toUpperCase();
    const { language, darkmode, currency } = req.body;
    const usertoken = req.usertoken;
    const updateFields = [];
    const updateParams = [];
    if (language) {
        updateFields.push('language = ?');
        updateParams.push(language.toUpperCase());
    }
    if (darkmode) {
        updateFields.push('darkmode = ?');
        updateParams.push(darkmode === 'true' ? 1 : 0);
    }
    if (currency) {
        updateFields.push('currency = ?');
        updateParams.push(currency.toUpperCase());
    }
    if (updateFields.length === 0) {
        conn.release();
        return res.status(400).send(lang === 'HU' ? 'Nincsenek megadva beállítások a frissítéshez.' : 'No settings provided for update.');
    }
    if (usertoken) {
        updateFields.push('usertoken = ?');
        updateParams.push(usertoken);
        const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE usertoken = ?`;
        updateParams.push(usertoken);
        await DB.use(updateQuery, updateParams);
    }
    conn.release();
    res.cookie('language', language || req.cookies.language, { maxAge: 30 * 24 * 60 * 60 * 1000 });
    res.cookie('darkmode', darkmode || req.cookies.darkmode, { maxAge: 30 * 24 * 60 * 60 * 1000 });
    res.cookie('currency', currency || req.cookies.currency, { maxAge: 30 * 24 * 60 * 60 * 1000 });
    return res.status(200).send(lang === 'HU' ? 'Beállítások sikeresen frissítve.' : 'Settings updated successfully.');
}