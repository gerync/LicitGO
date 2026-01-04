import pool from '../database/DB.js';
import { coloredlog } from '@gerync/utils';
import configs from '../configs/Configs.js';

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
                MAX(bids.bidamountUSD) as highestBid,
                bids.bidder as winningBidder
            FROM auctions
            LEFT JOIN bids ON auctions.id = bids.auctionid
            WHERE auctions.endtime < NOW()
              AND auctions.winner IS NULL
            GROUP BY auctions.id
            HAVING highestBid >= auctions.reservepriceUSD OR auctions.reservepriceUSD IS NULL
        `);
        
        if (endedAuctions.length === 0) {
            pool.releaseConnection(conn);
            return; // Nincsenek lezárandó aukciók
        }
        
        // #region Végigmegy a lezárt aukciókon és frissíti a nyertest
        for (const auction of endedAuctions) {
            // Lekéri a legmagasabb licitet leadó felhasználót
            const [winnerQuery] = await conn.query(`
                SELECT bidder
                FROM bids
                WHERE auctionid = ? AND bidamountUSD = ?
                ORDER BY bidtime ASC
                LIMIT 1
            `, [auction.id, auction.highestBid]);
            
            if (winnerQuery.length > 0) {
                const winner = winnerQuery[0].bidder;
                
                // #region Frissíti az aukciót a nyertessel
                await conn.query(`
                    UPDATE auctions
                    SET winner = ?
                    WHERE id = ?
                `, [winner, auction.id]);
                
                if (configs.server.defaultLanguage === 'HU') {
                    pool.releaseConnection(conn);
                    coloredlog(`Aukció lezárva: ${auction.id}, Nyertes: ${winner}`, configs.colors?.success || '#00ff00');
                } else {
                    coloredlog(`Auction finalized: ${auction.id}, Winner: ${winner}`, configs.colors?.success || '#00ff00');
                }
                // #endregion
            }
        }
        // #endregion
        
    }
    catch (error) {
        pool.releaseConnection(conn);
        if (configs.server.defaultLanguage === 'HU') {
            coloredlog('Hiba az aukciók lezárásakor:', configs.colors?.error || '#ff0000');
        } else {
            coloredlog('Error finalizing auctions:', configs.colors?.error || '#ff0000');
        }
        coloredlog(error, configs.colors?.error || '#ff0000');
    }
}
