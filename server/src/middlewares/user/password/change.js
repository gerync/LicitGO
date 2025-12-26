import ObjectLength from '../../../utilities/ObjectLength.js';
import regexes from '../../../utilities/Regexes.js';

export default function changePasswordMiddleware(req, res, next) {
    const lang = req.lang;
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;
    if (!currentPassword) {
        throw new Error(lang === 'HU' ? 'Hiányzó jelenlegi jelszó.' : 'Missing current password.', 400);
    }
    if (!newPassword) {
        throw new Error(lang === 'HU' ? 'Hiányzó új jelszó.' : 'Missing new password.', 400);
    }
    if (!newPasswordConfirm) {
        throw new Error(lang === 'HU' ? 'Hiányzó új jelszó megerősítése.' : 'Missing new password confirmation.', 400);
    }
    if (ObjectLength(req.body, 3) == -1) {
        throw new Error(lang === 'HU' ? 'Hiányzó adatok.' : 'Missing data.', 400);
    }
    if (ObjectLength(req.body, 3) == 1) {
        throw new Error(lang === 'HU' ? 'Túl sok adat lett megadva.' : 'Too many data provided.', 400);
    }
    if (newPassword !== newPasswordConfirm) {
        throw new Error(lang === 'HU' ? 'Az új jelszavak nem egyeznek.' : 'New passwords do not match.', 400);
    }
    if (!regexes.password.lengthmin.test(newPassword)) {
        throw new Error(lang === 'HU' ? 'A jelszónak legalább 8 karakter hosszúnak kell lennie.' : 'Password must be at least 8 characters long.', 400);
    }
    if (!regexes.password.lengthmax.test(newPassword)) {
        throw new Error(lang === 'HU' ? 'A jelszó legfeljebb 32 karakter hosszú lehet.' : 'Password can be at most 32 characters long.', 400);
    }
    if (!regexes.password.lowercase.test(newPassword)) {
        throw new Error(lang === 'HU' ? 'A jelszónak tartalmaznia kell legalább egy kisbetűt.' : 'Password must contain at least one lowercase letter.', 400);
    }
    if (!regexes.password.uppercase.test(newPassword)) {
        throw new Error(lang === 'HU' ? 'A jelszónak tartalmaznia kell legalább egy nagybetűt.' : 'Password must contain at least one uppercase letter.', 400);
    }
    if (!regexes.password.digit.test(newPassword)) {
        throw new Error(lang === 'HU' ? 'A jelszónak tartalmaznia kell legalább egy számot.' : 'Password must contain at least one digit.', 400);
    }
    if (!regexes.password.special.test(newPassword)) {
        throw new Error(lang === 'HU' ? 'A jelszónak tartalmaznia kell legalább egy speciális karaktert.' : 'Password must contain at least one special character.', 400);
    }
    next();
}