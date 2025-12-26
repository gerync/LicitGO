import Regexes from '../../../utilities/Regexes.js';
import ObjectLength from '../../../utilities/ObjectLength.js';
export function PasswordResetRequestMiddleware(req, res, next) {
    const email = req.body.email;
    const lang = req.lang;
    if (!email || !Regexes.email.test(email)) {
        throw new Error(lang === 'HU' ? 'Kérjük, adjon meg egy érvényes email címet.' : 'Please provide a valid email address.');
    }
    next();
}

export function PasswordResetMiddleware(req, res, next) {
    let code = req.query.code || req.body.code;
    const newPassword = req.body.newPassword;
    const lang = req.lang;
    
    if (!code || code.length !== 6 || isNaN(code)) {
        throw new Error(lang === 'HU' ? 'Kérjük, adjon meg egy érvényes 6 jegyű jelszó visszaállító kódot.' : 'Please provide a valid 6-digit password reset code.');
    }
    req.code = Number(code);
    if (!newPassword) {
        throw new Error(lang === 'HU' ? 'Kérjük, adjon meg egy új jelszót.' : 'Please provide a new password.');
    }
    if (ObjectLength(req.body, 1, 2) === -1) {
        throw new Error(lang === 'HU' ? 'Kevés mező lett megadva.' : 'Too few fields provided.');
    }
    if (ObjectLength(req.body, 1, 2) === 1) {
        throw new Error(lang === 'HU' ? 'Túl sok mező lett megadva.' : 'Too many fields provided.');
    }
    

    if (!Regexes.password.lengthmin.test(newPassword)) {
        throw new Error(lang === 'HU' ? 'A jelszónak legalább 8 karakter hosszúnak kell lennie.' : 'Password must be at least 8 characters long.');
    }
    if (!Regexes.password.lengthmax.test(newPassword)) {
        throw new Error(lang === 'HU' ? 'A jelszónak legfeljebb 32 karakter hosszúnak kell lennie.' : 'Password must be at most 32 characters long.');
    }
    if (!Regexes.password.lowercase.test(newPassword)) {
        throw new Error(lang === 'HU' ? 'A jelszónak tartalmaznia kell legalább egy kisbetűt.' : 'Password must contain at least one lowercase letter.');
    }
    if (!Regexes.password.uppercase.test(newPassword)) {
        throw new Error(lang === 'HU' ? 'A jelszónak tartalmaznia kell legalább egy nagybetűt.' : 'Password must contain at least one uppercase letter.');
    }
    if (!Regexes.password.digit.test(newPassword)) {
        throw new Error(lang === 'HU' ? 'A jelszónak tartalmaznia kell legalább egy számot.' : 'Password must contain at least one digit.');
    }
    if (!Regexes.password.special.test(newPassword)) {
        throw new Error(lang === 'HU' ? 'A jelszónak tartalmaznia kell legalább egy speciális karaktert.' : 'Password must contain at least one special character.');
    }
    next();
}
export default {
    PasswordResetRequestMiddleware,
    PasswordResetMiddleware
};