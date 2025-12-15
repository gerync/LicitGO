import regexes from '../../utilities/Regexes.js';
import ObjectLength from '../../utilities/ObjectLength.js';

export default function changeDataMiddleware(req, res, next) {
    const lang = req.cookies.language.toUpperCase() || 'EN'
    const { usertag, fullname, mobile, gender } = req.body;
    if (!usertag && !fullname && !mobile && !gender) {
        return res.status(400).send(lang === 'HU' ? 'Nincs megváltoztatandó adat megadva.' : 'No data to change provided.');
    }
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


    if (ObjectLength(req.body, 1, 4) == -1) {
        return res.status(400).send(lang === 'HU' ? 'Nincs megváltoztatandó adat megadva.' : 'No data to change provided.');
    }
    if (ObjectLength(req.body, 1, 4) == 1) {
        return res.status(400).send(lang === 'HU' ? 'Túl sok adat lett megadva.' : 'Too many data provided.');
    }
    if (usertag && !regexes.usertag.test(usertag)) {
        return res.status(400).send(lang === 'HU' ? 'Érvénytelen felhasználónév formátum.' : 'Invalid usertag format.');
    }
    if (fullname && !regexes.fullname.test(fullname)) {
        return res.status(400).send(lang === 'HU' ? 'Érvénytelen teljes név formátum.' : 'Invalid fullname format.');
    }
    if (mobile && !regexes.mobile.test(mobile)) {
        return res.status(400).send(lang === 'HU' ? 'Érvénytelen mobiltelefonszám formátum.' : 'Invalid mobile number format.');
    }
    if (gender.lenght > 10 ) {
        return res.status(400).send(lang === 'HU' ? 'A gender nem lehet hosszabb 10 karakternél.' : 'Gender cannot be longer than 10 characters.');
    }
    next();
}