import pool from '../../database/DB.js';
import convert from '../../utilities/exchange/convert.js';

export default async function placeBidController(req, res) {
    const auctionID = parseInt(req.params.auctionID);
    const bidamount = parseFloat(req.body.bidamount);
    const usertoken = req.usertoken;
    const lang = req.lang;
    const conn = await pool.getConnection();
    const currency = req.currency;
    // #region Aukció lekérése
    const [auctionRows] = await conn.query('SELECT * FROM auctions INNER JOIN cars ON auctions.carid = cars.id WHERE auctions.id = ?', [auctionID]);
    if (auctionRows.length === 0) {
        throw new Error(lang === 'HU' ? 'Az aukció nem található.' : 'Auction not found.', 404);
    }
    const auction = auctionRows[0];
    // #endregion
    // #region Licit összegének átváltása aukció pénznemére
    let bidAmountUSD = await convert(bidamount, currency, auction.currency);
    // #endregion
    // #region Aktuális legmagasabb licit lekérése
    const [bidRows] = await conn.query('SELECT MAX(amount) AS maxBid, starttime, endtime FROM bids WHERE auctionid = ?', [auctionID]);
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
    conn.release();
    // #region Válasz küldése
    return res.status(200).json({
        message: lang === 'HU' ? 'Licit sikeresen leadva.' : 'Bid placed successfully.',
        auctionID: auctionID,
        bidAmount: bidamount,
        bidCurrency: currency
    });
    // #endregion
}