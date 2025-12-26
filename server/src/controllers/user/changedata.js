import { encryptData, decryptData } from '../../utilities/Encrypt.js';
import { hashEmail, hashMobile } from '../../utilities/Hash.js';
import pool from '../../database/DB.js';

export async function changeDataController(req, res) {
    // #region Kapcsolat és adatkiemelés
    const lang = req.lang;
    const conn = await pool.getConnection();
    const { usertag, fullname, mobile, gender } = req.body;
    const updates = [];
    const params = [];
    // #endregion

    // #region Felhasználónév egyediség ellenőrzés és frissítés
    if (usertag) {
        const usertagQuery = 'SELECT COUNT(*) AS count FROM users WHERE usertag = ? AND usertoken != ?';
        const usertagParams = [usertag, req.usertoken];
        const [usertagRows] = await conn.query(usertagQuery, usertagParams);
        if (usertagRows[0].count > 0) {
            pool.releaseConnection(conn);
            throw new Error([ lang === 'HU' ? 'A felhasználónév már foglalt.' : 'The usertag is already taken.', 409 ]);
        }
        updates.push('usertag = ?');
        params.push(usertag);
    }
    // #endregion

    // #region Teljes név frissítése
    if (fullname) {
        const encryptedFullname = encryptData(fullname);
        updates.push('fullname = ?');
        params.push(encryptedFullname);
    }
    // #endregion

    // #region Telefonszám titkosítás és egyediség ellenőrzés
    if (mobile) {
        const mobileHash = hashMobile(mobile);
        const [mobileRows] = await conn.query('SELECT COUNT(*) AS count FROM users WHERE mobile_hash = ? AND usertoken != ?', [mobileHash, req.usertoken]);
        if (mobileRows[0].count > 0) {
            pool.releaseConnection(conn);
            throw new Error([ lang === 'HU' ? 'A telefonszám már foglalt.' : 'The mobile number is already taken.', 409 ]);
        }
        const encryptedMobile = encryptData(mobile);
        updates.push('mobile = ?, mobile_hash = ?');
        params.push(encryptedMobile, mobileHash);
    }
    // #endregion

    // #region Nem frissítése
    if (gender) {
        updates.push('gender = ?');
        params.push(gender);
    }
    // #endregion

    // #region Üres frissítések ellenőrzés és adatbázis művelet
    if (updates.length === 0) {
        pool.releaseConnection(conn);
        throw new Error([ lang === 'HU' ? 'Nincs frissítendő adat.' : 'No data to update.', 400 ]);
    }

    params.push(req.usertoken);
    const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE usertoken = ?`;
    const [result] = await conn.query(updateQuery, params);
    pool.releaseConnection(conn);
    // #endregion

    // #region Válasz kezelése
    if (result.affectedRows === 1) {
        return res.status(200).json({ message: lang === 'HU' ? 'Adatok sikeresen frissítve.' : 'Data updated successfully.' });
    }
    else {
        throw new Error([ lang === 'HU' ? 'Hiba történt az adatok frissítése során.' : 'An error occurred while updating data.', 500 ]);
    }
    // #endregion
}

// Felhasználói alapadatok lekérése és érzékeny mezők maszkolása
export async function getUserData(req, res) {
    // #region Kapcsolat és adatok lekérése
    const lang = (req.cookies.language || 'EN').toUpperCase();
    const conn = await pool.getConnection();
    const usertoken = req.usertoken;
    const query = 'SELECT usertag, fullname, mobile, gender, birthdate, email FROM users WHERE usertoken = ?';
    const params = [usertoken];
    const [rows] = await conn.query(query, params);
    pool.releaseConnection(conn);
    // #endregion

    // #region Adatok maszkolása és válasz építése
    if (rows.length === 1) {
        // Email maszkolása: csak az első és utolsó karakterek láthatók
        let email = decryptData(rows[0].email);
        const atIndex = email.indexOf('@');
        if (atIndex > 4) {
            const emailName = email.substring(0, atIndex);
            const domain = email.substring(atIndex);
            const maskedName = emailName.substring(0, 2) + '*'.repeat(emailName.length - 4) + emailName.substring(emailName.length - 2);
            email = maskedName + domain;
        } else {
            email = email[0] + '*'.repeat(email.length - 2) + email[email.length - 1];
        }
        // Telefonszám maszkolása: eleje és vége megmarad
        let mobile = decryptData(rows[0].mobile);
        if (mobile.length > 6) {
            mobile = mobile.substring(0, 2) + '*'.repeat(mobile.length - 6) + mobile.substring(mobile.length - 4);
        } else {
            mobile = mobile[0] + '*'.repeat(mobile.length - 2) + mobile[mobile.length - 1];
        }
        const userData = {
            usertag: rows[0].usertag,
            fullname: decryptData(rows[0].fullname),
            mobile: mobile,
            gender: rows[0].gender,
            birthdate: rows[0].birthdate,
            email: email
        };
        return res.status(200).send(userData);
    } else {
        res.clearCookie('auth');
        return res.status(404).json({ error: lang === 'HU' ? 'Felhasználó nem található.' : 'User not found.' });
    }
    // #endregion
}

export default {
    changeDataController,
    getUserData,
};