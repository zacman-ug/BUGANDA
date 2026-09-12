const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || undefined,
    });
    const [rows] = await conn.query('SELECT 1+1 AS sum');
    console.log('DB connected, test query result:', rows);
    await conn.end();
  } catch (err) {
    console.error('DB connection error:', err.message);
    process.exit(1);
  }
})();
