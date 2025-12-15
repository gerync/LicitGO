import ObjectLenght from '../../../utilities/ObjectLenght.js';
import regexes from '../../../utilities/Regexes.js';

export default function changePasswordMiddleware(req, res, next) {
    const lang = req.cookies.language.toUpperCase() || 'EN';
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
        return res.status(400).send(lang === 'HU' ? 'Hiányzó adatok.' : 'Missing data.');
    }
    if (ObjectLenght(req.body, 3) == -1) {
        return res.status(400).send(lang === 'HU' ? 'Hiányzó adatok.' : 'Missing data.');
    }
    if (ObjectLenght(req.body, 3) == 1) {
        return res.status(400).send(lang === 'HU' ? 'Túl sok adat lett megadva.' : 'Too many data provided.');
    }
    if (newPassword !== newPasswordConfirm) {
        return res.status(400).send(lang === 'HU' ? 'Az új jelszavak nem egyeznek.' : 'New passwords do not match.');
    }
    if (!regexes.password.lengthmin.test(newPassword)) {
        return res.status(400).send(lang === 'HU' ? 'A jelszónak legalább 8 karakter hosszúnak kell lennie.' : 'Password must be at least 8 characters long.');
    }
    if (!regexes.password.lengthmax.test(newPassword)) {
        return res.status(400).send(lang === 'HU' ? 'A jelszó legfeljebb 32 karakter hosszú lehet.' : 'Password can be at most 32 characters long.');
    }
    if (!regexes.password.lowercase.test(newPassword)) {
        return res.status(400).send(lang === 'HU' ? 'A jelszónak tartalmaznia kell legalább egy kisbetűt.' : 'Password must contain at least one lowercase letter.');
    }
    if (!regexes.password.uppercase.test(newPassword)) {
        return res.status(400).send(lang === 'HU' ? 'A jelszónak tartalmaznia kell legalább egy nagybetűt.' : 'Password must contain at least one uppercase letter.');
    }
    if (!regexes.password.digit.test(newPassword)) {
        return res.status(400).send(lang === 'HU' ? 'A jelszónak tartalmaznia kell legalább egy számot.' : 'Password must contain at least one digit.');
    }
    if (!regexes.password.special.test(newPassword)) {
        return res.status(400).send(lang === 'HU' ? 'A jelszónak tartalmaznia kell legalább egy speciális karaktert.' : 'Password must contain at least one special character.');
    }
    next();
}