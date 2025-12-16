export default function errorHandler(err, req, res, next) {
    const lang = (req.cookies.language || 'EN').toUpperCase();
    console.error(err.stack);
    res.status(500).send(lang === 'HU' ? 'Szerver hiba történt.' : 'Internal Server Error.');
}