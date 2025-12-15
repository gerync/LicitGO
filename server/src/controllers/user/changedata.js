import { encryptData, decryptData } from '../../utilities/Encrypt.js';
import DB from '../../database/DB.js';

export async function changeDataController(req, res) {
    const lang = req.cookies.language.toUpperCase() || 'EN';
    const conn = await DB.pool.getConnection();
    const { usertag, fullname, mobile, gender } = req.body;
    const updates = [];
    const params = [];
    // Felhasználónév ütközés vizsgálata módosítás előtt
    if (usertag) {
        const usertagQuery = 'SELECT COUNT(*) AS count FROM users WHERE usertag = ? AND usertoken != ?';
        const usertagParams = [usertag, req.usertoken];
        const usertagRows = await DB.use(usertagQuery, usertagParams);
        if (usertagRows[0].count > 0) {
            conn.release();
            return res.status(409).send(lang === 'HU' ? 'A felhasználónév már foglalt.' : 'The usertag is already taken.');
        }
        updates.push('usertag = ?');
        params.push(usertag);
    }
    if (fullname) {
        const encryptedFullname = encryptData(fullname);
        updates.push('fullname = ?');
        params.push(encryptedFullname);
    }
    if (mobile) {
        // Telefonszám titkosítása és egyediségi ellenőrzése
        const encryptedMobile = encryptData(mobile);
        const mobileQuery = 'SELECT COUNT(*) AS count FROM users WHERE mobile = ? AND usertoken != ?';
        const mobileParams = [encryptedMobile, req.usertoken];
        const mobileRows = await DB.use(mobileQuery, mobileParams);
        if (mobileRows[0].count > 0) {
            conn.release();
            return res.status(409).send(lang === 'HU' ? 'A telefonszám már foglalt.' : 'The mobile number is already taken.');
        }
        updates.push('mobile = ?');
        params.push(encryptedMobile);
    }
    if (gender) {
        updates.push('gender = ?');
        params.push(gender);
    }

    // Nincs módosítható mező
    if (updates.length === 0) {
        conn.release();
        return res.status(400).send(lang === 'HU' ? 'Nincs frissítendő adat.' : 'No data to update.');
    }

    params.push(req.usertoken);
    // Dinamikus UPDATE a csak módosított mezőkre
    const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE usertoken = ?`;
    const result = await DB.use(updateQuery, params);
    conn.release();
    if (result.affectedRows === 1) {

        return res.status(200).send(lang === 'HU' ? 'Adatok sikeresen frissítve.' : 'Data updated successfully.');
    }
    else {
        return res.status(500).send(lang === 'HU' ? 'Hiba történt az adatok frissítése során.' : 'An error occurred while updating data.');
    }
}

export async function getUserData(req, res) {
    const lang = req.cookies.language.toUpperCase() || 'EN';
    const conn = await DB.pool.getConnection();
    const usertoken = req.usertoken;
    const query = 'SELECT usertag, fullname, mobile, gender, birthdate, email FROM users WHERE usertoken = ?';
    const params = [usertoken];
    const rows = await DB.use(query, params);
    conn.release();
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
        return res.status(404).send(lang === 'HU' ? 'Felhasználó nem található.' : 'User not found.');
    }
}