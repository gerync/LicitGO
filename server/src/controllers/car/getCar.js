import pool from '../../database/DB.js';
import Configs from '../../configs/Configs.js';

export default async function getCarController(req, res) {
  const conn = await pool.getConnection();
  const carId = req.params.carId;
  const lang = req.lang;

  try {
    const query = `
      SELECT cars.*, users.usertag, p.filename AS pfpFilename
      FROM cars
      LEFT JOIN users ON cars.ownertoken = users.usertoken
      LEFT JOIN profpics p ON p.usertoken = users.usertoken
      WHERE cars.id = ?
      LIMIT 1
    `;
    const [rows] = await conn.query(query, [carId]);
    if (!Array.isArray(rows) || rows.length === 0) {
      conn.release();
      throw new Error([ lang === 'HU' ? 'Autó nem található.' : 'Car not found.', 404 ]);
    }

    const row = rows[0];
    let images = [];
    try { images = row.images ? JSON.parse(row.images) : []; } catch (e) { images = []; }

    let features = null;
    if (row.features) {
      try { features = JSON.parse(row.features); } catch (e) { features = row.features.split(',').map(i => i.trim()).filter(Boolean); }
    }

    const car = {
      id: row.id,
      manufacturer: row.manufacturer,
      model: row.model,
      modelyear: row.modelyear,
      odometerKM: row.odometerKM,
      efficiency: row.efficiency,
      efficiencyunit: row.efficiencyunit,
      enginecapacityCC: row.enginecapacityCC,
      fueltype: row.fueltype,
      transmission: row.transmission,
      bodytype: row.bodytype,
      color: row.color,
      doors: row.doors,
      seats: row.seats,
      vin: row.vin,
      maxspeedKMH: row.maxspeedKMH,
      zeroToHundredSec: row.zeroToHundredSec,
      weightKG: row.weightKG,
      factoryExtras: row.factoryExtras,
      features: features,
      images: images.filter(Boolean).map(img => (img && (img.startsWith('http://') || img.startsWith('https://')) ? img : `${Configs.server.domain()}/media/cars/${img}`)),
      owner: {
        usertag: row.usertag,
        pfp: row.pfpFilename ? `${Configs.server.domain()}/media/users/${row.pfpFilename}` : null
      }
    };

    conn.release();
    return res.status(200).json({ success: true, car });
  } catch (err) {
    conn.release();
    throw err;
  }
}
