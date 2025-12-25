import mysql from 'mysql2/promise';
import configs from '../configs/Configs.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';

// Adatbázis-séma inicializálása egy ideiglenes kapcsolat segítségével a fő pool létrehozása előtt
async function initializeDatabase() {
    try {
        // Ideiglenes kapcsolat létrehozása anélkül, hogy adatbázist adnánk meg
        const tempConnection = await mysql.createConnection({
            host: configs.db.host,
            user: configs.db.user,
            password: configs.db.password,
            port: configs.db.port,
            multipleStatements: true,
        });

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const sqlPath = path.join(__dirname, '..', '..', 'setup.sql');
        const sql = await fs.readFile(sqlPath, 'utf8');
        await tempConnection.query(sql);
        await tempConnection.end();
    } catch (error) {
        console.error('Failed to initialize database schema:', error);
        throw error;
    }
}

// Az adatbázis inicializálása a fő pool létrehozása előtt
await initializeDatabase();

export const pool = mysql.createPool({
    host: configs.db.host,
    user: configs.db.user,
    password: configs.db.password,
    database: configs.db.name,
    port: configs.db.port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
});

export default pool;