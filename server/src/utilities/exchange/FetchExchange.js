import Configs from '../../configs/Configs.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { coloredlog } from '@gerync/utils';

export default async function FetchExchanges() {
    // #region Ellenőrzés: van-e már ma dátumhoz tartozó adat?
    const __filename = fileURLToPath(import.meta.url);
    const filePath = path.join(path.dirname(__filename), 'exchangeRates.json');
    
    const colors = Configs.colors;

    const today = new Date().toISOString().substring(0, 10); // "2025-12-31" formátum
    let fileData = [];
    
    if (fs.existsSync(filePath)) {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            fileData = JSON.parse(fileContent);
            if (!Array.isArray(fileData)) {
                fileData = [];
            }
            // Ellenőrizze, hogy van-e ma dátumú record
            let todayExists = false;
            for (const entry of fileData) {
                if (entry.fetched_at.startsWith(today)) {
                    todayExists = true;
                    break;
                }
            }
            if (todayExists) {
                if (Configs.server.defaultLanguage === 'HU') {
                    coloredlog('A mai napi árfolyam adat már letöltve, átugrás.', colors.warning);
                } else {
                    coloredlog("Today's exchange rate data already downloaded, skipping.", colors.warning);
                }
                return;
            }
        } catch (parseError) {
            // Ha hiba van, folytatja az API hívását
        }
    }
    // #endregion
    
    try {
        // #region Aktuális árfolyamok lekérése
        let USDresponse = await fetch(Configs.exchange.apiFullUrl()+'USD');
        if (!USDresponse.ok) {
            if (Configs.server.defaultLanguage === 'HU') {
                throw new Error(`Hiba az árfolyamok lekérésekor: ${USDresponse.status} ${USDresponse.statusText}`);
            } else {
                throw new Error(`Error fetching exchange rates: ${USDresponse.status} ${USDresponse.statusText}`);
            }
        }
        USDresponse = await USDresponse.json();
        if (USDresponse.result !== 'success') {
            if (Configs.server.defaultLanguage === 'HU') {
                throw new Error(`Hiba a dollár árfolyamok lekérésekor: ${USDresponse.result}`);
            } else {
                throw new Error(`Error fetching exchange rates of the dollar: ${USDresponse.result}`);
            }
        }
        if (Configs.server.defaultLanguage === 'HU') {
            coloredlog('Dollár árfolyam sikeresen lekérve!', colors.success);
        }
        else {
            coloredlog('Dollar exchange rate successfully fetched!', colors.success);
        }

        setTimeout(() => {}, 2000); // API limit elkerülése miatt várakozás
        let EURresponse = await fetch(Configs.exchange.apiFullUrl()+'EUR');
        if (!EURresponse.ok) {
            if (Configs.server.defaultLanguage === 'HU') {
                throw new Error(`Hiba az euró árfolyamok lekérésekor: ${EURresponse.status} ${EURresponse.statusText}`);
            } else {
                throw new Error(`Error fetching exchange rates of the euro: ${EURresponse.status} ${EURresponse.statusText}`);
            }
        }
        EURresponse = await EURresponse.json();
        if (EURresponse.result !== 'success') {
            if (Configs.server.defaultLanguage === 'HU') {
                throw new Error(`Hiba az euró árfolyamok lekérésekor: ${EURresponse.result}`);
            } else {
                throw new Error(`Error fetching exchange rates of the euro: ${EURresponse.result}`);
            }
        }
        // #endregion
        if (Configs.server.defaultLanguage === 'HU') {
            coloredlog('Euró árfolyam sikeresen lekérve!', colors.success);
        }
        else {
            coloredlog('Euro exchange rate successfully fetched!', colors.success);
        }
        // #region Adatok kiemelése és fájlba írása
        const EURUSD = EURresponse.conversion_rates.USD;
        const EURHUF = EURresponse.conversion_rates.HUF;
        const USDHUF = USDresponse.conversion_rates.HUF;
        const HUFUSD = 1 / USDHUF;
        const HUFEUR = 1 / EURHUF;
        const USDEUR = 1 / EURUSD;
        const rates = {
            EURUSD: EURUSD,
            EURHUF: EURHUF,
            USDHUF: USDHUF,
            HUFUSD: HUFUSD,
            HUFEUR: HUFEUR,
            USDEUR: USDEUR
        };
        let lastupdate = EURresponse.time_last_update_utc;
        // Idő formázása UTC-ból a konfigurált időzónára: "Wed, 30 Dec 2025 00:00:02 +0000" -> "2025-12-30 00:00:02"
        lastupdate = new Date(lastupdate).toLocaleString(Configs.server.time.locale, {
            timeZone: Configs.server.time.timeZone,
            year: Configs.server.timeFormat.year,
            month: Configs.server.timeFormat.month,
            day: Configs.server.timeFormat.day,
            hour: Configs.server.timeFormat.hour,
            minute: Configs.server.timeFormat.minute,
            second: Configs.server.timeFormat.second,
            hour12: Configs.server.timeFormat.hour12
        }).replace(',', '');
        // Összesített objektum létrehozása
        const fullJSon = {
            fetched_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
            lastupdate: lastupdate,
            rates: rates,
            success: EURresponse.result === 'success' && USDresponse.result === 'success'
        };
        // Fájl létező tartalmának beolvasása és tömb létrehozása
        let currentFileData = [];
        if (fs.existsSync(filePath)) {
            try {
                const fileContent = fs.readFileSync(filePath, 'utf8');
                currentFileData = JSON.parse(fileContent);
                if (!Array.isArray(currentFileData)) {
                    currentFileData = [];
                }
            } catch (parseError) {
                currentFileData = [];
            }
        }
        // Új rekord hozzáfűzése és fájl írása
            currentFileData.push(fullJSon);
            // Csak a legutóbbi N rekord megtartása
            if (currentFileData.length > Configs.exchange.jsonmaxlenght) {
                currentFileData = currentFileData.slice(-Configs.exchange.jsonmaxlenght);
            }
            fs.writeFileSync(filePath, JSON.stringify(currentFileData, null, 4), 'utf8');
        // #endregion
        if (Configs.server.defaultLanguage === 'HU') {
            coloredlog('Árfolyamok sikeresen elmentve!', colors.success);
        }
        else {
            coloredlog('Exchange rates successfully saved!', colors.success);
        }
        return;
    }
    catch (error) {
        if (Configs.server.defaultLanguage === 'HU') {
            coloredlog(`Árfolyam lekérés hiba:\n
                ${error.message}`, colors.error);
        } else {
            coloredlog(`Exchange rate fetch error:\n
                ${error.message}`, colors.error);
        }
        coloredlog(error.stack, colors.error-stack);
        return;
    }
}