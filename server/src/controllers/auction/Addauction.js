import pool from '../../database/DB.js';
import convert from '../../utilities/exchange/convert.js';

export default async function AddAuctionController(req, res) {
    const { carid, startingBid, reservePrice, starttime, endtime } = req.body;
    const conn = await pool.getConnection();
    try {
        const [carRows] = await conn.query('SELECT * FROM cars WHERE id = ?', [carid]);
        const lang = req.lang;
        const currency = req.currency;
        let reservePriceUSD = reservePrice;
        reservePriceUSD = await convert(reservePrice, currency, 'USD');
        if (carRows.length === 0) {
            conn.release();
            throw new Error([ lang === 'HU' ? 'A megadott \'carid\'-hoz tartozó autó nem található.' : 'Car not found for the given \'carid\'.', 404 ]);
        }
        if (carRows[0].ownertoken !== req.user) {
            conn.release();
            throw new Error([ lang === 'HU' ? 'Nincs jogosultsága az aukció létrehozásához ehhez az autóhoz.' : 'You do not have permission to create an auction for this car.', 403 ]);
        }
        const [auctionRows] = await conn.query('SELECT * FROM auctions WHERE carid = ? AND endtime > NOW()', [carid]);
        if (auctionRows.length > 0) {
            conn.release();
            throw new Error([ lang === 'HU' ? 'Ehhez az autóhoz már létezik egy aktív aukció.' : 'An active auction already exists for this car.', 409 ]);
        }
        const insertQuery = `INSERT INTO auctions (carid, startingBid, reservepriceUSD, starttime, endtime, createdAt) VALUES (?, ?, ?, ?, ?, NOW())`;
        const insertValues = [carid, startingBid, reservePriceUSD, starttime, endtime];
        const [result] = await conn.query(insertQuery, insertValues);
        conn.release();
        return res.status(201).json({ success: true, message: lang === 'HU' ? 'Aukció sikeresen létrehozva.' : 'Auction created successfully.', auctionId: result.insertId });
    } catch (error) {
        if (error.message.includes('Duplicate entry') || error.code === 'ER_DUP_ENTRY') {
            throw new Error([ lang === 'HU' ? 'Már létezik aukció ehhez az autóhoz.' : 'An auction already exists for this car.', 409 ]);
        }
        throw error;
    }
}