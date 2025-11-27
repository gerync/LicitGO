import handleStatus from "../../lang/HandleStatus";
import DBconnection from "../../db/connection.js";
import express from "express";

const router = express.Router();

router.post('/', async (req, res) => {
    let lang = req.headers['accept-language'] || 'EN';
    const conn = await DBconnection.getConnection();
    if (!lang.toUpperCase().includes('EN') && !lang.toUpperCase().includes('HU')) {
        lang = 'EN';
    }
    const sessionToken = req.cookies['sessiontoken'] || req.signedCookies['sessiontoken'];
    if (!sessionToken) {
        conn.release();
        return res.status(404).json({ message: handleStatus('1001', lang) });
    }
    res.clearCookie('sessiontoken');
    conn.release();
    return res.status(200).json({ message: handleStatus('200', lang) });
});

export default router;