import pool from '../../database/DB.js';
import { decryptData } from '../../utilities/Encrypt.js';
import Configs from '../../configs/Configs.js';

export async function getProfileController(req, res) {
    // #region Kapcsolat létrehozása és nyelvi beállítás lekérése
    const lang = req.lang;
    const conn = await pool.getConnection();
    // #endregion
    // #region Adott felhasználó keresese a usertoken alapján
    const user = req.params.usertag.toLowerCase();
    const selectQuery = `
        SELECT u.usertoken, u.usertag, u.fullname, u.email, u.mobile, u.gender, u.birthdate, u.publicContacts, u.type, p.filename AS pfpFilename
        FROM users u
        LEFT JOIN profpics p ON p.usertoken = u.usertoken
        WHERE u.usertag = ?`;
    const selectParams = [user];
    const [rows] = await conn.query(selectQuery, selectParams);
    if (rows.length === 0) {
        conn.release();
        throw new Error([ lang === 'HU' ? 'Felhasználó nem található.' : 'User not found.', 404 ]);
    }
    const userData = rows[0];
    // #endregion
    // #region Felhasználó aukcióinak és licitjainak megszámlálása
    const UsersAuctionsQuery = 'SELECT COUNT(*) AS auctionCount FROM auctions INNER JOIN cars ON auctions.carid = cars.id WHERE cars.ownertoken = ?';
    const UsersAuctionsParams = [userData.usertoken];
    const [auctionRows] = await conn.query(UsersAuctionsQuery, UsersAuctionsParams);
    const UsersBidsQuery = 'SELECT COUNT(*) AS bidCount FROM bids WHERE bidder = ?';
    const UsersBidsParams = [userData.usertoken];
    const [bidRows] = await conn.query(UsersBidsQuery, UsersBidsParams);
    // #endregion
    // #region Érzékeny adatok dekódolása
    const publicContacts = Boolean(userData.publicContacts);
    const pfp = userData.pfpFilename ? `${Configs.server.domain()}/media/users/${userData.pfpFilename}` : null;
    let resJson = {};
    if (!publicContacts) {
        resJson.fullname = decryptData(userData.fullname);
        resJson.usertag = userData.usertag;
        resJson.gender = userData.gender;
        // kizárólag az év jelenik meg a születési dátumból
        resJson.birthdate = userData.birthdate ? new Date(userData.birthdate).getFullYear() : null;
        resJson.type = userData.type;
        resJson.email = lang === 'HU' ? 'A felhasználó elrejtette az email címét.' : 'The user has hidden their email address.';
        resJson.mobile = lang === 'HU' ? 'A felhasználó elrejtette a telefonszámát.' : 'The user has hidden their mobile number.';
        resJson.pfp = pfp;
    }
    else {
        resJson.fullname = decryptData(userData.fullname);
        resJson.usertag = userData.usertag;
        resJson.email = decryptData(userData.email);
        resJson.mobile = decryptData(userData.mobile);
        resJson.gender = userData.gender;
        resJson.birthdate = userData.birthdate ? new Date(userData.birthdate).toISOString().split('T')[0] : null;
        resJson.type = userData.type;
        resJson.auctionCount = auctionRows[0].auctionCount;
        resJson.bidCount = bidRows[0].bidCount;
        resJson.pfp = pfp;
    }
    // #endregion
    // #region Saját autók lekérése (max 50, legfrissebb elöl)
    try {
        const carsQuery = `SELECT id, manufacturer, model, modelyear, odometerKM, efficiency, efficiencyunit, images FROM cars WHERE ownertoken = ? ORDER BY id DESC LIMIT 50`;
        const [carsRows] = await conn.query(carsQuery, [userData.usertoken]);

        const cars = carsRows.map(row => {
            let images = [];
            try { images = row.images ? JSON.parse(row.images) : []; } catch (e) { images = []; }
            return {
                id: row.id,
                manufacturer: row.manufacturer,
                model: row.model,
                modelyear: row.modelyear,
                odometerKM: row.odometerKM,
                efficiency: row.efficiency,
                efficiencyunit: row.efficiencyunit,
                mainImagepath: images[0] ? (images[0].startsWith('http://') || images[0].startsWith('https://') ? images[0] : `${Configs.server.domain()}/media/cars/${images[0]}`) : null
            };
        });

        // Provide both `cars` and a fallback `auctions` shaped array so frontend can display cards
        resJson.cars = cars;
        resJson.auctions = cars.map(c => ({
            auctionId: null,
            carId: c.id,
            currentPrice: null,
            reservePriceUSD: null,
            reserveMet: false,
            bidCount: 0,
            starttime: null,
            endtime: null,
            status: lang === 'HU' ? 'Nincs aukció' : 'no-auction',
            timeRemaining: 0,
            car: {
                manufacturer: c.manufacturer,
                model: c.model,
                modelyear: c.modelyear,
                odometerKM: c.odometerKM,
                efficiency: c.efficiency,
                efficiencyunit: c.efficiencyunit,
                mainImagepath: c.mainImagepath
            }
        }));
    } catch (err) {
        // If fetching cars fails, continue without cars
        console.error('Failed to fetch user cars for profile:', err);
    }

    conn.release();
    return res.status(200).json(resJson);
}

export default {
    getProfileController,
};