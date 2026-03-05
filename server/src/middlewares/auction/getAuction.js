export default async function getAuctionMiddleware(req, res, next) {
    const auctionId = req.params.auctionId;
    if (isNaN(auctionId) || auctionId < 1) {
        throw new Error([ req.lang === 'HU' ? 'Érvénytelen aukció azonosító.' : 'Invalid auction ID.', 400 ]);
    }
    req.auctionId = parseInt(auctionId);
    next();
}