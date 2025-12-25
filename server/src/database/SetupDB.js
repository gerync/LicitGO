import configs from '../configs/Configs.js';
import crypto from 'crypto';
import pool from '../database/DB.js';
import argon2 from 'argon2';
import { encryptData } from '../utilities/Encrypt.js';

function generateUserToken() {
    return crypto.randomBytes(64).toString('hex');
}

export default async function setupDB() {
    
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM users WHERE type = ?', ['superadmin']);
    if (rows[0].count === 0) {
        const usertoken = generateUserToken();
        const { usertag, email, password, fullname, gender, birthdate, mobile } = configs.baseadmin;
        const passwordhash = await argon2.hash(password);
        const encryptedEmail = encryptData(email);
        const encryptedFullname = encryptData(fullname);
        const encryptedMobile = encryptData(mobile);
        const encryptedToken = encryptData(usertoken);
        const insertQuery = `
            INSERT INTO users (usertoken, usertag, passwordhash, email, 
            fullname, gender, birthdate, mobile, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [encryptedToken, usertag, passwordhash, encryptedEmail,
            encryptedFullname, gender === 'male' ? 1 : 0, birthdate, encryptedMobile, 'superadmin'];
        await pool.execute(insertQuery, params);
        if (configs.server.defaultLanguage === 'EN') {
            console.log(`Superadmin created with details: \n
            Usertag: ${usertag} \n
            Email: ${email} \n
            Fullname: ${fullname} \n
            Password: ${password} \n
            Mobile: ${mobile} \n
            \n
            Please keep these credentials safe. \n
            Please change the password after first login.
        `);
        } 
        else {
            console.log(`Superadmin létrehozva a következő adatokkal: \n
            Felhasználónév: ${usertag} \n
            Email: ${email} \n
            Teljes név: ${fullname} \n
            Jelszó: ${password} \n
            Mobil: ${mobile} \n
            \n
            Kérjük, őrizze meg ezeket az adatokat biztonságban. \n
            Kérjük, jelentkezzen be és változtassa meg a jelszavát.
        `);
        }
    }
}