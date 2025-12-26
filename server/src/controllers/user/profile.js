import pool from '../../database/DB.js';
import { decryptData } from '../../utilities/Encrypt.js';

export async function getProfileController(req, res) {
    // #region Kapcsolat létrehozása és nyelvi beállítás lekérése
    const lang = req.lang;
    const conn = await pool.getConnection();
    // #endregion
    // #region Adott felhasználó keresese a usertoken alapján
    const user = req.params.usertag.toLowerCase();
    const selectQuery = 'SELECT usertoken, usertag, fullname, email, mobile, gender, birthdate, publicContacts, type FROM users WHERE usertag = ?';
    const selectParams = [user];
    const [rows] = await conn.query(selectQuery, selectParams);
    if (rows.length === 0) {
        pool.releaseConnection(conn);
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
    }
    // #endregion
    pool.releaseConnection(conn);
    return res.status(200).json(resJson);
}

export default {
    getProfileController,
};