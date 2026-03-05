import pool from '../database/DB.js';
import { coloredlog } from '@gerync/utils';
import configs from '../configs/Configs.js';
import sendEmail from '../email/send.js';
import convert from './exchange/convert.js';

/**
 * Cron használata aukciók lezárására és nyertesek kiválasztására.
 * Minden percben fut, és ellenőrzi a lejárt aukciókat.
 * Ha egy aukció lejárt és van érvényes licit a fenntartási ár felett,
 * akkor kiválasztja a legmagasabb licitet leadó felhasználót nyertesként.
 */
export default async function finalizeAuctions() {
    const conn = await pool.getConnection();

    try {
        // Lekérdezi a lejárt aukciókat, amelyek még nincsenek lezárva
        const [endedAuctions] = await conn.query(`
            SELECT 
                auctions.id,
                auctions.carid,
                auctions.reservepriceUSD,
                MAX(bids.bidamountUSD) as highestBid
            FROM auctions
            LEFT JOIN bids ON auctions.id = bids.auctionid
            WHERE auctions.endtime < NOW()
              AND auctions.winner IS NULL
            GROUP BY auctions.id
            HAVING highestBid >= auctions.reservepriceUSD OR auctions.reservepriceUSD IS NULL
        `);
        
        if (endedAuctions.length === 0) {
            return; // Nincsenek lezárandó aukciók
        }
        
        // #region Végigmegy a lezárt aukciókon és frissíti a nyertest
        for (const auction of endedAuctions) {
            // Lekéri a legmagasabb licitet és a licitálót
            const [winnerQuery] = await conn.query(`
                SELECT bidder, bidamountUSD
                FROM bids
                WHERE auctionid = ?
                ORDER BY bidamountUSD DESC, bidtime ASC
                LIMIT 1
            `, [auction.id]);

            if (winnerQuery.length === 0) {
                continue; // Nincs licit, nincs értesítés
            }

            const winnerToken = winnerQuery[0].bidder;
            const finalPriceUSD = winnerQuery[0].bidamountUSD;

            // Aukció frissítése a nyertessel
            await conn.query(`
                UPDATE auctions
                SET winner = ?
                WHERE id = ?
            `, [winnerToken, auction.id]);

            // Autó, tulajdonos és nyertes adatainak lekérése
            const [[carRow]] = await conn.query(
                'SELECT manufacturer, model, ownertoken FROM cars WHERE id = ?',
                [auction.carid]
            );
            if (!carRow) {
                continue;
            }

            const [[ownerRow]] = await conn.query(
                `SELECT u.email, u.usertag, s.language, s.currency
                 FROM users u
                 LEFT JOIN settings s ON u.usertoken = s.usertoken
                 WHERE u.usertoken = ?`,
                [carRow.ownertoken]
            );

            const [[winnerRow]] = await conn.query(
                `SELECT u.email, u.usertag, s.language, s.currency
                 FROM users u
                 LEFT JOIN settings s ON u.usertoken = s.usertoken
                 WHERE u.usertoken = ?`,
                [winnerToken]
            );

            // Értesítő emailek küldése tulajnak és nyertesnek
            if (!ownerRow?.email || !winnerRow?.email) {
                continue; // Nem tudunk értesítést küldeni email cím nélkül
            }

            const ownerLang = (ownerRow?.language || configs.server.defaultLanguage).toUpperCase();
            const winnerLang = (winnerRow?.language || configs.server.defaultLanguage).toUpperCase();
            const ownerCurrency = (ownerRow?.currency || 'USD').toUpperCase();
            const winnerCurrency = (winnerRow?.currency || 'USD').toUpperCase();

            let ownerFinalPrice = finalPriceUSD;
            let winnerFinalPrice = finalPriceUSD;

            try {
                ownerFinalPrice = await convert(finalPriceUSD, 'USD', ownerCurrency);
                winnerFinalPrice = await convert(finalPriceUSD, 'USD', winnerCurrency);
            } catch (convErr) {
                // Ha átváltás sikertelen, marad USD
                coloredlog(convErr, configs.colors?.warning || '#ffaa00');
            }

            const ownerSubject = ownerLang === 'HU'
                ? 'Aukciód lezárult'
                : 'Your auction has ended';
            const winnerSubject = winnerLang === 'HU'
                ? 'Gratulálunk, nyertél!'
                : 'Congratulations, you won!';

            const ownerInfo = {
                usertag: ownerRow?.usertag || '',
                CarManufacturer: carRow.manufacturer,
                CarModel: carRow.model,
                WinnerName: winnerRow?.usertag || '',
                WinnerEmail: winnerRow?.email || '',
                FinalPrice: ownerFinalPrice,
                currency: ` ${ownerCurrency}`
            };

            const winnerInfo = {
                usertag: winnerRow?.usertag || '',
                AuctionLink: `${configs.server.domain()}/auction/${auction.id}`,
                CarManufacturer: carRow.manufacturer,
                CarModel: carRow.model,
                FinalPrice: winnerFinalPrice,
                currency: ` ${winnerCurrency}`
            };

            try {
                await Promise.all([
                    sendEmail(ownerRow?.email, ownerSubject, ownerInfo, 'your-auction-ended', ownerLang),
                    sendEmail(winnerRow?.email, winnerSubject, winnerInfo, 'you-won-auction', winnerLang)
                ]);
            } catch (emailErr) {
                coloredlog(emailErr, configs.colors?.warning || '#ffaa00');
            }

            if (configs.server.defaultLanguage === 'HU') {
                coloredlog(`Aukció lezárva: ${auction.id}, Nyertes: ${winnerToken}`, configs.colors?.success || '#00ff00');
            } else {
                coloredlog(`Auction finalized: ${auction.id}, Winner: ${winnerToken}`, configs.colors?.success || '#00ff00');
            }
        }
        // #endregion

    }
    catch (error) {
        if (configs.server.defaultLanguage === 'HU') {
            coloredlog('Hiba az aukciók lezárásakor:', configs.colors?.error || '#ff0000');
        } else {
            coloredlog('Error finalizing auctions:', configs.colors?.error || '#ff0000');
        }
        coloredlog(error, configs.colors?.error || '#ff0000');
    } finally {
        conn.release();
    }
}
