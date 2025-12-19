// Middleware: Kétlépcsős azonosítás toggle validálás (enable mező)
export default function toggleTFAMiddleware(req, res, next) {
    const lang = (req.cookies.language || 'EN').toUpperCase();
    const { enable } = req.body;

    if (enable === undefined) {
        return res.status(400).json({ error: lang === 'HU' ? 'Az enable mező megadása kötelező.' : 'The enable field is required.' });
    }

    if (typeof enable !== 'boolean') {
        return res.status(400).json({ error: lang === 'HU' ? 'Az enable mező boolean típusú kell legyen.' : 'The enable field must be boolean.' });
    }

    const keys = Object.keys(req.body);
    if (keys.length !== 1) {
        return res.status(400).json({ error: lang === 'HU' ? 'Csak az enable mező engedélyezett.' : 'Only the enable field is allowed.' });
    }

    next();
}