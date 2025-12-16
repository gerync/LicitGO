// Kijelentkezés: auth süti törlése
export default async function Logout(req, res) {
    // #region Nyelvi beállítás lekérése, auth süti létezésének ellenőrzése - már bejelentkezettvan-e
    const lang = (req.cookies.language || 'EN').toUpperCase();
    const authToken = req.cookies.auth;
    if (!authToken) {
        return res.status(400).send(lang === 'HU' ? 'Nincs bejelentkezve.' : 'You are not logged in.');
    }
    // #endregion

    // #region Auth süti törlése, sikeres válasz visszaadása felhasználónak (200)
    res.clearCookie('auth');
    return res.status(200).send(lang === 'HU' ? 'Sikeres kijelentkezés.' : 'Logout successful.');
    // #endregion
}