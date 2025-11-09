import msql from 'mysql2/promise';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { GetloginHU, GetauctionsHU, GetauctionsByIdHU } from 'modules/HU/apiGET.js'
import { PostCarHU, PostAuctionHU } from 'modules/HU/apiPOST.js';

const car_storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads/cars');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const validExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      return cb(new Error('Érvénytelen fájltípus'));
    }
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + fileExtension);
  }
});
const profile_pic_storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads/profiles');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const validExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      return cb(new Error('Érvénytelen fájltípus'));
    }
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + fileExtension);
  }
});

const profile_upload = multer({ profile_pic_storage });
const car_upload = multer({ car_storage });
dotenv.config();
const app = express();
const port = 3550;

app.use(cors());
app.use(express.json());


const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10
};
app.dbConfig = dbConfig;
app.db = msql.createPool(dbConfig);

app.post('/hu/register', profile_upload.single('profile_picture'), async (req, res) => {
  const { usertag, display_name, password_hash, email, fullname, mobile, gender} = req.body;
  const birth_date = new Date(req.body.birth_date);
  const profile_picture = req.file;
  const conn = await app.db.getConnection();

  if (typeof req.body !== 'object' || req.body === null || Object.keys(req.body).length != 8) {
    return res.status(400).json({ error: 'Érvénytelen kérés törzse' });
  }
  else if (!usertag || !display_name || !password_hash || !email || !fullname || !mobile || !gender || !birth_date) {
    return res.status(400).json({ error: 'Hiányzó kötelező mezők' });
  }
  else if (typeof usertag !== 'string' || typeof display_name !== 'string' || typeof password_hash !== 'string' || typeof email !== 'string' || typeof fullname !== 'string' || typeof mobile !== 'string' || typeof gender !== 'boolean' || !(birth_date instanceof Date)) {
    return res.status(400).json({ error: 'Érvénytelen mezőtípusok' });
  }
  else if (await app.db.query('SELECT id FROM users WHERE usertag = ?', [usertag]).then(([rows]) => rows.length > 0)) {
    return res.status(409).json({ error: 'A usertag már használatban van' });
  }
  else if (await app.db.query('SELECT id FROM users WHERE email = ?', [email]).then(([rows]) => rows.length > 0)) {
    return res.status(409).json({ error: 'Az e-mail cím már használatban van' });
  }
  else if (await app.db.query('SELECT id FROM users WHERE mobile = ?', [mobile]).then(([rows]) => rows.length > 0)) {
    return res.status(409).json({ error: 'A telefonszám már használatban van' });
  }

  else {
    try {
      const [result] = await app.db.query(
        'INSERT INTO users (usertag, display_name, password_hash, email, fullname, mobile, gender, birth_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [usertag, display_name, password_hash, email, fullname, mobile, gender, birth_date]
      );
      await conn.commit();
      await conn.release();
      return res.status(201).json({ message: 'Felhasználó sikeresen regisztrálva', userId: result.insertId });
    } catch (error) {
      console.error('Hiba tortent a felhasznalo regisztracioja kozben:', error);
      await conn.rollback();
      await conn.release();
      return res.status(500).json({ error: 'Belső szerverhiba' });
    }
  }
});

app.get('/hu/login', GetloginHU);

app.get('/hu/auctions', GetauctionsHU);

app.get('/hu/auction/:id', GetauctionsByIdHU);

app.post('/hu/cars', car_upload.fields([{ name: 'car_images', maxCount: 50 }]), PostCarHU);
app.post('/hu/auctions', PostAuctionHU);
app.post('/hu/bids', );

app.use((req, res, next) => {
  res.status(404).json({ error: 'Nem található' });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Valami hiba történt!' });
});
app._router.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});
app.listen(port, () => {
  console.log(`Szerver fut a ${port} porton.`);
});