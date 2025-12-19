import regexes from '../../utilities/Regexes.js';
import ObjectLength from '../../utilities/ObjectLength.js';

export default function changeDataMiddleware(req, res, next) {
    // #region Nyelvi beállítás sütiből, kérés test paraméterek kiemelése, legalább egy módosítható mező kötelező
    const lang = (req.cookies.language || 'EN').toUpperCase();
    let { usertag, fullname, mobile, gender } = req.body;
    if (!usertag && !fullname && !mobile && !gender) {
        return res.status(400).json({ error: lang === 'HU' ? 'Nincs megváltoztatandó adat megadva.' : 'No data to change provided.' });
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

    // #region Módosításra köldott paraméterek száma (1-4 között), -1 vagy 1 vis, ha kevesebb vagy több
    if (ObjectLength(req.body, 1, 4) == -1) {
        return res.status(400).json({ error: lang === 'HU' ? 'Nincs megváltoztatandó adat megadva.' : 'No data to change provided.' });
    }
    if (ObjectLength(req.body, 1, 4) == 1) {
        return res.status(400).json({ error: lang === 'HU' ? 'Túl sok adat lett megadva.' : 'Too many data provided.' });
    }
    // #endregion

    // #region Regex pattern ellenőrzés: usertag, fullname, mobile formátum, gender hossz 10 karakteren belül
    if (usertag && !regexes.usertag.test(usertag)) {
        return res.status(400).json({ error: lang === 'HU' ? 'Érvénytelen felhasználónév formátum.' : 'Invalid usertag format.' });
    }
    if (fullname && !regexes.fullname.test(fullname)) {
        return res.status(400).json({ error: lang === 'HU' ? 'Érvénytelen teljes név formátum.' : 'Invalid fullname format.' });
    }
    if (mobile && !regexes.mobile.test(mobile)) {
        return res.status(400).json({ error: lang === 'HU' ? 'Érvénytelen mobiltelefonszám formátum.' : 'Invalid mobile number format.' });
    }
    if (gender && gender.length > 10 ) {
        return res.status(400).json({ error: lang === 'HU' ? 'A gender nem lehet hosszabb 10 karakternél.' : 'Gender cannot be longer than 10 characters.' });
    }
    // #endregion

    next();
}