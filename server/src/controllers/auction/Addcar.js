import DB from '../../database/connection.js';

export default async function AddCarController(req, res) {
    const lang = req.lang;
    const ownertoken = req.usertoken;

    const { manufacturer, model, odometerKM, modelyear, efficiency, efficiencyunit, 
        enginecapacity, fueltype, transmission, bodytype, color, 
        emissionsGKM, doors, seats, vin, maxspeedKMH, zeroToHundredSec, weightKG,
        features, factoryExtras } = req.body;

    // Validate ownertoken
    if (!ownertoken) {
        return res.status(401).json({ error: lang === 'HU' ? 'Bejelentkezés szükséges.' : 'Authentication required.' });
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

        const result = await DB.promise().query(query, values);
        const carId = result[0].insertId;

        return res.status(201).json({
            success: true,
            message: lang === 'HU' ? 'Autó sikeresen hozzáadva.' : 'Car added successfully.',
            carId: carId
        });

    } catch (error) {
        console.error('Error adding car:', error);

        // Handle duplicate VIN
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: lang === 'HU' ? 'Ez a VIN már létezik.' : 'This VIN already exists.' });
        }

        return res.status(500).json({ error: lang === 'HU' ? 'Hiba az autó hozzáadásakor.' : 'Error adding car.' });
    }
}
    