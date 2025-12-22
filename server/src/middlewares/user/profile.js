export default function profileMiddleware(req, res, next) {
    let usertag = req.params.usertag;
    const lang = req.lang;

    if (!usertag) {
        usertag = req.cookies.usertag;
    }
    if (!usertag) {
        throw new Error(lang === 'HU' ? 'Hiányzó felhasználói azonosító.' : 'Missing user identifier.', 400);
    }
    req.params.usertag = usertag.toLowerCase();
    next();
}