import ObjectLenght from "../../utilities/ObjectLenght.js";
import jwt from "jsonwebtoken";
import configs from "../../configs/Configs.js";

// Felhasználói beállítások validálása: mennyiség, típus, értékkészlet; JWT-ből usertoken kiemelése
export default async function userSettings(req, res, next) {
    // #region Nyelvi beállítás sütiből, kérés test paraméterek kiemelése (language, darkmode, currency), legalább egy mező kötelező
    const lang = (req.cookies.language || 'EN').toUpperCase();
    const { language, darkmode, currency } = req.body;
    if (!language && !darkmode && !currency) {
        return res.status(400).send(lang === 'HU' ? 'Nincsenek megadva beállítások.' : 'No settings provided.');
    }
    // #endregion

    // #region Mezőszám ellenőrzés (1-3 között), nem string típusok stringgé konvertálása mentett előtt
    if (ObjectLenght(req.body, 1, 3) !== 0) {
        return res.status(400).send(lang === 'HU' ? 'Érvénytelen számú beállítás.' : 'Invalid number of settings.');
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

    // #region JWT dekódolás ha létezik auth süti, usertoken kiemelése az ősszekapcsolt (decoded) objektumből req.usertoken-be
    const authToken = req.cookies.auth;
    if (authToken) {
        // Token dekódolás: hibánál a vezérlés átmegy a globális hibakezelőre
        const decoded = jwt.verify(authToken, configs.jwtSecret);
        if (decoded.usertoken) {
            req.usertoken = decoded.usertoken;
        }
    }
    // #endregion

    // #region Beállítások érték ellenőrzése: language (EN/HU), darkmode (true/false), currency (USD/EUR/HUF)
    if (language && ![ 'EN', 'HU' ].includes(language.toUpperCase())) {
        return res.status(400).send(lang === 'HU' ? 'Érvénytelen nyelv.' : 'Invalid language.');
    }
    if (darkmode && darkmode !== 'true' && darkmode !== 'false') {
        return res.status(400).send(lang === 'HU' ? 'Érvénytelen sötét mód érték.' : 'Invalid dark mode value.');
    }
    if (currency && !['USD', 'EUR', 'HUF' ].includes(currency.toUpperCase())) {
        return res.status(400).send(lang === 'HU' ? 'Érvénytelen pénznem.' : 'Invalid currency.');
    }
    // #endregion

    next();
}