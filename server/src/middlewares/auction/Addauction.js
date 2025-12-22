import ObjectLength from "../../utilities/ObjectLength.js";
export default function AddAuctionMiddleware(req, res, next) {
    const [ carid, startingBid, reservePrice, starttime, endtime ] = req.body;
    const lang = req.lang;
    if (ObjectLength(req.body, 5) == -1) {
        throw new Error([ lang === 'HU' ? "Hiányzó mezők az aukció létrehozásához." : "Missing fields for creating the auction.", 400 ]);
    }
    if (ObjectLength(req.body, 5) == 1) {
        throw new Error([ lang === 'HU' ? "Túl sok mező van az aukció létrehozásához." : "Too many fields for creating the auction.", 400 ]);
    }
    if (!carid || !startingBid || !reservePrice || !starttime || !endtime) {
        throw new Error([ lang === 'HU' ? "Az aukció létrehozásához minden mező kitöltése kötelező." : "All fields are required to create the auction.", 400 ]);
    }
    if (isNaN(Number(carid))) {
        throw new Error([ lang === 'HU' ? "A 'carid' mezőnek numerikus értéknek kell lennie." : "The 'carid' field must be a numeric value.", 400 ]);
    }
    if (isNaN(Number(startingBid))) {
        throw new Error([ lang === 'HU' ? "A 'startingBid' mezőnek numerikus értéknek kell lennie." : "The 'startingBid' field must be a numeric value.", 400 ]);
    }
    if (isNaN(Number(reservePrice))) {
        throw new Error([ lang === 'HU' ? "A 'reservePrice' mezőnek numerikus értéknek kell lennie." : "The 'reservePrice' field must be a numeric value.", 400 ]);
    }
    req.body.carid = Number(carid);
    req.body.startingBid = Number(startingBid);
    req.body.reservePrice = Number(reservePrice);
    if (isNaN(Date.parse(starttime))) {
        throw new Error([ lang === 'HU' ? "A 'starttime' mezőnek érvényes dátum formátumúnak kell lennie." : "The 'starttime' field must be a valid date format.", 400 ]);
    }
    if (isNaN(Date.parse(endtime))) {
        throw new Error([ lang === 'HU' ? "Az 'endtime' mezőnek érvényes dátum formátumúnak kell lennie." : "The 'endtime' field must be a valid date format.", 400 ]);
    }
    req.body.starttime = new Date(starttime);
    req.body.endtime = new Date(endtime);
    if (req.body.starttime >= req.body.endtime) {
        throw new Error([ lang === 'HU' ? "Az aukció kezdési idejének korábbinak kell lennie a befejezési időnél." : "The auction start time must be earlier than the end time.", 400 ]);
    }
    if (req.body.starttime <= new Date()) {
        throw new Error([ lang === 'HU' ? "Az aukció kezdési idejének a jövőben kell lennie." : "The auction start time must be in the future.", 400 ]);
    }
    next();
}