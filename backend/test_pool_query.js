const mysql = require('mysql2/promise');
(async ()=>{
  try{
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'buganda_heritage',
      waitForConnections: true,
      connectionLimit: 10
    });
    const [rows] = await pool.query('SELECT * FROM clans LIMIT 5');
    console.log('rows length', rows.length);
    console.log(rows.slice(0,2));
    await pool.end();
  }catch(err){
    console.error('pool query error', err.message);
    process.exit(1);
  }
})();
