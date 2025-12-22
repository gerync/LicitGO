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

    // Validate ownertoken
    if (!ownertoken) {
        throw new Error([ lang === 'HU' ? 'Hiányzó tulajdonos token.' : 'Missing owner token.', 400 ]);
    }

    try {
        // Round efficiency to 2 decimal places
        const roundedEfficiency = Number(Math.round((efficiency + Number.EPSILON) * 100) / 100);

        // Prepare features as JSON string if it's an object
        const featuresJSON = typeof features === 'object' ? JSON.stringify(features) : features || null;

        // Insert car into database
        const query = `
            INSERT INTO cars (
                manufacturer, model, odometerKM, modelyear, efficiency, efficiencyunit,
                enginecapacityCC, fueltype, transmission, bodytype, color, doors, seats,
                vin, emissionsGKM, maxspeedKMH, zeroToHundredSec, weightKG, factoryExtras,
                features, ownertoken
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        pool.releaseConnection(conn);
        return res.status(201).json({
            success: true,
            message: lang === 'HU' ? 'Autó sikeresen hozzáadva.' : 'Car added successfully.',
            carId: carId
        });

    } catch (error) {
        pool.releaseConnection(conn);
        if (error.message.includes('Duplicate entry') || error.code === 'ER_DUP_ENTRY') {
            throw new Error([ lang === 'HU' ? 'Már létezik ilyen VIN kóddal autó.' : 'A car with this VIN already exists.', 409 ]);
        }
        throw error;
    }
}