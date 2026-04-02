import pool from '../server/src/database/DB.js';

(async () => {
  try {
    const [rows] = await pool.query('SELECT id, carid, starttime, endtime FROM auctions ORDER BY id DESC LIMIT 50');
    console.log('auctions rows:', rows.length);
    console.log(rows.slice(0,20));
    process.exit(0);
  } catch (err) {
    console.error('error running query', err);
    process.exit(1);
  }
})();
