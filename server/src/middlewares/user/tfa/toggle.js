import ObjectLength from '../../../utilities/ObjectLength.js';
// Middleware: Kétlépcsős azonosítás toggle validálás (enable mező)
export default function toggleTFAMiddleware(req, res, next) {
    // #region Nyelvbeállítás és enable mező ellenőrzése
    const lang = (req.cookies.language || 'EN').toUpperCase();
    const { enable } = req.body;
    if (!enable) {
        return res.status(400).send(lang === 'HU' ? 'Az enable mező megadása kötelező.' : 'The enable field is required.');
    }
    if (typeof enable !== 'boolean') {
        return res.status(400).send(lang === 'HU' ? 'Az enable mező boolean típusú kell legyen.' : 'The enable field must be boolean.');
    }
    // #endregion
    // #region Objektum mezőszám ellenőrzése (pontosan 1 mező)
    if (ObjectLength(req.body, 1) === 1) {
        return res.status(400).send(lang === 'HU' ? 'Egyetlen mező engedélyezett.' : 'Only one field is allowed.');
    }
    if (ObjectLength(req.body, 1) === -1) {
        return res.status(400).send(lang === 'HU' ? 'Egyetlen mező engedélyezett.' : 'Only one field is allowed.');
    }
    // #endregion
    next();
}