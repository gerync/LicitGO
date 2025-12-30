import Configs from '../../configs/Configs.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import utils from '@gerync/utils';

export async function FetchExchanges() {
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
            utils.coloredlog('Dollár árfolyam sikeresen lekérve!', '#00FF00');
        }
        else {
            utils.coloredlog('Dollar exchange rate successfully fetched!', '#00FF00');
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
            utils.coloredlog('Euró árfolyam sikeresen lekérve!', '#00FF00');
        }
        else {
            utils.coloredlog('Euro exchange rate successfully fetched!', '#00FF00');
        }
        // #region Adatok kiemelése és fájlba írása
        const EURUSD = EURresponse.conversion_rates.USD;
        const EURHUF = EURresponse.conversion_rates.HUF;
        const USDHUF = USDresponse.conversion_rates.HUF;
        const rates = {
            EURUSD: EURUSD,
            EURHUF: EURHUF,
            USDHUF: USDHUF
        };
        const lastupdate = EURresponse.time_last_update_utc;
        // Összesített objektum létrehozása
        const fullJSon = {
            fetched_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
            lastupdate: lastupdate,
            rates: rates,
            success: EURresponse.result === 'success' && USDresponse.result === 'success'
        };
        // Fájl elérési útjának meghatározása
        const __filename = fileURLToPath(import.meta.url);
        const filePath = path.join(path.dirname(__filename), 'exchangeRates.json');
        
        // Fájl létező tartalmának beolvasása és tömb létrehozása
        let fileData = [];
        if (fs.existsSync(filePath)) {
            try {
                const fileContent = fs.readFileSync(filePath, 'utf8');
                fileData = JSON.parse(fileContent);
                if (!Array.isArray(fileData)) {
                    fileData = [];
                }
            } catch (parseError) {
                fileData = [];
            }
        }
        
        // Ellenőrizze, hogy a lastupdate már létezik-e a fájlban
        let isDuplicate = false;
        for (const entry of fileData) {
            if (entry.lastupdate === fullJSon.lastupdate) {
                isDuplicate = true;
                break;
            }
        }
        
        // Fájl frissítése új adatokkal, csak ha nem létezik már
        if (!isDuplicate) {
            fileData.push(fullJSon);
            fs.writeFileSync(filePath, JSON.stringify(fileData, null, 4), 'utf8');
        }
        // #endregion
        return fullJSon;
    } catch (error) {
        if (Configs.server.defaultLanguage === 'HU') {
            utils.coloredlog(`Árfolyam lekérés hiba: ${error.message}`, '#FF0000');
        } else {
            utils.coloredlog(`Exchange rate fetch error: ${error.message}`, '#FF0000');
        }
        throw error;
    }
}

