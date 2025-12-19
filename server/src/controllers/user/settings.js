import DB from '../../database/DB.js';

export async function setUserSettings(req, res) {
    const conn = await DB.pool.getConnection();
    const lang = (req.cookies.language || 'EN').toUpperCase();
    const usertoken = req.usertoken;
    const { language, darkmode, currency } = req.body;

    const updateFields = [];
    const updateParams = [];

    if (language) {
        updateFields.push('language = ?');
        updateParams.push(language.toUpperCase());
    }
    if (darkmode !== undefined) {
        updateFields.push('darkmode = ?');
        updateParams.push(darkmode === 'true' || darkmode === true ? 1 : 0);
    }
    if (currency) {
        updateFields.push('currency = ?');
        updateParams.push(currency.toUpperCase());
    }

    if (updateFields.length === 0) {
        conn.release();
        return res.status(400).send(lang === 'HU' ? 'Nincsenek megadva beállítások a frissítéshez.' : 'No settings provided for update.');
    }

    const updateQuery = `UPDATE settings SET ${updateFields.join(', ')} WHERE usertoken = ?`;
    updateParams.push(usertoken);
    await DB.use(updateQuery, updateParams);

    conn.release();

    const cookieBase = { maxAge: 30 * 24 * 60 * 60 * 1000, sameSite: 'lax' };
    res.cookie('language', language || req.cookies.language, cookieBase);
    res.cookie('darkmode', darkmode !== undefined ? darkmode.toString() : req.cookies.darkmode, cookieBase);
    res.cookie('currency', currency || req.cookies.currency, cookieBase);

    return res.status(200).send(lang === 'HU' ? 'Beállítások sikeresen frissítve.' : 'Settings updated successfully.');
}