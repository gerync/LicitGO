// Middleware: 2FA engedélyezési kérés validálása - opcionális kód paraméter ellenőrzése
export function EnableTwoFactorMiddleware(req, res, next) {
    // #region Nyelvbeállítás és paraméterek lekérése
    const lang = req.lang;
    const { code } = req.body;
    // #endregion

    // #region Ha kód meg van adva, 6 számjegy formátum ellenőrzése
    if (code !== undefined && code !== null && code !== '') {
        // Ellenőrzi, hogy a kód 6 számjegyű
        if (!/^\d{6}$/.test(code)) {
            throw new Error([
                lang === 'HU' ? 'Érvénytelen kód formátum. 6 számjegy szükséges.' : 'Invalid code format. 6 digits required.',
                400
            ]);
        }
    }
    // #endregion

    next();
}
