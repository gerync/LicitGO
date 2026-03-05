import mysql from 'mysql2/promise';
import configs from '../configs/Configs.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import { coloredlog } from '@gerync/utils';

// Adatbázis-séma inicializálása egy ideiglenes kapcsolat segítségével a fő pool létrehozása előtt
async function initializeDatabase() {
    try {
        // #region Ideiglenes kapcsolat létrehozása anélkül, hogy adatbázist adnánk meg
        const tempConnection = await mysql.createConnection({
            host: configs.db.host,
            user: configs.db.user,
            password: configs.db.password,
            port: configs.db.port,
            multipleStatements: true,
        });
        // #endregion

        // #region Adatbázis létrehozása, ha nem létezik
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const sqlPath = path.join(__dirname, '..', '..', 'setup.sql');
        const sql = await fs.readFile(sqlPath, 'utf8');
        await tempConnection.query(sql);
        await tempConnection.end();
        // #endregion
    } catch (error) {
        const colors = configs.colors;
        if (configs.server.defaultLanguage === 'HU') {
            coloredlog('Hiba az adatbázis inicializálása során: ', colors.error);
        } else {
            coloredlog('Error during database initialization: ', colors.error);
        }
        coloredlog(error, colors.error);
        process.exit(1); // Kilépés hibakóddal
    }
}

// Ensure the database schema exists before creating the main pool
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
    multipleStatements: false,
});

export default pool;