export default function placeBidMiddleware(req, res, next) {
    // #region licit adatainak ellenőrzése
    const auctionID = req.params.auctionID;
    const { bidamount } = req.body;
    const lang = req.lang;
    
    if (!auctionID || isNaN(parseInt(auctionID))) {
        throw new Error (lang === 'HU' ? 'Érvénytelen aukció.' : 'Invalid auction.');
    }
    if (!bidamount || isNaN(parseFloat(bidamount)) || parseFloat(bidamount) <= 0) {
        throw new Error (lang === 'HU' ? 'Érvénytelen licit összeg.' : 'Invalid bid amount.');
    }
    if (Object.keys(req.body).length !== 1) {
        throw new Error (lang === 'HU' ? 'Csak a licit összeg adható meg.' : 'Only the bid amount can be provided.');
    }
    // #endregion
    next();
}