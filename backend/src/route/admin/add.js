import express from 'express';
import handleStatus from '../../lang/HandleStatus.js';
import DBconnection from '../../db/connection.js';
import UseDB from '../../db/UseDB.js';
import argon2 from 'argon2';

const router = express.Router();

router.post('/', async (req, res) => {
    let lang = req.headers['accept-language'] || 'EN';
    const conn = await DBconnection.getConnection();
    if (!lang.toUpperCase().includes('EN') && !lang.toUpperCase().includes('HU')) {
        lang = 'EN';
    }
    const { email, usertag, mobile, fullname, password, birthdate, gender } = req.body;
    const hashedPassword = await argon2.hash(password);
    const sql = 'INSERT INTO users (email, usertag, mobile, fullname, password, birthdate, gender, createdat, type) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), "admin")';
    const params = [email, usertag, mobile, fullname, hashedPassword, birthdate, gender];
    const result = await UseDB(sql, params);
    if (result.affectedRows === 0) {
        conn.release();
        return res.status(500).json({ message: handleStatus('1500', lang) });
    }
    res.status(201).json({ message: handleStatus('201', lang) });
    conn.release();
});

export default router;