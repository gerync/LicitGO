import ObjectLength from '../../utilities/ObjectLength.js';
export default function AddAuctionMiddleware(req, res, next) {
    const [ carid, startingBid, reservePrice, starttime, endtime ] = req.body;
    const lang = req.lang;
    if (ObjectLength(req.body, 5) == -1) {
        throw new Error([ lang === 'HU' ? 'Hiányzó mezők az aukció létrehozásához.' : 'Missing fields for creating the auction.', 400 ]);
    }
    if (ObjectLength(req.body, 5) == 1) {
        throw new Error([ lang === 'HU' ? 'Túl sok mező van az aukció létrehozásához.' : 'Too many fields for creating the auction.', 400 ]);
    }
    if (!carid || !startingBid || !reservePrice || !starttime || !endtime) {
        throw new Error([ lang === 'HU' ? 'Az aukció létrehozásához minden mező kitöltése kötelező.' : 'All fields are required to create the auction.', 400 ]);
    }
    if (isNaN(parseInt(carid))) {
        throw new Error([ lang === 'HU' ? 'A kiválasztott autó érvénytelen' : 'The selected car is invalid.', 400 ]);
    }
    if (isNaN(parseInt(startingBid))) {
        throw new Error([ lang === 'HU' ? 'A kezdeti licitnek numerikus értéknek kell lennie.' : 'The starting bid must be a numeric value.', 400 ]);
    }
    if (isNaN(parseInt(reservePrice))) {
        throw new Error([ lang === 'HU' ? 'A fenntartási árnak numerikus értéknek kell lennie.' : 'The reserve price must be a numeric value.', 400 ]);
    }
    req.body.carid = parseInt(carid);
    req.body.startingBid = parseInt(startingBid);
    req.body.reservePrice = parseInt(reservePrice);
    if (isNaN(Date.parse(starttime))) {
        throw new Error([ lang === 'HU' ? 'A licit indulásának érvényes dátum formátumúnak kell lennie.' : 'The starting time must be a valid date format.', 400 ]);
    }
    if (isNaN(Date.parse(endtime))) {
        throw new Error([ lang === 'HU' ? 'Az licit befejezésének érvényes dátum formátumúnak kell lennie.' : 'The ending time must be a valid date format.', 400 ]);
    }
    req.body.starttime = new Date(starttime);
    req.body.endtime = new Date(endtime);
    if (req.body.starttime >= req.body.endtime) {
        throw new Error([ lang === 'HU' ? 'Az aukció kezdési idejének korábbinak kell lennie a befejezési időnél.' : 'The auction start time must be earlier than the end time.', 400 ]);
    }
    if (req.body.starttime <= new Date()) {
        throw new Error([ lang === 'HU' ? 'Az aukció kezdési idejének a jövőben kell lennie.' : 'The auction start time must be in the future.', 400 ]);
    }
    next();
}