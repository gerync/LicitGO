import pool from '../../database/DB.js';

export default async function AddCarController(req, res) {
    const lang = req.lang;
    const currency = req.currency;
    const ownertoken = req.usertoken;
    const conn = await pool.getConnection();

    const { manufacturer, model, odometerKM, modelyear, efficiency, efficiencyunit, 
        enginecapacity, fueltype, transmission, bodytype, color, 
        emissionsGKM, doors, seats, vin, maxspeedKMH, zeroToHundredSec, weightKG,
        features, factoryExtras } = req.body;

    // #region Ellenőrzés: ownertoken megléte
    if (!ownertoken) {
        throw new Error([ lang === 'HU' ? 'Hiányzó tulajdonos token.' : 'Missing owner token.', 400 ]);
    }

    try {
        // #region Értékek előfeldolgozása
        const roundedEfficiency = Number(Math.round((efficiency + Number.EPSILON) * 100) / 100);
        // #endregion
        // #region Features mező JSON stringgé alakítása
        const featuresJSON = typeof features === 'object' ? JSON.stringify(features) : features || null;
        // #endregion
        // #region Adatbázis beszúrás
        const query = `
            INSERT INTO cars (
                manufacturer, model, odometerKM, modelyear, efficiency, efficiencyunit,
                enginecapacityCC, fueltype, transmission, bodytype, color, doors, seats,
                vin, emissionsGKM, maxspeedKMH, zeroToHundredSec, weightKG, factoryExtras,
                features, ownertoken
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            manufacturer,
            model,
            odometerKM,
            modelyear,
            roundedEfficiency,
            efficiencyunit,
            enginecapacity,
            fueltype,
            transmission,
            bodytype,
            color,
            doors,
            seats,
            vin,
            emissionsGKM || null,
            maxspeedKMH || null,
            zeroToHundredSec || null,
            weightKG || null,
            factoryExtras || null,
            featuresJSON,
            ownertoken
        ];

        const result = await conn.query(query, values);
        // #endregion
        // #region Válasz visszaadása
        const carId = result[0].insertId;
        pool.releaseConnection(conn);
        return res.status(201).json({
            success: true,
            message: lang === 'HU' ? 'Autó sikeresen hozzáadva.' : 'Car added successfully.',
            carId: carId
        });
        // #endregion

    } catch (error) {
        pool.releaseConnection(conn);
        // #region Ütközés kezelése VIN kód alapján
        if (error.message.includes('Duplicate entry') || error.code === 'ER_DUP_ENTRY') {
            throw new Error([ lang === 'HU' ? 'Már létezik ilyen VIN kóddal autó.' : 'A car with this VIN already exists.', 409 ]);
        }
        // #endregion
        throw error;
    }
}