import pool from '../../database/DB.js';

export default async function AddAuctionController(req, res) {
    const { carid, startingBid, reservePrice, starttime, endtime } = req.body;
    const conn = await pool.getConnection();
    const [carRows] = await conn.query('SELECT * FROM cars WHERE id = ?', [carid]);
    const lang = req.lang;
    if (carRows.length === 0) {
        pool.releaseConnection(conn);
        throw new Error([ lang === 'HU' ? "A megadott 'carid'-hoz tartozó autó nem található." : "Car not found for the given 'carid'.", 404 ]);
    }
    if (carRows[0].ownertoken !== req.user) {
        pool.releaseConnection(conn);
        throw new Error([ lang === 'HU' ? "Nincs jogosultsága az aukció létrehozásához ehhez az autóhoz." : "You do not have permission to create an auction for this car.", 403 ]);
    }
    const [auctionRows] = await conn.query('SELECT * FROM auctions WHERE carid = ? AND endtime > NOW()', [carid]);
    if (auctionRows.length > 0) {
        pool.releaseConnection(conn);
        throw new Error([ lang === 'HU' ? "Ehhez az autóhoz már létezik egy aktív aukció." : "An active auction already exists for this car.", 409 ]);
    }
    const insertQuery = `INSERT INTO auctions (carid, startingBid, reservepriceUSD, starttime, endtime, createdAt) VALUES (?, ?, ?, ?, ?, NOW())`;
    const insertValues = [carid, startingBid, reservePrice, starttime, endtime];
    const [result] = await conn.query(insertQuery, insertValues);
    pool.releaseConnection(conn);
    return res.status(201).json({ success: true, message: lang === 'HU' ? 'Aukció sikeresen létrehozva.' : 'Auction created successfully.', auctionId: result.insertId });
}