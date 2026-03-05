import ObjectLength from '../../utilities/ObjectLength.js';

export default function VerifyEmailMiddleware(req, res, next) {
    const lang = req.lang;
    const { email, code } = req.body;

    if (ObjectLength(req.body, 2, 2) !== 0) {
        throw new Error(lang === 'HU' ? 'Az email és a kód megadása kötelező.' : 'Email and code are required.', 400);
    }

    if (!email || typeof email !== 'string') {
        throw new Error(lang === 'HU' ? 'Érvénytelen email formátum.' : 'Invalid email format.', 400);
    }
    if (!code || !/^\d{6}$/.test(code.toString())) {
        throw new Error(lang === 'HU' ? 'A kód 6 számjegy kell legyen.' : 'Code must be 6 digits.', 400);
    }
    next();
}
