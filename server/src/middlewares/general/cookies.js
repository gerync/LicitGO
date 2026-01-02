import configs from '../../configs/Configs.js';

export default function cookieMiddleware(req, res, next) {
    // #region Nyelv és pénznem beállítása sütik alapján a kérés objektumában
    let lang = (req.cookies.language || configs.server.defaultLanguage).toUpperCase();
    // Érvényesítés
    req.lang = ['HU', 'EN'].includes(lang) ? lang : configs.server.defaultLanguage;
    
    let currency = (req.cookies.currency || 'USD').toUpperCase();
    req.currency = ['USD', 'EUR', 'HUF'].includes(currency) ? currency : 'USD';
    // #endregion
    next();
}