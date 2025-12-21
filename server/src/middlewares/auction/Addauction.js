import ObjectLength from "../../utilities/ObjectLength.js";
export default function AddAuctionMiddleware(req, res, next) {
    const [ carid, startingBid, reservePrice, starttime, endtime ] = req.body;
    if (ObjectLength(req.body, 5) == -1) {
        return res.status(400).json({ error: "Hiányzó mezők az aukció létrehozásához." });
    }
    if (ObjectLength(req.body, 5) == 1) {
        return res.status(400).json({ error: "Túl sok mező van az aukció létrehozásához." });
    }
    if (!carid || !startingBid || !reservePrice || !starttime || !endtime) {
        return res.status(400).json({ error: "Az aukció létrehozásához minden mező kitöltése kötelező." });
    }
    if (isNaN(Number(carid))) {
        return res.status(400).json({ error: "A 'carid' mezőnek numerikus értéknek kell lennie." });
    }
    if (isNaN(Number(startingBid))) {
        return res.status(400).json({ error: "A 'startingBid' mezőnek numerikus értéknek kell lennie." });
    }
    if (isNaN(Number(reservePrice))) {
        return res.status(400).json({ error: "A 'reservePrice' mezőnek numerikus értéknek kell lennie." });
    }
    req.body.carid = Number(carid);
    req.body.startingBid = Number(startingBid);
    req.body.reservePrice = Number(reservePrice);
    if (isNaN(Date.parse(starttime))) {
        return res.status(400).json({ error: "A 'starttime' mezőnek érvényes dátum formátumúnak kell lennie." });
    }
    if (isNaN(Date.parse(endtime))) {
        return res.status(400).json({ error: "Az 'endtime' mezőnek érvényes dátum formátumúnak kell lennie." });
    }
    req.body.starttime = new Date(starttime);
    req.body.endtime = new Date(endtime);
    if (req.body.starttime >= req.body.endtime) {
        return res.status(400).json({ error: "Az aukció kezdési idejének korábbinak kell lennie a befejezési időnél." });
    }
    if (req.body.starttime <= new Date()) {
        return res.status(400).json({ error: "Az aukció kezdési idejének a jövőben kell lennie." });
    }
    next();
}