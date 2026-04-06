import pool from '../../database/DB.js';
import convert from '../../utilities/exchange/convert.js';
import sendEmail from '../../email/send.js';
import Configs from '../../configs/Configs.js';

export default async function placeBidController(req, res) {
    const auctionID = parseInt(req.params.auctionID ?? req.body.auctionId ?? req.body.auctionID ?? req.body.auctionid);
    const bidamount = parseFloat(req.body.bidamount ?? req.body.amount ?? req.body.bidAmount ?? req.body.Amount);
    const usertoken = req.usertoken;
    const lang = req.lang;
    const conn = await pool.getConnection();
    const currency = req.currency;
    try {
        console.log('placeBid request:', { auctionID, bidamount, currency, usertoken });
        // #region Aukció lekérése
        const [auctionRows] = await conn.query('SELECT * FROM auctions INNER JOIN cars ON auctions.carid = cars.id WHERE auctions.id = ?', [auctionID]);
        if (auctionRows.length === 0) {
            throw new Error(lang === 'HU' ? 'Az aukció nem található.' : 'Auction not found.', 404);
        }
        const auction = auctionRows[0];
        // #endregion
        // #region Licit összegének átváltása aukció pénznemére
        let bidAmountUSD = await convert(bidamount, currency, 'USD');
        // #endregion
        // #region Aktuális legmagasabb licit lekérése
        const [bidRows] = await conn.query('SELECT MAX(bidamountUSD) AS maxBid FROM bids WHERE auctionid = ?', [auctionID]);
        const [previousHighestRows] = await conn.query(
            'SELECT bidder, bidamountUSD FROM bids WHERE auctionid = ? ORDER BY bidamountUSD DESC, bidtime ASC LIMIT 1',
            [auctionID]
        );
        if (usertoken === auction.ownertoken) {
            throw new Error(lang === 'HU' ? 'Nem licitálhatsz a saját aukcióidra.' : 'You cannot bid on your own auctions.', 400);
        }
        const currentMaxBid = bidRows[0].maxBid || 0;
        // #endregion
        // #region Licit ellenőrzése
        if (bidAmountUSD <= currentMaxBid) {
            throw new Error(lang === 'HU' ? 'A licit összegének nagyobbnak kell lennie a jelenlegi legmagasabb licitnél.' : 'Bid amount must be higher than the current highest bid.', 400);
        }
        if (bidAmountUSD < auction.startingpriceUSD) {
            throw new Error(lang === 'HU' ? 'A licit összegének el kell érnie a kezdő licit összegét.' : 'Bid amount must meet the starting bid amount.', 400);
        }
        const now = new Date();
        const auctionStart = new Date(auction.starttime);
        const auctionEnd = new Date(auction.endtime);
        if (now < auctionStart) {
            throw new Error(lang === 'HU' ? 'Az aukció még nem kezdődött el.' : 'The auction has not started yet.', 400);
        }
        if (now > auctionEnd) {
            throw new Error(lang === 'HU' ? 'Az aukció már lejárt.' : 'The auction has already ended.', 400);
        }
        // #endregion
        // #region Licit rögzítése az adatbázisban
        await conn.query('INSERT INTO bids (auctionid, bidder, bidamountUSD) VALUES (?, ?, ?)', [auctionID, usertoken, bidAmountUSD]);
        // #endregion
        // #region Outbid értesítés (ha volt korábbi legmagasabb licitáló és nem az aktuális felhasználó)
        if (previousHighestRows.length > 0 && previousHighestRows[0].bidder !== usertoken) {
            const previousHighest = previousHighestRows[0];
            const [[prevUser]] = await pool.query(
                `SELECT u.email, u.usertag, s.language, s.currency
                 FROM users u
                 LEFT JOIN settings s ON u.usertoken = s.usertoken
                 WHERE u.usertoken = ?`,
                [previousHighest.bidder]
            );

            if (prevUser?.email) {
                const recipientLang = (prevUser.language || Configs.server.defaultLanguage).toUpperCase();
                const recipientCurrency = (prevUser.currency || 'USD').toUpperCase();
                let displayedBid = bidAmountUSD;

                try {
                    displayedBid = await convert(bidAmountUSD, 'USD', recipientCurrency);
                } catch (convErr) {
                    // Ha az átváltás hibázik, marad USD
                }

                const subject = recipientLang === 'HU'
                    ? 'Valaki túllépte a licitedet'
                    : 'Your bid was outbid';

                const info = {
                    usertag: prevUser.usertag || '',
                    AuctionLink: `${Configs.server.domain()}/auction/${auctionID}`,
                    CarManufacturer: auction.manufacturer,
                    CarModel: auction.model,
                    NewHighestBid: displayedBid,
                    currency: ` ${recipientCurrency}`
                };

                try {
                    await sendEmail(prevUser.email, subject, info, 'auction-outbid', recipientLang);
                } catch (emailErr) {
                    // Ha az email küldés nem sikerül, a licit akkor is érvényes
                }
            }
        }
        // #endregion
        // #region Válasz küldése
        return res.status(200).json({
            message: lang === 'HU' ? 'Licit sikeresen leadva.' : 'Bid placed successfully.',
            auctionID: auctionID,
            bidAmount: bidamount,
            bidCurrency: currency
        });
        // #endregion
    } finally {
        conn.release();
    }
}