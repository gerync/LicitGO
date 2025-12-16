// Middleware: Kétlépcsős azonosítás verify validálás (code mező)

export default function verifyTFAMiddleware(req, res, next) {
    // #region Nyelvbeállítás és code mező ellenőrzése
    const lang = (req.cookies.language || 'EN').toUpperCase();
    let { code } = req.body;
    
    if (!code) {
        return res.status(400).send(lang === 'HU' ? 'A 2FA kód megadása kötelező.' : '2FA code is required.');
    }
    
    if (typeof code !== 'string') {
        req.body.code = code.toString();
        code = req.body.code;
    }
    // #endregion

    // #region Code formátum ellenőrzése (6 számjegy)
    const codePattern = /^\d{6}$/;
    if (!codePattern.test(code)) {
        return res.status(400).send(lang === 'HU' ? 'Érvénytelen 2FA kód formátum (6 számjegy szükséges).' : 'Invalid 2FA code format (6 digits required).');
    }
    // #endregion

    // #region Objektum mezőszám ellenőrzése (pontosan 1 mező)
    const bodyKeys = Object.keys(req.body);
    if (bodyKeys.length !== 1) {
        return res.status(400).send(lang === 'HU' ? 'Csak a code mező engedélyezett.' : 'Only the code field is allowed.');
    }
    // #endregion

    next();
}
