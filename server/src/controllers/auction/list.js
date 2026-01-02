import pool from '../../database/DB.js';
import convert from '../../utilities/exchange/convert.js';

export default async function ListAuctionsController(req, res) {
    const lang = req.lang;
    const currency = req.currency;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const conn = await pool.getConnection();

    try {
        const [rows] = await conn.query('SELECT * FROM auctions INNER JOIN cars ON auctions.carId = cars.id INNER JOIN users ON auctions.ownertoken = users.usertoken INNER JOIN carimage ON cars.id = carimage.carId LIMIT ? OFFSET ?', [limit, offset]);
        const auctions = [];
        for (const row of rows) {
            let startingBidConverted = row.startingBid;
            startingBidConverted = await convert(row.startingBid, 'USD', currency);
            auctions.push({
                auctionId: row.id,
                carId: row.carId,
                startingBid: startingBidConverted,
                reservePriceUSD: row.reservepriceUSD,
                starttime: row.starttime,
                status: function() {
                    const now = new Date();
                    if (now < row.starttime) return 'upcoming';
                    if (now >= row.starttime && now <= row.endtime) return 'ongoing';
                    return 'ended';
                },
                endtime: row.endtime,
                car: {
                    manufacturer: row.manufacturer,
                    model: row.model,
                    modelyear: row.modelyear,
                    owner: row.usertag,
                    mainImagepath: row.filepath

                }
            });
        }
