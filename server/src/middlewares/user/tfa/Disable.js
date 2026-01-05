// Middleware: 2FA letiltási kérés validálása - 2FA kód, backup kód, vagy email kód szükséges
export function DisableTwoFactorMiddleware(req, res, next) {
    // #region Nyelvbeállítás és paraméterek lekérése
    const lang = req.lang;
    const { tfaCode, backupCode, emailCode, requestEmail } = req.body;
    // #endregion

    // #region Ha email kérés van, csak azt engedélyezzük
    if (requestEmail === true) {
        next();
        return;
    }
    // #endregion

    // #region Legalább egy módszer megadásának ellenőrzése
    if (!tfaCode && !backupCode && !emailCode) {
        throw new Error([
            lang === 'HU' ? 'Adjon meg 2FA kódot, backup kódot, vagy email kódot a letiltáshoz.' : 'Provide 2FA code, backup code, or email code to disable.',
            400
        ]);
    }
    // #endregion

    // #region 2FA kód formátum ellenőrzése (ha megadva)
    if (tfaCode !== undefined && tfaCode !== null && tfaCode !== '') {
        if (!/^\d{6}$/.test(tfaCode)) {
            throw new Error([
                lang === 'HU' ? 'Érvénytelen 2FA kód formátum. 6 számjegy szükséges.' : 'Invalid 2FA code format. 6 digits required.',
                400
            ]);
        }
    }
    // #endregion

    // #region Email kód formátum ellenőrzése (ha megadva)
    if (emailCode !== undefined && emailCode !== null && emailCode !== '') {
        if (!/^\d{6}$/.test(emailCode)) {
            throw new Error([
                lang === 'HU' ? 'Érvénytelen email kód formátum. 6 számjegy szükséges.' : 'Invalid email code format. 6 digits required.',
                400
            ]);
        }
    }
    // #endregion

    // #region Backup kód formátum ellenőrzése (ha megadva)
    if (backupCode !== undefined && backupCode !== null && backupCode !== '') {
        if (!/^[A-Z0-9]{8,16}$/i.test(backupCode)) {
            throw new Error([
                lang === 'HU' ? 'Érvénytelen backup kód formátum.' : 'Invalid backup code format.',
                400
            ]);
        }
    }
    // #endregion

    next();
}
