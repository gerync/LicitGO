export default function profileMiddleware(req, res, next) {
    // #region Felhasználói azonosító (usertag) ellenőrzése a kérés paramétereiben vagy sütikben
    let usertag = req.params.usertag;
    const lang = req.lang;

    if (!usertag) {
        usertag = req.cookies.usertag;
    }
    if (!usertag) {
        // Ha nincs usertag sem a paraméterek között, sem a sütik között, hibát dob
        throw new Error(lang === 'HU' ? 'Hiányzó felhasználói azonosító.' : 'Missing user identifier.', 400);
    }
    // #endregion
    // A felhasználói azonosítót kisbetűssé alakítja
    req.params.usertag = usertag.toLowerCase();
    next();
}