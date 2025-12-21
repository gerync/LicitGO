import pool from '../../database/DB.js';

export default async function AddAuctionController(req, res) {
    const { carid, startingBid, reservePrice, starttime, endtime } = req.body;
    const conn = await pool.getConnection();
    const [carRows] = await conn.query('SELECT * FROM cars WHERE id = ?', [carid]);
    if (carRows.length === 0) {
        pool.releaseConnection(conn);
        return res.status(404).json({ error: "A megadott 'carid'-hoz tartozó autó nem található." });
    }
    if (carRows[0].ownertoken !== req.user) {
        pool.releaseConnection(conn);
        return res.status(403).json({ error: "Nincs jogosultsága az aukció létrehozásához ehhez az autóhoz." });
    }
    const [auctionRows] = await conn.query('SELECT * FROM auctions WHERE carid = ? AND endtime > NOW()', [carid]);
    if (auctionRows.length > 0) {
        pool.releaseConnection(conn);
        return res.status(409).json({ error: "Ehhez az autóhoz már létezik egy aktív aukció." });
    }
    const insertQuery = `INSERT INTO auctions (carid, startingBid, reservepriceUSD, starttime, endtime, createdAt) VALUES (?, ?, ?, ?, ?, NOW())`;
    const insertValues = [carid, startingBid, reservePrice, starttime, endtime];
    const [result] = await conn.query(insertQuery, insertValues);
    pool.releaseConnection(conn);
    return res.status(201).json({ success: true, message: 'Aukció sikeresen létrehozva.', auctionId: result.insertId });
}