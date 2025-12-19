import ObjectLength from '../../utilities/ObjectLength.js';

export default function LoginMiddleware(req, res, next) {
    // #region Nyelvi beállítás sütiből, bejelentkezési státusz - ha van auth süti, akkor már bejelentkezve
    const lang = (req.cookies.language || 'EN').toUpperCase();
    const authToken = req.cookies.auth;
    if (authToken) {
        return res.status(400).json({ error: lang === 'HU' ? 'Már be vagy jelentkezve.' : 'You are already logged in.' });
    }
    // #endregion

    // #region Kérés test paraméterek kiemelése, kötelező mezők, tipos ellenőrzés, mezőszám validálás (2-3)
    const { identifier, password, keeplogin } = req.body;
    if (!identifier || !password) {
        return res.status(400).json({ error: lang === 'HU' ? 'Hiányzó bejelentkezési adatok.' : 'Missing login credentials.' });
    }
    if (keeplogin && typeof keeplogin !== 'boolean') {
        return res.status(400).json({ error: lang === 'HU' ? 'Érvénytelen maradjak bejelentkezve mező.' : 'Invalid keep me logged in field.' });
    }
    if (ObjectLength(req.body, 2, 3) !== 0) {
        return res.status(400).json({ error: lang === 'HU' ? 'Érvénytelen bejelentkezési mezők.' : 'Invalid login fields.' });
    }
    // #endregion

    // #region Nem string típusú paraméterek (identifier, password) string-gé konvertálása
    if (typeof identifier !== 'string') {
        req.body.identifier = identifier.toString();
    }
    if (typeof password !== 'string') {
        req.body.password = password.toString();
    }
    // #endregion

    next();
}