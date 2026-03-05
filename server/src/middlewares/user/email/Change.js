import ObjectLength from '../../../utilities/ObjectLength.js';

export function requestEmailChangeMiddleware(req, res, next) {
    const lang = req.lang;
    if (ObjectLength(req.body, 1, 1) !== 0) {
        throw new Error([ lang === 'HU' ? 'Csak az új email címet adhatja meg.' : 'Provide only the new email address.', 400 ]);
    }
    next();
}

export function verifyEmailChangeMiddleware(req, res, next) {
    const lang = req.lang;
    if (ObjectLength(req.body, 2, 2) !== 0) {
        throw new Error([ lang === 'HU' ? 'Email és kód megadása szükséges.' : 'Provide email and code.', 400 ]);
    }
    next();
}
