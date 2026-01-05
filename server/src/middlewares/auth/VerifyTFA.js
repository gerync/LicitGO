import tempTokenMiddleware from './tempToken.js';

// Middleware: 2FA kód validálása - temp token ellenőrzése és kód formátum ellenőrzése
export default function VerifyTwoFactorMiddleware(req, res, next) {
    // #region Temp token ellenőrzése először
    tempTokenMiddleware(req, res, () => {
        // #region Nyelvbeállítás és 2FA kód lekérése
        const lang = req.lang;
        const { code } = req.body;
        // #endregion

        // #region 2FA kód validálása (6 számjegy)
        if (!code) {
            throw new Error([
                lang === 'HU' ? 'A kétlépcsős azonosítási kód megadása kötelező.' : 'Two-factor authentication code is required.',
                400
            ]);
        }

        // Ellenőrzi, hogy a kód 6 számjegyű
        if (!/^\d{6}$/.test(code)) {
            throw new Error([
                lang === 'HU' ? 'Érvénytelen kód formátum. 6 számjegy szükséges.' : 'Invalid code format. 6 digits required.',
                400
            ]);
        }
        // #endregion

        req.tfaCode = code;
        next();
    });
}
