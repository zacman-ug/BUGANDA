const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

(async () => {
  const DB_HOST = process.env.DB_HOST || 'localhost';
  const DB_USER = process.env.DB_USER || 'root';
  const DB_PASSWORD = process.env.DB_PASSWORD || '';
  const DB_NAME = process.env.DB_NAME || 'buganda_heritage';

  const adminEmail = process.argv[2] || 'admin@local';
  const adminPassword = process.argv[3] || 'Admin123!';
  const fullName = process.argv[4] || 'Initial Admin';

  console.log('Using DB:', DB_HOST, DB_USER, DB_NAME);
  console.log('Seeding admin:', adminEmail);

  const pool = mysql.createPool({ host: DB_HOST, user: DB_USER, password: DB_PASSWORD, database: DB_NAME, waitForConnections: true, connectionLimit: 1 });

  try {
    const hashed = await bcrypt.hash(adminPassword, 10);

    // Check if any admin exists
    const [admins] = await pool.execute("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if (admins && admins.length > 0) {
      console.log('An admin already exists (id=' + admins[0].id + '). No changes made.');
      process.exit(0);
    }

    // Check if user with email exists
    const [rows] = await pool.execute('SELECT id FROM users WHERE email = ?', [adminEmail]);
    if (rows && rows.length > 0) {
      const id = rows[0].id;
      await pool.execute('UPDATE users SET password_hash = ?, role = ? WHERE id = ?', [hashed, 'admin', id]);
      console.log('Existing user promoted to admin (id=' + id + ').');
      process.exit(0);
    }

    const [result] = await pool.execute('INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)', [fullName, adminEmail, hashed, 'admin']);
    console.log('Admin user created with id=' + result.insertId + '. Email:', adminEmail, 'Password:', adminPassword);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(2);
  }
})();