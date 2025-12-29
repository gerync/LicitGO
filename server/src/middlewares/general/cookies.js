import configs from '../../configs/Configs.js';

export default function cookieMiddleware(req, res, next) {
    // #region Nyelv és pénznem beállítása sütik alapján a kérés objektumában
    let lang = (req.cookies.language || configs.server.defaultLanguage).toUpperCase();
    req.lang = lang === 'HU' ? 'HU' : 'EN';
    
    let currency = req.cookies.currency || 'USD';
    req.currency = ['USD', 'EUR', 'HUF'].includes(currency) ? currency : 'USD';
    // #endregion
    next();
}