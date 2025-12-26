import sendEmail from '../../../email/send.js';
import Configs from '../../../configs/Configs.js';
import pool from '../../../database/DB.js';
import { hashEmail } from '../../../utilities/Hash.js';
import argon from 'argon2';

export async function PasswordResetRequestController(req, res) {
    const email = req.body.email;
    const lang = req.lang;
    const conn = await pool.getConnection();
    const emailHash = hashEmail(email);
    
    // Email hash alapján lekérdezés
    const [results] = await conn.query('SELECT usertag, fullname, usertoken FROM users WHERE email_hash = ?', [emailHash]);
    
    if (results.length === 0) {
        // Nincs ilyen email cím regisztrálva
        conn.release();
        return res.status(200).json({
            message: lang === 'HU' ? 'Ha létezik ilyen email cím, küldtünk egy jelszó visszaállító linket.' : 'If the email exists, a password reset link has been sent.'
        });
    }
    
    const matchedUser = results[0];
    
    const code = Math.floor(100000 + Math.random() * 900000); // 6 jegyű kód
    const usertag = matchedUser.usertag;
    const expiryDate = new Date(Date.now() + Configs.passwordReset.expiryMinutes * 60000);
    await conn.query('INSERT INTO emailcodes (usertoken, code, type, expiresat) VALUES (?, ?, ?, ?)', [matchedUser.usertoken, code, 'password-reset', expiryDate]);
    conn.release();
    // Email küldése
    const subject = lang === 'HU' ? 'Jelszó visszaállító kód' : 'Password Reset Code';
    const info = {
        code: code,
        usertag: usertag
    };
    await sendEmail(email, subject, info, 'reset-password', lang);
    return res.status(200).json({
        message: lang === 'HU' ? 'Ha létezik ilyen email cím, küldtünk egy jelszó visszaállító linket.' : 'If the email exists, a password reset link has been sent.'
    });
}

export async function PasswordResetController(req, res) {
    const code = req.code;
    const newPassword = req.body.newPassword;
    const lang = req.lang;
    const conn = await pool.getConnection();
    
    const [results] = await conn.query('SELECT usertoken, used, expiresat FROM emailcodes WHERE code = ? AND type = ?', [code, 'password-reset']);
    
    if (results.length === 0) {
        conn.release();
        throw new Error(lang === 'HU' ? 'Érvénytelen vagy lejárt jelszó visszaállító kód.' : 'Invalid or expired password reset code.');
    }
    if (results[0].used) {
        conn.release();
        throw new Error(lang === 'HU' ? 'Ez a jelszó visszaállító kód már felhasználásra került.' : 'This password reset code has already been used.');
    }
    const expired = results[0].expiresat;
    if (expired < new Date()) {
        conn.release();
        throw new Error(lang === 'HU' ? 'Ez a jelszó visszaállító kód lejárt.' : 'This password reset code has expired.');
    }
    
    const hashedPassword = await argon.hash(newPassword);
    await conn.query('UPDATE users SET passwordhash = ? WHERE usertoken = ?', [hashedPassword, results[0].usertoken]);
    await conn.query('UPDATE emailcodes SET used = 1 WHERE code = ? AND type = ? AND expiresat > NOW()', [code, 'password-reset']);
    conn.release();
    res.status(200).json({
        success: true,
        message: lang === 'HU' ? 'A jelszó sikeresen visszaállítva.' : 'Password has been successfully reset.'
    });
}
export default {
    PasswordResetRequestController,
    PasswordResetController
};