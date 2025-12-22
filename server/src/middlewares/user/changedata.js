import regexes from '../../utilities/Regexes.js';
import ObjectLength from '../../utilities/ObjectLength.js';

export default function changeDataMiddleware(req, res, next) {
    // #region Nyelvi beállítás sütiből, kérés test paraméterek kiemelése, legalább egy módosítható mező kötelező
    const lang = req.lang;
    let { usertag, fullname, mobile, gender } = req.body;
    if (!usertag && !fullname && !mobile && !gender) {
        throw new Error(lang === 'HU' ? 'Nincs megváltoztatandó adat megadva.' : 'No data to change provided.', 400);
    }
    // #endregion

    // #region Nem string típusú paraméterek (usertag, fullname, mobile, gender) string-gé konvertálása
    if (usertag && typeof usertag !== 'string') {
        req.body.usertag = usertag.toString();
        usertag = req.body.usertag;
    }
    if (fullname && typeof fullname !== 'string') {
        req.body.fullname = fullname.toString();
        fullname = req.body.fullname;
    }
    if (mobile && typeof mobile !== 'string') {
        req.body.mobile = mobile.toString();
        mobile = req.body.mobile;
    }
    if (gender && typeof gender !== 'string') {
        req.body.gender = gender.toString();
        gender = req.body.gender;
    }
    // #endregion

    // #region Módosításra köldött paraméterek száma (1-4 között), -1 vagy 1 vis, ha kevesebb vagy több
    if (ObjectLength(req.body, 1, 4) == -1) {
        throw new Error(lang === 'HU' ? 'Nincs megváltoztatandó adat megadva.' : 'No data to change provided.', 400);
    }
    if (ObjectLength(req.body, 1, 4) == 1) {
        throw new Error(lang === 'HU' ? 'Túl sok adat lett megadva.' : 'Too many data provided.', 400);
    }
    // #endregion

    // #region Regex pattern ellenőrzés: usertag, fullname, mobile formátum, gender hossz 10 karakteren belül
    if (usertag && !regexes.usertag.test(usertag)) {
        throw new Error(lang === 'HU' ? 'Érvénytelen felhasználónév formátum.' : 'Invalid usertag format.', 400);
    }
    if (fullname && !regexes.fullname.test(fullname)) {
        throw new Error(lang === 'HU' ? 'Érvénytelen teljes név formátum.' : 'Invalid fullname format.', 400);
    }
    if (mobile && !regexes.mobile.test(mobile)) {
        throw new Error(lang === 'HU' ? 'Érvénytelen mobiltelefonszám formátum.' : 'Invalid mobile number format.', 400);
    }
    if (gender && gender.length > 10 ) {
        throw new Error(lang === 'HU' ? 'A gender nem lehet hosszabb 10 karakternél.' : 'Gender cannot be longer than 10 characters.', 400);
    }
    // #endregion

    next();
}