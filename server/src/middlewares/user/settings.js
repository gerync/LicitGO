import ObjectLength from "../../utilities/ObjectLength.js";
import jwt from "jsonwebtoken";
import configs from "../../configs/Configs.js";

// Felhasználói beállítások validálása: mennyiség, típus, értékkészlet; JWT-ből usertoken kiemelése
export default async function userSettings(req, res, next) {
    // #region Nyelvi beállítás sütiből, kérés test paraméterek kiemelése (language, darkmode, currency), legalább egy mező kötelező
    let lang = req.lang;
    let { language, darkmode, currency } = req.body;
    if (!language && !darkmode && !currency) {
        throw new Error(lang === 'HU' ? 'Nincsenek megadva beállítások.' : 'No settings provided.', 400);
    }
    // #endregion

    // #region Mezőszám ellenőrzés (1-3 között), nem string típusok stringgé konvertálása mentett előtt
    if (ObjectLength(req.body, 1, 3) !== 0) {
        throw new Error(lang === 'HU' ? 'Érvénytelen számú beállítás.' : 'Invalid number of settings.', 400);
    }
    if (language && typeof language !== 'string') {
        req.body.language = language.toString();
        language = language.toString();
    }
    if (darkmode && (typeof darkmode !== 'string' && typeof darkmode !== 'boolean')) {
        req.body.darkmode = darkmode.toString();
        darkmode = darkmode.toString();
    }
    if (currency && typeof currency !== 'string') {
        req.body.currency = currency.toString();
        currency = currency.toString();
    }
    // #endregion

    // #region JWT dekódolás ha létezik auth süti, usertoken kiemelése az ősszekapcsolt (decoded) objektumből req.usertoken-be (nem kötelező)
    const authToken = req.cookies.auth;
    req.usertoken = undefined; // Alapértelmezetten nincs bejelentkezve
    if (authToken) {
        try {
            const decoded = jwt.verify(authToken, configs.jwtSecret);
            if (decoded.usertoken) {
                req.usertoken = decoded.usertoken;
            }
        } catch (err) {
            // Érvénytelen token - nem megakadályozza a kérést, csak az adatbázis update-et
            req.usertoken = undefined;
        }
    }
    // #endregion

    // #region Beállítások érték ellenőrzése: language (EN/HU), darkmode (true/false), currency (USD/EUR/HUF)
    if (language && ![ 'EN', 'HU' ].includes(language.toUpperCase())) {
        throw new Error(lang === 'HU' ? 'Érvénytelen nyelv.' : 'Invalid language.', 400);
    }
    lang = language ? (language.toUpperCase() === 'HU' ? 'HU' : 'EN') : lang;
    if (darkmode && darkmode !== 'true' && darkmode !== 'false') {
        throw new Error(lang === 'HU' ? 'Érvénytelen sötét mód érték.' : 'Invalid dark mode value.', 400);
    }
    if (currency && !['USD', 'EUR', 'HUF' ].includes(currency.toUpperCase())) {
        throw new Error(lang === 'HU' ? 'Érvénytelen pénznem.' : 'Invalid currency.', 400);
    }
    // #endregion

    next();
}