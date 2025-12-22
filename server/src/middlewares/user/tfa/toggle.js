// Middleware: Kétlépcsős azonosítás toggle validálás (enable mező)
export default function toggleTFAMiddleware(req, res, next) {
    const lang = req.lang;
    const { enable } = req.body;

    if (enable === undefined) {
        throw new Error(lang === 'HU' ? 'Az enable mező megadása kötelező.' : 'The enable field is required.', 400);
    }

    if (typeof enable !== 'boolean') {
        throw new Error(lang === 'HU' ? 'Az enable mező boolean típusú kell legyen.' : 'The enable field must be boolean.', 400);
    }

    const keys = Object.keys(req.body);
    if (keys.length !== 1) {
        throw new Error(lang === 'HU' ? 'Csak az enable mező engedélyezett.' : 'Only the enable field is allowed.', 400);
    }

    next();
}