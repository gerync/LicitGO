import ObjectLenght from '../../utilities/ObjectLength.js';
import regexes from '../../utilities/Regexes.js';

export default function RegisterMiddleware(req, res, next) {
    // #region Változók kiemelése és nyelvbeállítás
    let { usertag, password, email, fullname, mobile, gender, birthdate, passwordconfirm } = req.body;
    const lang = req.cookies.language.toUpperCase() || 'EN';
    // #endregion

    // #region Kötelező mezők ellenőrzése (usertag, password, passwordconfirm, email, fullname, mobile, gender, birthdate) - 8 db, egyenként lehető
    if (!usertag) {
        return res.status(400).send(lang === 'HU' ? 'A felhasználónév megadása kötelező.' : 'Usertag is required.');
    }
    if (!password) {
        return res.status(400).send(lang === 'HU' ? 'A jelszó megadása kötelező.' : 'Password is required.');
    }
    if (!email) {
        return res.status(400).send(lang === 'HU' ? 'Az email cím megadása kötelező.' : 'Email is required.');
    }
    if (!mobile) {
        return res.status(400).send(lang === 'HU' ? 'A telefonszám megadása kötelező.' : 'Mobile number is required.');
    }
    if (!fullname) {
        return res.status(400).send(lang === 'HU' ? 'A teljes név megadása kötelező.' : 'Fullname is required.');
    }
    if (!gender) {
        return res.status(400).send(lang === 'HU' ? 'A nem megadása kötelező.' : 'Gender is required.');
    }
    if (!birthdate) {
        return res.status(400).send(lang === 'HU' ? 'A születési dátum megadása kötelező.' : 'Birthdate is required.');
    }
    if (!passwordconfirm) {
        return res.status(400).send(lang === 'HU' ? 'A jelszavak nem egyeznek.' : 'Password confirmation is required.');
    }
    // #endregion

    // #region Nem string típusú paraméterek (8 mező) string-gé konvertálása toString() metodus segít-ségével
    if (typeof usertag !== 'string') {
        req.body.usertag = usertag.toString();
        usertag = req.body.usertag;
    }
    if (typeof password !== 'string') {
        req.body.password = password.toString();
        password = req.body.password;
    }
    if (typeof email !== 'string') {
        req.body.email = email.toString();
        email = req.body.email;
    }
    if (typeof fullname !== 'string') {
        req.body.fullname = fullname.toString();
        fullname = req.body.fullname;
    }
    if (typeof mobile !== 'string') {
        req.body.mobile = mobile.toString();
        mobile = req.body.mobile;
    }
    if (typeof gender !== 'string') {
        req.body.gender = gender.toString();
        gender = req.body.gender;
    }
    if (typeof birthdate !== 'string') {
        req.body.birthdate = birthdate.toString();
        birthdate = req.body.birthdate;
    }
    if (typeof passwordconfirm !== 'string') {
        passwordconfirm = passwordconfirm.toString();
    }
    // #endregion

    // #region Jelszó és jelszó-ismétlés egyeztetése, egyazonóság kötelező a regisztrációhoz
    if (password !== passwordconfirm) {
        return res.status(400).send(lang === 'HU' ? 'A jelszavak nem egyeznek.' : 'Passwords do not match.');
    }
    // #endregion

    // #region Mezőszám ellenőrzés (pontosan 9 kötelező), ObjectLength használatával
    if (ObjectLenght(req.body, 9) !== 0) {
        return res.status(400).send(lang === 'HU' ? 'Érvénytelen mezők száma.' : 'Invalid number of fields.');
    }
    // #endregion

    // #region Regex pattern ellenőrzés: usertag/email/fullname/mobile formátum, jelszó komplexitas (hossz, kis/nagybetu, digit, speciális), nem hossz (max 10)
    if (!regexes.usertag.test(usertag)) {
        return res.status(400).send(lang === 'HU' ? 'A felhasználónév érvénytelen formátumú.' : 'Invalid usertag format.');
    }
    if (!regexes.password.lengthmin.test(password)) {
        return res.status(400).send(lang === 'HU' ? 'A jelszónak legalább 8 karakter hosszúnak kell lennie.' : 'Password must be at least 8 characters long.');
    }
    if (!regexes.password.lengthmax.test(password)) {
        return res.status(400).send(lang === 'HU' ? 'A jelszó legfeljebb 32 karakter hosszú lehet.' : 'Password can be at most 32 characters long.');
    }
    if (!regexes.password.lowercase.test(password)) {
        return res.status(400).send(lang === 'HU' ? 'A jelszónak tartalmaznia kell legalább egy kisbetűt.' : 'Password must contain at least one lowercase letter.');
    }
    if (!regexes.password.uppercase.test(password)) {
        return res.status(400).send(lang === 'HU' ? 'A jelszónak tartalmaznia kell legalább egy nagybetűt.' : 'Password must contain at least one uppercase letter.');
    }
    if (!regexes.password.digit.test(password)) {
        return res.status(400).send(lang === 'HU' ? 'A jelszónak tartalmaznia kell legalább egy számot.' : 'Password must contain at least one digit.');
    }
    if (!regexes.password.special.test(password)) {
        return res.status(400).send(lang === 'HU' ? 'A jelszónak tartalmaznia kell legalább egy speciális karaktert.' : 'Password must contain at least one special character.');
    }
    if (!regexes.email.test(email)) {
        return res.status(400).send(lang === 'HU' ? 'Az email cím érvénytelen formátumú.' : 'Invalid email format.');
    }
    if (!regexes.fullname.test(fullname)) {
        return res.status(400).send(lang === 'HU' ? 'A teljes név érvénytelen formátumú.' : 'Invalid fullname format.');
    }
    if (!regexes.mobile.test(mobile)) {
        return res.status(400).send(lang === 'HU' ? 'A telefonszám érvénytelen formátumú.' : 'Invalid mobile number format.');
    }
    if (gender.length > 10 ) {
        return res.status(400).send(lang === 'HU' ? 'A gender nem lehet hosszabb 10 karakternél.' : 'Gender cannot be longer than 10 characters.');
    }
    next();
}