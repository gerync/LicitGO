import configs from '../configs/Configs.js';
import crypto from 'crypto';
import pool from '../database/DB.js';
import argon2 from 'argon2';
import { encryptData } from '../utilities/Encrypt.js';
import hashdata from '../utilities/Hash.js';
import { coloredlog } from '@gerync/utils';

function generateUserToken() {
    return crypto.randomBytes(64).toString('hex');
}

export default async function setupDB() {
    // Ellenőrizzük, hogy létezik-e már superadmin felhasználó
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM users WHERE type = ?', ['superadmin']);

    if (rows[0].count === 0) {
        // #region Ha nincs superadmin, létrehozzuk az alapértelmezett konfiguráció alapján
        const usertoken = generateUserToken();
        const { usertag, email, password, fullname, gender, birthdate, mobile } = configs.baseadmin;
        const passwordhash = await argon2.hash(password);
        const encryptedEmail = encryptData(email);
        const encryptedFullname = encryptData(fullname);
        const encryptedMobile = encryptData(mobile);
        const encryptedToken = encryptData(usertoken);
        const emailHash = hashdata(email);
        const mobileHash = hashdata(mobile);
        const insertQuery = `
            INSERT INTO users (usertoken, usertag, passwordhash, email, email_hash,
            fullname, gender, birthdate, mobile, mobile_hash, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [encryptedToken, usertag, passwordhash, encryptedEmail, emailHash,
            encryptedFullname, gender === 'male' ? 1 : 0, birthdate, encryptedMobile, mobileHash, 'superadmin'];
        await pool.execute(insertQuery, params);
        // #endregion
        // #region Konzolra kiírás
        const colors = configs.colors;
        if (configs.server.defaultLanguage === 'HU') {
            coloredlog([`Alapértelmezett superadmin felhasználó létrehozva!`,
                `Felhasználónév: ${usertag}`,
                `Jelszó: ${password}`,
                `Kérlek, jelentkezz be és változtasd meg a jelszavad!\n`], 
                [colors.success, colors.highlight, colors.warning, colors.error]);
        } else {
            coloredlog([`Default superadmin user created!`,
                `Username: ${usertag}`,
                `Password: ${password}`,
                `Please log in and change your password!\n`], 
                [colors.success, colors.highlight, colors.warning, colors.error]);
        }
        // #endregion
    }
}