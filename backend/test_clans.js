const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'buganda_heritage',
    });
    const [rows] = await conn.query("SHOW TABLES LIKE 'clans'");
    console.log('SHOW TABLES LIKE clans ->', rows);
    if (rows.length > 0) {
      const [count] = await conn.query('SELECT COUNT(*) as cnt FROM clans');
      console.log('clans count ->', count[0].cnt);
    }
    await conn.end();
  } catch (err) {
    console.error('DB error:', err.message);
    process.exit(1);
  }
})();
