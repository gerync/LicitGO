import ObjectLength from '../../utilities/ObjectLength.js';

export default function LoginMiddleware(req, res, next) {
    // #region Nyelvi beállítás sütiből, bejelentkezési státusz - ha van auth süti, akkor már bejelentkezve
    const lang = req.lang;
    const authToken = req.cookies.auth;
    if (authToken) {
        throw new Error([ lang === 'HU' ? 'Már be vagy jelentkezve.' : 'You are already logged in.', 400 ]);
    }
    // #endregion

    // #region Kérés test paraméterek kiemelése, kötelező mezők, tipos ellenőrzés, mezőszám validálás (2-3)
    const { identifier, password, keeplogin } = req.body;
    if (!identifier || !password) {
        throw new Error([ lang === 'HU' ? 'Hiányzó bejelentkezési adatok.' : 'Missing login credentials.', 400 ]);
    }
    if (keeplogin && typeof keeplogin !== 'boolean') {
        throw new Error([ lang === 'HU' ? 'Érvénytelen maradjak bejelentkezve mező.' : 'Invalid keep me logged in field.', 400 ]);
    }
    if (ObjectLength(req.body, 2, 3) !== 0) {
        throw new Error([ lang === 'HU' ? 'Érvénytelen bejelentkezési mezők.' : 'Invalid login fields.', 400 ]);
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