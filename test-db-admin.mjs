import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function run() {
  const pool = mysql.createPool({
    host: '127.0.0.1',
    port: 3307,
    user: 'sonho_magico',
    password: 'change_this_mysql_password',
    database: 'sonho_magico'
  });
  
  const hash = await bcrypt.hash("admin123", 12);
  try {
    await pool.execute(
      `INSERT INTO users (id, name, email, password_hash, role, access_level) VALUES (?, ?, ?, ?, ?, ?)`,
      ["test-admin-999", "Test Admin", "admin_test@test.com", hash, "admin", "super_admin"]
    );
    console.log("Admin user created.");
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      console.log("Admin user already exists. Updating password.");
      await pool.execute(`UPDATE users SET password_hash = ? WHERE email = ?`, [hash, "admin_test@test.com"]);
    } else {
      console.error(e);
    }
  }
  process.exit(0);
}
run();
