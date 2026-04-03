import pool from '../../database/DB.js';
import convert from '../../utilities/exchange/convert.js';
import Configs from '../../configs/Configs.js';

export default async function GetAuctionController(req, res) {
    const currency = req.currency;
    const auctionId = req.auctionId;
    const conn = await pool.getConnection();
    const lang = req.lang;
    // Debug: log requested auctionId to help diagnose missing rows
    console.log('GetAuctionController: requested auctionId=', auctionId);
    const query = `
        SELECT
            auctions.id AS auctionId,
            auctions.carid AS carId,
            auctions.startingpriceUSD,
            auctions.reservepriceUSD,
            auctions.starttime,
            auctions.endtime,
            cars.*, 
            users.usertag,
            users.fullname,
            COALESCE((SELECT MAX(bidamountUSD) FROM bids WHERE bids.auctionid = auctions.id), auctions.startingpriceUSD) AS currentPrice,
            (SELECT COUNT(*) FROM bids WHERE bids.auctionid = auctions.id) AS bidcount
        FROM auctions
        LEFT JOIN cars ON auctions.carid = cars.id
        LEFT JOIN users ON cars.ownertoken = users.usertoken
        WHERE auctions.id = ?
    `;
    const [rows] = await conn.query(query, [auctionId]);
    console.log('GetAuctionController: DB rows length =', Array.isArray(rows) ? rows.length : typeof rows);
    if (!Array.isArray(rows) || rows.length === 0) {
        console.log('GetAuctionController: no rows returned for auctionId=', auctionId, 'query param');
        conn.release();
        throw new Error([ req.lang === 'HU' ? 'Aukció nem található.' : 'Auction not found.', 404 ]);
    }
    
    // #region Ajánlatok lekérdezése
    const bidHistoryQuery = `
        SELECT 
            bids.bidamountUSD,
            bids.bidtime,
            users.usertag
        FROM bids
        JOIN users ON bids.bidder = users.usertoken
        WHERE bids.auctionid = ?
        ORDER BY bids.bidamountUSD DESC
    `;
    const [bidHistory] = await conn.query(bidHistoryQuery, [auctionId]);
    const row = rows[0];
    // #endregion
    // ↓ Képek feldolgozása
    const images = row.images ? JSON.parse(row.images) : [];
    // ↓ Jelenlegi ár meghatározása
    const currentPrice = row.currentPrice || row.startingpriceUSD;
    
    // #region Felszereltség feldolgozása
    let features = null;
    if (row.features) {
        try {
            features = JSON.parse(row.features);
        } catch (e) {
            // Ha nem JSON (pl. a SetupDB-ben megadott vesszős lista)
            features = row.features.split(',').map(item => item.trim()).filter(Boolean);
        }
    }
    // #endregion
    // #region Állapot és hátralévő idő kiszámítása
    const now = new Date();
    const start = new Date(row.starttime);
    const end = new Date(row.endtime);
    let status, timeRemaining = null;
    
    if (now < start) {
        status = lang === 'HU' ? 'Leendő' : 'Upcoming';
        timeRemaining = Math.floor((start - now) / 1000);
        // ↑ másodpercek a kezdetig
    } else if (now >= start && now <= end) {
        status = lang === 'HU' ? 'Folyamatban' : 'Ongoing';
        timeRemaining = Math.floor((end - now) / 1000);
        // ↑ másodpercek a befejezésig
    } else {
        status = lang === 'HU' ? 'Lezárt' : 'Ended';
        timeRemaining = 0;
    }
    // #endregion
    // #region Licit előzmények átalakítása a kért valutára
    const bidsWithConvertedPrices = await Promise.all(
        bidHistory.map(async (bid) => ({
            amount: await convert(bid.bidamountUSD, 'USD', currency),
            bidtime: bid.bidtime,
            bidder: bid.usertag
        }))
    );
    // #endregion
    const reserveMet = row.reservepriceUSD ? currentPrice >= row.reservepriceUSD : true;
    // #region Válasz összeállítása
    const auctionDetails = {
        auctionId: row.auctionId,
        carId: row.carid,
        currentPrice: await convert(currentPrice, 'USD', currency),
        reserveMet: reserveMet,
        currency: currency,
        starttime: row.starttime,
        endtime: row.endtime,
        status: status,
        timeRemaining: timeRemaining,
        bidCount: row.bidcount || 0,
        bidHistory: bidsWithConvertedPrices,
        car: {
            manufacturer: row.manufacturer,
            model: row.model,
            odometerKM: row.odometerKM,
            modelyear: row.modelyear,
            efficiency: row.efficiency,
            efficiencyunit: row.efficiencyunit,
            enginecapacityCC: row.enginecapacityCC,
            fueltype: row.fueltype,
            emissionsGKM: row.emissionsGKM,
            transmission: row.transmission,
            bodytype: row.bodytype,
            color: row.color,
            doors: row.doors,
            seats: row.seats,
            vin: row.vin,
            maxspeedKMH: row.maxspeedKMH,
            zeroToHundredSec: row.zeroToHundredSec,
            weightKG: row.weightKG,
            features: features,
            factoryExtras: row.factoryExtras,
            owner: {
                usertag: row.usertag,
                fullname: row.fullname
            },
            images: images.map(img => `${Configs.server.domain()}/media/cars/${img}`)
        }
    };
    conn.release();
    return res.status(200).json({
        success: true,
        auction: auctionDetails
    });
}