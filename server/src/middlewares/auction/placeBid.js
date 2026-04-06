export default function placeBidMiddleware(req, res, next) {
    // #region licit adatainak ellenőrzése
    const auctionID = req.params.auctionID ?? req.body.auctionId ?? req.body.auctionID ?? req.body.auctionid;
    const bidamount = req.body.bidamount ?? req.body.amount ?? req.body.bidAmount ?? req.body.Amount;
    const lang = req.lang;
    
    if (!auctionID || isNaN(parseInt(auctionID))) {
        throw new Error (lang === 'HU' ? 'Érvénytelen aukció.' : 'Invalid auction.');
    }
    if (bidamount === undefined || bidamount === null || isNaN(parseFloat(bidamount)) || parseFloat(bidamount) <= 0) {
        throw new Error (lang === 'HU' ? 'Érvénytelen licit összeg.' : 'Invalid bid amount.');
    }
    // client may send { auctionId, amount } or { bidamount }
    // no strict body key length check to allow either shape
    // #endregion
    next();
}