// Kijelentkezés: auth süti törlése
export default async function Logout(req, res) {
    const lang = req.cookies.language.toUpperCase() || 'EN'
    const authToken = req.cookies.auth;
    if (!authToken) {
        return res.status(400).send(lang === 'HU' ? 'Nincs bejelentkezve.' : 'You are not logged in.');
    }
    res.clearCookie('auth');
    return res.status(200).send(lang === 'HU' ? 'Sikeres kijelentkezés.' : 'Logout successful.');
}