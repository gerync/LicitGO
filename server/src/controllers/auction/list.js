import pool from '../../database/DB.js';
import convert from '../../utilities/exchange/convert.js';
import Configs from '../../configs/Configs.js';

export default async function ListAuctionsController(req, res) {
    const currency = req.currency;
    const lang = req.lang;
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
        // #endregion

        // #region Aukció státusz szűrő hozzáadása
        if (filters.status === 'upcoming') {
            whereConditions.push('auctions.starttime > NOW()');
        } else if (filters.status === 'ongoing') {
            whereConditions.push('auctions.starttime <= NOW() AND auctions.endtime >= NOW()');
        } else if (filters.status === 'ended') {
            whereConditions.push('auctions.endtime < NOW()');
        }

        // #region Ár szűrők a jelenlegi ár alapján (legmagasabb licit vagy kezdőár)
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
                auctions.id AS auctionId,
                auctions.carid AS carId,
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
        
        // #region Összes eredmény számlálása a lapozáshoz
        const countQuery = `
            SELECT COUNT(DISTINCT auctions.id) as total
            FROM auctions 
            INNER JOIN cars ON auctions.carid = cars.id 
            INNER JOIN users ON cars.ownertoken = users.usertoken 
            LEFT JOIN bids ON auctions.id = bids.auctionid 
            ${whereClause}
        `;
        const [countResult] = await conn.query(countQuery, params.slice(0, -2)); // Remove limit and offset
        const totalResults = countResult[0].total;
        const totalPages = Math.ceil(totalResults / limit);
        // #endregion
        // #region Ár átváltása a kért pénznemre
        const pricesToConvert = [];
        for (const row of rows) {
            const currentPrice = row.currentPrice || row.startingpriceUSD;
            pricesToConvert.push(currentPrice, row.reservepriceUSD);
        }
        const convertedPrices = await Promise.all(
            pricesToConvert.map(price => convert(price, 'USD', currency))
        );
        // #endregion
        // #region Válasz összeállítása
        const auctions = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const priceIndex = i * 2;
            
            // #region Képek feldolgozása
            let images = [];
            try {
                images = row.images ? JSON.parse(row.images) : [];
            } catch (e) {
                console.error('Failed to parse images JSON:', e);
            }
            // #endregion
            
            const currentPrice = row.currentPrice || row.startingpriceUSD;
            
            // #region Állapot és hátralévő idő kiszámítása
            const now = new Date();
            const start = new Date(row.starttime);
            const end = new Date(row.endtime);
            let status, timeRemaining = null;
            
            if (now < start) {
                status = lang === 'HU' ? 'Leendő' : 'upcoming';
                timeRemaining = Math.floor((start - now) / 1000);
            } else if (now >= start && now <= end) {
                status = lang === 'HU' ? 'Folyamatban' : 'ongoing';
                timeRemaining = Math.floor((end - now) / 1000);
            } else {
                status = lang === 'HU' ? 'Lezárt' : 'ended';
                timeRemaining = 0;
            }
            
            // Reserve price met check
            const reserveMet = row.reservepriceUSD ? currentPrice >= row.reservepriceUSD : true;
            
            auctions.push({
                auctionId: row.auctionId,
                carId: row.carId,
                currentPrice: convertedPrices[priceIndex],
                reservePriceUSD: convertedPrices[priceIndex + 1],
                reserveMet: reserveMet,
                bidCount: row.bidCount || 0,
                starttime: row.starttime,
                endtime: row.endtime,
                status: status,
                timeRemaining: timeRemaining,
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
                    mainImagepath: images[0] ? `${Configs.server.domain()}/media/cars/${images[0]}` : null
                }
            });
        }

        return res.status(200).json({
            success: true,
            auctions: auctions,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalResults: totalResults,
                resultsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });

    } catch (error) {
        throw error;
    } finally {
        conn.release();
    }
}
