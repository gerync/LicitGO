import ObjectLength from '../../utilities/ObjectLength.js';
export default function AddCarMiddleware(req, res, next) {
    //#region Bemeneti adatok kinyerése
    let { manufacturer, model, odometerKM, modelyear, efficiency, efficiencyunit, 
        enginecapacity, fueltype, transmission, bodytype, color, description, 
        emissionsGKM, doors, seats, vin, maxspeedKMH, zeroToHundredSec, weightKG,
        features, factoryExtras } = req.body;
    //#endregion

    //#region Nyelv meghatározása
    const lang = req.lang;
    //#endregion

    //#region Típuskonverziók
    // Szövegek trim-elése és típusba kényszerítése
    if (manufacturer !== undefined) manufacturer = manufacturer.toString().trim();
    if (model !== undefined) model = model.toString().trim();
    if (color !== undefined) color = color.toString().trim();
    if (description !== undefined) description = description.toString();
    if (factoryExtras !== undefined) factoryExtras = factoryExtras.toString();
    if (vin !== undefined) vin = vin.toString().trim().toUpperCase();

    // Számok konverziója (csak ha meg van adva)
    if (odometerKM !== undefined && typeof odometerKM !== 'number') odometerKM = parseInt(odometerKM);
    if (modelyear !== undefined && typeof modelyear !== 'number') modelyear = parseInt(modelyear);
    if (efficiency !== undefined && typeof efficiency !== 'number') efficiency = parseFloat(efficiency);
    if (enginecapacity !== undefined && typeof enginecapacity !== 'number') enginecapacity = parseInt(enginecapacity);
    if (emissionsGKM !== undefined && typeof emissionsGKM !== 'number') emissionsGKM = parseInt(emissionsGKM);
    if (doors !== undefined && typeof doors !== 'number') doors = parseInt(doors);
    if (seats !== undefined && typeof seats !== 'number') seats = parseInt(seats);
    if (maxspeedKMH !== undefined && typeof maxspeedKMH !== 'number') maxspeedKMH = parseInt(maxspeedKMH);
    if (zeroToHundredSec !== undefined && typeof zeroToHundredSec !== 'number') zeroToHundredSec = parseFloat(zeroToHundredSec);
    if (weightKG !== undefined && typeof weightKG !== 'number') weightKG = parseInt(weightKG);

    // Enumerációk normalizálása a DB-hez illő casingre
    if (efficiencyunit !== undefined) {
        const eu = efficiencyunit.toString().trim().toUpperCase();
        efficiencyunit = eu === 'KW' ? 'kW' : eu === 'HP' ? 'HP' : efficiencyunit;
    }
    if (fueltype !== undefined) {
        const ft = fueltype.toString().trim().toLowerCase();
        const allowedFuel = ['gasoline','diesel','electric','hybrid','other'];
        if (allowedFuel.includes(ft)) fueltype = ft;
    }
    if (transmission !== undefined) {
        const tm = transmission.toString().trim().toLowerCase();
        const map = { 'manual':'manual','automatic':'automatic','semi-automatic':'semi-automatic','cvt':'CVT','dual-clutch':'dual-clutch','other':'other' };
        if (map[tm]) transmission = map[tm];
    }
    if (bodytype !== undefined) {
        const bt = bodytype.toString().trim().toLowerCase();
        const map = { 'sedan':'sedan','hatchback':'hatchback','suv':'SUV','coupe':'coupe','convertible':'convertible','wagon':'wagon','van':'van','truck':'truck','other':'other' };
        if (map[bt]) bodytype = map[bt];
    }
    //#endregion

    //#region Jellemzők (features) feldolgozása
    if (typeof features === 'string') {
        try {
            features = JSON.parse(features);
        } catch (e) {
            throw new Error([ lang === 'HU' ? 'Érvénytelen jellemzők formátum.' : 'Invalid features format.', 400 ]);
        }
    }
    if (features !== undefined && (typeof features !== 'object' || features === null)) {
        throw new Error([ lang === 'HU' ? 'Érvénytelen jellemzők formátum.' : 'Invalid features format.', 400 ]);
    }
    //#endregion

    //#region Kötelező mezők és tartományok
    if (!manufacturer) {
        throw new Error([ lang === 'HU' ? 'A gyártó megadása kötelező.' : 'Manufacturer is required.', 400 ]);
    }
    if (manufacturer.length > 100) {
        throw new Error([ lang === 'HU' ? 'A gyártó neve legfeljebb 100 karakter lehet.' : 'Manufacturer must be at most 100 characters.', 400 ]);
    }
    if (!model) {
        throw new Error([ lang === 'HU' ? 'A modell megadása kötelező.' : 'Model is required.', 400 ]);
    }
    if (model.length > 150) {
        throw new Error([ lang === 'HU' ? 'A modell neve legfeljebb 150 karakter lehet.' : 'Model must be at most 150 characters.', 400 ]);
    }
    if (!color) {
        throw new Error([ lang === 'HU' ? 'A szín megadása kötelező.' : 'Color is required.', 400 ]);
    }
    if (color.length > 50) {
        throw new Error([ lang === 'HU' ? 'A szín legfeljebb 50 karakter lehet.' : 'Color must be at most 50 characters.', 400 ]);
    }
    if (isNaN(odometerKM) || odometerKM < 0) {
        throw new Error([ lang === 'HU' ? 'Érvénytelen óraállás.' : 'Invalid odometer reading.', 400 ]);
    }
    if (isNaN(modelyear) || modelyear < 1886 || modelyear > new Date().getFullYear() + 1) {
        throw new Error([ lang === 'HU' ? 'Érvénytelen gyártási év.' : 'Invalid model year.', 400 ]);
    }
    if (isNaN(efficiency) || efficiency < 0 || efficiency >= 100) {
        throw new Error([ lang === 'HU' ? 'Érvénytelen teljesítmény (0–99.99).' : 'Invalid efficiency (0–99.99).', 400 ]);
    }
    if (isNaN(enginecapacity) || enginecapacity <= 0) {
        throw new Error([ lang === 'HU' ? 'Érvénytelen hengerűrtartalom.' : 'Invalid engine capacity.', 400 ]);
    }
    if (emissionsGKM !== undefined && emissionsGKM !== null && emissionsGKM !== '' && (isNaN(emissionsGKM) || emissionsGKM < 0)) {
        throw new Error([ lang === 'HU' ? 'Érvénytelen kibocsátási érték.' : 'Invalid emissions value.', 400 ]);
    }
    if (isNaN(doors) || doors <= 0 || !Number.isInteger(doors)) {
        throw new Error([ lang === 'HU' ? 'Érvénytelen ajtók száma.' : 'Invalid number of doors.', 400 ]);
    }
    if (isNaN(seats) || seats <= 0 || !Number.isInteger(seats)) {
        throw new Error([ lang === 'HU' ? 'Érvénytelen ülések száma.' : 'Invalid number of seats.', 400 ]);
    }
    if (!vin) {
        throw new Error([ lang === 'HU' ? 'A VIN megadása kötelező.' : 'VIN is required.', 400 ]);
    }
    if (vin.length !== 17 || !/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
        throw new Error([ lang === 'HU' ? 'Érvénytelen VIN (17 karakter, I,O,Q nélkül).' : 'Invalid VIN (17 chars, excludes I,O,Q).', 400 ]);
    }
    if (maxspeedKMH !== undefined && maxspeedKMH !== null && maxspeedKMH !== '' && (isNaN(maxspeedKMH) || maxspeedKMH < 0)) {
        throw new Error([ lang === 'HU' ? 'Érvénytelen végsebesség.' : 'Invalid max speed.', 400 ]);
    }
    if (zeroToHundredSec !== undefined && zeroToHundredSec !== null && zeroToHundredSec !== '' && (isNaN(zeroToHundredSec) || zeroToHundredSec < 0)) {
        throw new Error([ lang === 'HU' ? 'Érvénytelen gyorsulási idő.' : 'Invalid zero to hundred time.', 400 ]);
    }
    if (weightKG !== undefined && weightKG !== null && weightKG !== '' && (isNaN(weightKG) || weightKG < 0)) {
        throw new Error([ lang === 'HU' ? 'Érvénytelen súly.' : 'Invalid weight.', 400 ]);
    }
    //#endregion

    //#region Enumerációk (megengedett értékek)
    if (efficiencyunit !== 'HP' && efficiencyunit !== 'kW') {
        throw new Error([ lang === 'HU' ? 'Érvénytelen teljesítmény egység.' : 'Invalid efficiency unit.', 400 ]);
    }
    if (!['gasoline', 'diesel', 'electric', 'hybrid', 'other'].includes(fueltype)) {
        throw new Error([ lang === 'HU' ? 'Érvénytelen üzemanyag típus.' : 'Invalid fuel type.', 400 ]);
    }
    if (!['manual', 'automatic', 'semi-automatic', 'CVT', 'dual-clutch', 'other'].includes(transmission)) {
        throw new Error([ lang === 'HU' ? 'Érvénytelen váltó típus.' : 'Invalid transmission type.', 400 ]);
    }
    if (!['sedan', 'hatchback', 'SUV', 'coupe', 'convertible', 'wagon', 'van', 'truck', 'other'].includes(bodytype)) {
        throw new Error([ lang === 'HU' ? 'Érvénytelen karosszéria típus.' : 'Invalid body type.', 400 ]);
    }
    //#endregion

    //#region Opcionális mezők formátumellenőrzése
    if (features !== undefined && typeof features !== 'object') {
        throw new Error([ lang === 'HU' ? 'Érvénytelen jellemzők formátum.' : 'Invalid features format.', 400 ]);
    }
    if (factoryExtras && typeof factoryExtras !== 'string') {
        throw new Error([ lang === 'HU' ? 'Érvénytelen gyári extrák formátum.' : 'Invalid factory extras format.', 400 ]);
    }
    if (ObjectLength(req.body, 12, 15) === 1) {
        throw new Error([ lang === 'HU' ? 'Túl sok mező lett megadva.' : 'Too many fields provided.', 400 ]);
    }
    if (ObjectLength(req.body, 12, 15) === -1) {
        throw new Error([ lang === 'HU' ? 'Túl kevés mező lett megadva.' : 'Too few fields provided.', 400 ]);
    }
    //#endregion
    //#region Normalizált értékek visszaírása a kérésebe
    req.body.manufacturer = manufacturer;
    req.body.model = model;
    req.body.color = color;
    req.body.odometerKM = odometerKM;
    req.body.modelyear = modelyear;
    req.body.efficiency = efficiency;
    req.body.efficiencyunit = efficiencyunit;
    req.body.enginecapacity = enginecapacity;
    req.body.enginecapacityCC = enginecapacity;
    req.body.fueltype = fueltype;
    req.body.transmission = transmission;
    req.body.bodytype = bodytype;
    req.body.description = description;
    req.body.emissionsGKM = emissionsGKM === '' ? undefined : emissionsGKM;
    req.body.doors = doors;
    req.body.seats = seats;
    req.body.vin = vin;
    req.body.maxspeedKMH = (maxspeedKMH === '' ? undefined : maxspeedKMH);
    req.body.zeroToHundredSec = (zeroToHundredSec === '' ? undefined : zeroToHundredSec);
    req.body.weightKG = (weightKG === '' ? undefined : weightKG);
    req.body.factoryExtras = factoryExtras;
    req.body.features = features;
    //#endregion

    //#region Továbbküldés a következő middleware/handler felé
    next();
    //#endregion
}