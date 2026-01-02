import pool from '../../database/DB.js';
import convert from '../../utilities/exchange/convert.js';
import path from 'path';
import fs from 'fs';

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
        throw new Error([ lang === 'HU' ? 'Hiányzó tulajdonos token.' : 'Missing owner token.', 400 ]);
    }

    try {
        // #region Értékek előfeldolgozása
        const roundedEfficiency = parseInt(Math.round((efficiency + Number.EPSILON) * 100) / 100);
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
        const carId = result[0].insertId;
        // #endregion

        // #region Képek mentése az adatbázisba
        const images = req.validatedImages || [];
        
        if (images.length > 0) {
            try {
                const insertImageQuery = `
                    INSERT INTO carimages (carid, filepath, orderindex)
                    VALUES (?, ?, ?)
                `;

                for (let i = 0; i < images.length; i++) {
                    const image = images[i];
                    // filepath is relative to media folder: cars/filename.ext
                    const relativePath = path.join('cars', image.filename).replace(/\\/g, '/');
                    await conn.query(insertImageQuery, [carId, relativePath, i]);
                }
            } catch (imageError) {
                // If image database insertion fails, rollback car creation
                await conn.query('DELETE FROM cars WHERE id = ?', [carId]);
                
                // Also delete uploaded files
                for (const image of images) {
                    try {
                        fs.unlinkSync(image.path);
                    } catch (unlinkErr) {
                        console.error(`Failed to delete file ${image.path}:`, unlinkErr);
                    }
                }
                
                pool.releaseConnection(conn);
                throw new Error([
                    lang === 'HU' ? `Képek mentése sikertelen. Autó hozzáadása visszavonva: ${imageError.message}` : `Failed to save images. Car addition reverted: ${imageError.message}`,
                    500
                ]);
            }
        }
        // #endregion

        // #region Válasz visszaadása
        pool.releaseConnection(conn);
        return res.status(201).json({
            success: true,
            message: lang === 'HU' ? 'Autó és képek sikeresen hozzáadva.' : 'Car and images added successfully.',
            carId: carId,
            imageCount: images.length
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