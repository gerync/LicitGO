import DB from '../../../database/DB.js';
import argon from 'argon2';

export default async function changePasswordController(req, res) {
    const lang = (req.cookies.language || 'EN').toUpperCase();
    const { currentPassword, newPassword } = req.body;
    const usertoken = req.usertoken;

    const user = await DB.use('SELECT passwordhash FROM users WHERE usertoken = ?', [usertoken]);
    if (user.length === 0) {
        res.clearCookie('auth');
        return res.status(404).send(lang === 'HU' ? 'Felhasználó nem található.' : 'User not found.');
    }

    const passwordHash = user[0].passwordhash;
    const passwordMatch = await argon.verify(passwordHash, currentPassword);
    if (!passwordMatch) {
        return res.status(400).send(lang === 'HU' ? 'A jelenlegi jelszó helytelen.' : 'Current password is incorrect.');
    }

    const newPasswordHash = await argon.hash(newPassword);
    await DB.use('UPDATE users SET passwordhash = ? WHERE usertoken = ?', [newPasswordHash, usertoken]);

    return res.status(200).send(lang === 'HU' ? 'Jelszó sikeresen megváltoztatva.' : 'Password changed successfully.');
}