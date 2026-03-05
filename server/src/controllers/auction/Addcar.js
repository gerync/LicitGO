import pool from '../../database/DB.js';
import path from 'path';

export default async function AddCarController(req, res) {
    const lang = req.lang;
    const ownertoken = req.usertoken;
    const conn = await pool.getConnection();

    const { manufacturer, model, odometerKM, modelyear, efficiency, efficiencyunit, 
        enginecapacity, fueltype, transmission, bodytype, color, 
        emissionsGKM, doors, seats, vin, maxspeedKMH, zeroToHundredSec, weightKG,
        features, factoryExtras } = req.body;

    // #region Ellenőrzés: ownertoken megléte
    if (!ownertoken) {
        conn.release();
        throw new Error([ lang === 'HU' ? 'Nincs bejelentkezve.' : 'Not logged in.', 401 ]);
    }

    try {
        // #region Értékek előfeldolgozása
        const roundedEfficiency = parseInt(Math.round((efficiency + Number.EPSILON) * 100) / 100);
        // #endregion
        // #region Features mező JSON stringgé alakítása
        const featuresJSON = typeof features === 'object' ? JSON.stringify(features) : features || null;
        // #endregion
        // #region Kép fájlnevek összeállítása (kiterjesztéssel)
        const images = req.validatedImages || [];
        const imageFilenames = images.map((file) => file.filename || path.basename(file.path || '') || file.originalname || '');
        const imagesJSON = JSON.stringify(imageFilenames);
        // #endregion
        // #region Adatbázis beszúrás
        const query = `
            INSERT INTO cars (
                manufacturer, model, odometerKM, modelyear, efficiency, efficiencyunit,
                enginecapacityCC, fueltype, transmission, bodytype, color, doors, seats,
                vin, emissionsGKM, maxspeedKMH, zeroToHundredSec, weightKG, factoryExtras,
                features, images, ownertoken
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            imagesJSON,
            ownertoken
        ];

        const result = await conn.query(query, values);
        const carId = result[0].insertId;
        // #endregion

        // #region Válasz visszaadása
        conn.release();
        return res.status(201).json({
            message: lang === 'HU' ? 'Autó és képek sikeresen hozzáadva.' : 'Car and images added successfully.',
            carId: carId,
            imageCount: images.length
        });
        // #endregion

    } catch (error) {
        conn.release();
        // #region Ütközés kezelése VIN kód alapján
        if (error.message.includes('Duplicate entry') || error.code === 'ER_DUP_ENTRY') {
            throw new Error([ lang === 'HU' ? 'Már létezik ilyen VIN kóddal autó.' : 'A car with this VIN already exists.', 409 ]);
        }
        // #endregion
        throw error;
    }
}