export default function profileMiddleware(req, res, next) {
    let usertag = req.params.usertag;
    const lang = (req.cookies.language || 'EN').toUpperCase();

    if (!usertag) {
        usertag = req.cookies.usertag;
    }
    if (!usertag) {
        return res.status(400).send(lang === 'HU' ? 'Hiányzó felhasználói azonosító.' : 'Missing user identifier.');
    }
    req.params.usertag = usertag.toLowerCase();
    next();
}