// Middleware: Kétlépcsős azonosítás verify validálás (code mező)

export default function verifyTFAMiddleware(req, res, next) {
    // #region Nyelvbeállítás és code mező ellenőrzése
    const lang = req.lang;
    let { code } = req.body;
    
    if (!code) {
        throw new Error(lang === 'HU' ? 'A code mező megadása kötelező.' : 'The code field is required.', 400);
    }
    
    if (typeof code !== 'string') {
        req.body.code = code.toString();
        code = req.body.code;
    }
    // #endregion

    // #region Code formátum ellenőrzése (6 számjegy)
    const codePattern = /^\d{6}$/;
    if (!codePattern.test(code)) {
        throw new Error(lang === 'HU' ? 'Érvénytelen 2FA kód formátum (6 számjegy szükséges).' : 'Invalid 2FA code format (6 digits required).', 400);
    }
    // #endregion

    // #region Objektum mezőszám ellenőrzése (pontosan 1 mező)
    const bodyKeys = Object.keys(req.body);
    if (bodyKeys.length !== 1) {
        throw new Error(lang === 'HU' ? 'Csak a code mező engedélyezett.' : 'Only the code field is allowed.', 400);
    }
    // #endregion

    next();
}
