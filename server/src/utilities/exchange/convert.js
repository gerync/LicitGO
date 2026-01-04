import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import configs from '../../configs/Configs.js';
import { coloredlog } from '@gerync/utils';


export default async function convert(amount, from, to) {
    amount = parseFloat(amount);
    // #region Input validáció
    if (isNaN(amount)) {
        const errorMsg = configs.server.defaultLanguage === 'HU' ?
            'Az összeg nem érvényes szám.' :
            'The amount is not a valid number.';
        coloredlog(errorMsg, 'red');
        throw new Error(errorMsg);
    }
    if (amount < 0) {
        const errorMsg = configs.server.defaultLanguage === 'HU' ?
            'Az összeg nem lehet negatív.' :
            'The amount cannot be negative.';
        coloredlog(errorMsg, 'red');
        throw new Error(errorMsg);
    }
    if (!from || !to) {
        const errorMsg = configs.server.defaultLanguage === 'HU' ?
            'A forrás és cél deviza kódok megadása kötelező.' :
            'Source and target currency codes are required.';
        coloredlog(errorMsg, 'red');
        throw new Error(errorMsg);
    }
    if (from.length !== 3 || to.length !== 3) {
        const errorMsg = configs.server.defaultLanguage === 'HU' ?
            'A deviza kódoknak 3 karakter hosszúnak kell lenniük.' :
            'Currency codes must be 3 characters long.';
        coloredlog(errorMsg, 'red');
        throw new Error(errorMsg);
    }
    // #endregion
    from = from.toUpperCase();
    to = to.toUpperCase();
    // #region Azonos devizák esetén nincs átváltás
    if (from === to) return amount;
    // #endregion
    // #region Árfolyamok betöltése
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, 'exchangeRates.json');
    let exchangeRates;

    try {
        const data = fs.readFileSync(filePath, 'utf8');
        exchangeRates = JSON.parse(data);
    } catch (error) {
        coloredlog('Error reading exchange rates file:', 'red');
        throw error;
    }
    // #endregion
    // #region Átváltás végrehajtása
    const pair = `${from}${to}`;
    const latestRateEntry = exchangeRates[exchangeRates.length - 1];
    const rate = latestRateEntry.rates[pair];
    // #endregion
    if (!rate) {
        const errorMsg = configs.server.defaultLanguage === 'HU' ?
            `Nincs elérhető árfolyam a következő devizapárhoz: ${pair}` :
            `No available exchange rate for currency pair: ${pair}`;
        coloredlog(errorMsg, 'red');
        throw new Error(errorMsg);
    }
    // Átváltás visszaadása
    return amount * rate;
}