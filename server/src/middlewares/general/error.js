import { coloredlog } from '@gerync/utils';
import configs from '../../configs/Configs.js';

// Általános hibakezelő middleware
export default function errorHandler(err, req, res, next) {
    const lang = req.lang;
    // #region Alapértelmezett üzenet és státuszkód beállítása
    const defaultMessage = lang === 'HU' ? 'Szerver hiba történt.' : 'An internal server error occurred.';

    let status = Number.isInteger(err?.status) ? err.status : Number.isInteger(err?.statusCode) ? err.statusCode : undefined;
    let message = typeof err?.message === 'string' ? err.message : defaultMessage;
    // Ha az Error() üzenet végén vesszővel elválasztott státuszkód jön ('msg,400'), szét bontja
    // #region Üzenetből státuszkód kinyerése
    const colors = configs.colors;
    if (!status && typeof message === 'string') {
        const match = message.match(/^(.*),(\d{3})$/);
        if (match) {
            message = match[1];
            status = parseInt(match[2]);
            if (configs.server.defaultLanguage === 'HU') {
                coloredlog(`Hibaüzenetből kivett státuszkód: ${status}`, colors.info);
            }
            else {
                coloredlog(`Extracted status code from error message: ${status}`, colors.info);
            }
        }
    }
    // #endregion
    // #region Tömbként átadott üzenet és státuszkód kezelése
    const payload = Array.isArray(err) ? err : Array.isArray(err?.message) ? err.message : null;
    if (payload) {
        const [msg, code] = payload;
        if (typeof code === 'number') {
            status = code;
        }
        if (msg) {
            message = msg;
        }
    }
    // #endregion
    // #region Státuszkód és üzenet érvényesítése
    if (!Number.isInteger(status) || status < 400 || status > 599) {
        status = 500;
    }
    if (!message || status >= 500) {
        message = defaultMessage;
    }
    // #endregion
    // #region Hibainformáció naplózása csak szerveroldali hibáknál
    if (status >= 500) {
        coloredlog(err?.stack || err, colors.error-stack);
    }
    // #endregion

    return res.status(status).json({ error: message });
}