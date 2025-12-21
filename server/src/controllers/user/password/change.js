import pool from '../../../database/DB.js';
import argon from 'argon2';

export default async function changePasswordController(req, res) {
    const lang = (req.cookies.language || 'EN').toUpperCase();
    const { currentPassword, newPassword } = req.body;
    const usertoken = req.usertoken;
    const conn = await pool.getConnection();

    const [user] = await conn.query('SELECT passwordhash FROM users WHERE usertoken = ?', [usertoken]);
    if (user.length === 0) {
        pool.releaseConnection(conn);
        res.clearCookie('auth');
        return res.status(404).json({ error: lang === 'HU' ? 'Felhasználó nem található.' : 'User not found.' });
    }

    const passwordHash = user[0].passwordhash;
    const passwordMatch = await argon.verify(passwordHash, currentPassword);
    if (!passwordMatch) {
        pool.releaseConnection(conn);
        return res.status(400).json({ error: lang === 'HU' ? 'A jelenlegi jelszó helytelen.' : 'Current password is incorrect.' });
    }

    const newPasswordHash = await argon.hash(newPassword);
    await conn.query('UPDATE users SET passwordhash = ? WHERE usertoken = ?', [newPasswordHash, usertoken]);
    pool.releaseConnection(conn);

    return res.status(200).json({ message: lang === 'HU' ? 'Jelszó sikeresen megváltoztatva.' : 'Password changed successfully.' });
}