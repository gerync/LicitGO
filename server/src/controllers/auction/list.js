import pool from '../../database/DB.js';
import convert from '../../utilities/exchange/convert.js';
import Configs from '../../configs/Configs.js';

export default async function ListAuctionsController(req, res) {
    const currency = req.currency;
    const page = parseInt(req.page);
    const limit = parseInt(req.limit);
    const offset = (page - 1) * limit;
    const filters = req.filters;
    const sorting = req.sorting;
    const conn = await pool.getConnection();

    try {
        // #region Query összeállítása szűrők alapján
        const whereConditions = [];
        const params = [];

        if (filters.manufacturer) {
            whereConditions.push('cars.manufacturer = ?');
            params.push(filters.manufacturer);
        }
        if (filters.model) {
            whereConditions.push('cars.model = ?');
            params.push(filters.model);
        }
        if (filters.minYear !== null) {
            whereConditions.push('cars.modelyear >= ?');
            params.push(filters.minYear);
        }
        if (filters.maxYear !== null) {
            whereConditions.push('cars.modelyear <= ?');
            params.push(filters.maxYear);
        }
        if (filters.fueltype) {
            whereConditions.push('cars.fueltype = ?');
            params.push(filters.fueltype);
        }
        if (filters.bodytype) {
            whereConditions.push('cars.bodytype = ?');
            params.push(filters.bodytype);
        }
        if (filters.color) {
            whereConditions.push('cars.color = ?');
            params.push(filters.color);
        }
        if (filters.minOdometer !== null) {
            whereConditions.push('cars.odometerKM >= ?');
            params.push(filters.minOdometer);
        }
        if (filters.maxOdometer !== null) {
            whereConditions.push('cars.odometerKM <= ?');
            params.push(filters.maxOdometer);
        }
        if (filters.minReservePrice !== null) {
            whereConditions.push('auctions.reservepriceUSD >= ?');
            params.push(filters.minReservePrice);
        }
        if (filters.maxReservePrice !== null) {
            whereConditions.push('auctions.reservepriceUSD <= ?');
            params.push(filters.maxReservePrice);
        }

        // Aukció státusz szűrő (upcoming, ongoing, ended)
        if (filters.status === 'upcoming') {
            whereConditions.push('auctions.starttime > NOW()');
        } else if (filters.status === 'ongoing') {
            whereConditions.push('auctions.starttime <= NOW() AND auctions.endtime >= NOW()');
        } else if (filters.status === 'ended') {
            whereConditions.push('auctions.endtime < NOW()');
        }

        // Ár szűrők a jelenlegi ár alapján (legmagasabb licit vagy kezdőár)
        if (filters.minPrice !== null) {
            whereConditions.push('COALESCE(MAX(bids.bidamountUSD), auctions.startingpriceUSD) >= ?');
            params.push(filters.minPrice);
        }
        if (filters.maxPrice !== null) {
            whereConditions.push('COALESCE(MAX(bids.bidamountUSD), auctions.startingpriceUSD) <= ?');
            params.push(filters.maxPrice);
        }

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
        // #endregion

        // #region Rendezés összeállítása
        let orderByClause = '';
        switch (sorting.sortBy) {
            case 'price':
                orderByClause = `ORDER BY currentPrice ${sorting.sortOrder}`;
                break;
            case 'bidcount':
                orderByClause = `ORDER BY bidCount ${sorting.sortOrder}`;
                break;
            case 'manufacturer':
                orderByClause = `ORDER BY cars.manufacturer ${sorting.sortOrder}`;
                break;
            case 'model':
                orderByClause = `ORDER BY cars.model ${sorting.sortOrder}`;
                break;
            case 'date':
            default:
                orderByClause = `ORDER BY auctions.starttime ${sorting.sortOrder}`;
                break;
        }
        // #endregion

        const query = `
            SELECT 
                auctions.id,
                auctions.carid,
                auctions.startingpriceUSD,
                auctions.reservepriceUSD,
                auctions.starttime,
                auctions.endtime,
                cars.*,
                users.usertag,
                COALESCE(MAX(bids.bidamountUSD), auctions.startingpriceUSD) AS currentPrice,
                COUNT(bids.id) AS bidCount
            FROM auctions 
            INNER JOIN cars ON auctions.carid = cars.id 
            INNER JOIN users ON cars.ownertoken = users.usertoken 
            LEFT JOIN bids ON auctions.id = bids.auctionid 
            ${whereClause}
            GROUP BY auctions.id 
            ${orderByClause}
            LIMIT ? OFFSET ?
        `;

        params.push(limit, offset);
        const [rows] = await conn.query(query, params);
        
        const auctions = [];
        for (const row of rows) {
            // #region Képek feldolgozása
            let images = [];
            try {
                images = row.images ? JSON.parse(row.images) : [];
            } catch (e) {
                console.error('Failed to parse images JSON:', e);
            }
            // #endregion
            
            const currentPrice = row.currentPrice || row.startingpriceUSD;
            
            auctions.push({
                auctionId: row.id,
                carId: row.carid,
                currentPrice: await convert(currentPrice, 'USD', currency),
                reservePriceUSD: await convert(row.reservepriceUSD, 'USD', currency),
                bidCount: row.bidCount || 0,
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
                    odometerKM: row.odometerKM,
                    efficiency: row.efficiency,
                    efficiencyunit: row.efficiencyunit,
                    enginecapacityCC: row.enginecapacityCC,
                    fueltype: row.fueltype,
                    transmission: row.transmission,
                    bodytype: row.bodytype,
                    color: row.color,
                    doors: row.doors,
                    seats: row.seats,
                    vin: row.vin,
                    maxspeedKMH: row.maxspeedKMH,
                    zeroToHundredSec: row.zeroToHundredSec,
                    weightKG: row.weightKG,
                    owner: row.usertag,
                    mainImagepath: images[0] ? `${Configs.server.domain}/media/cars/${images[0]}` : null
                }
            });
        }

        pool.releaseConnection(conn);
        return res.status(200).json({
            success: true,
            auctions: auctions
        });

    } catch (error) {
        pool.releaseConnection(conn);
        throw error;
    }
}
