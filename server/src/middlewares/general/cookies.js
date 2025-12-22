export default function cookieMiddleware(req, res, next) {
    // #region Nyelv és pénznem beállítása sütik alapján
    let lang = (req.cookies.language || 'EN').toUpperCase();
    req.lang = lang === 'HU' ? 'HU' : 'EN';
    
    const currency = req.cookies.currency ? req.cookies.currency.toUpperCase() : 'HUF';
    req.currency = ['HUF', 'EUR', 'USD'].includes(currency) ? currency : 'HUF';
    // #endregion
    next();
}