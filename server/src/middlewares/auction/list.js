export default async function ListAuctionsMiddleware(req, res, next) {
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;
    if (isNaN(page) || page < 1) {
        page = 1;
    }
    if (isNaN(limit) || limit < 1 || limit > 50) {
        limit = 15;
    }
    req.page = parseInt(page);
    req.limit = parseInt(limit);
    
    // #region Filter parameterek feldolgozása
    req.filters = {
        // Autó szűrők
        manufacturer: req.query.manufacturer?.trim() || null,
        model: req.query.model?.trim() || null,
        minYear: req.query.minYear ? parseInt(req.query.minYear) : null,
        maxYear: req.query.maxYear ? parseInt(req.query.maxYear) : null,
        fueltype: req.query.fueltype?.trim() || null,
        bodytype: req.query.bodytype?.trim() || null,
        color: req.query.color?.trim() || null,
        minOdometer: req.query.minOdometer ? parseInt(req.query.minOdometer) : null,
        maxOdometer: req.query.maxOdometer ? parseInt(req.query.maxOdometer) : null,
        
        // Aukció szűrők
        status: req.query.status?.toLowerCase() || null,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null,
        minReservePrice: req.query.minReservePrice ? parseFloat(req.query.minReservePrice) : null,
        maxReservePrice: req.query.maxReservePrice ? parseFloat(req.query.maxReservePrice) : null
    };
    // #endregion
    
    // #region Sorting paraméterek feldolgozása
    const sortBy = req.query.sortBy?.toLowerCase() || 'date';
    const sortOrder = req.query.sortOrder?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    
    const validSortFields = ['price', 'bidcount', 'manufacturer', 'model', 'date'];
    req.sorting = {
        sortBy: validSortFields.includes(sortBy) ? sortBy : 'date',
        sortOrder: sortOrder
    };
    // #endregion
    
    next();
}