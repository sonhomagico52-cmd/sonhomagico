const mysql = require('mysql2/promise');

async function run() {
  try {
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3307,
      user: 'sonho_magico',
      password: 'change_this_mysql_password',
      database: 'sonho_magico'
    });
    const id = "test-123";
    const name = "Teste User";
    const email = "test@user.com";
    const hash = "123";
    const phone = "123";
    const role = "admin";
    const accessLevel = "admin";
    const customPermissions = '["dashboard"]';
    const specialties = null;
    const availability = null;
    const notes = null;
    const address = null;
    const city = null;
    const app_installed = 0;
    
    await conn.execute(
        `INSERT INTO users (id, name, email, password_hash, phone, role, access_level, custom_permissions,
          specialties, availability, notes, address, city, app_installed)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [id, name, email, hash, phone, role, accessLevel, customPermissions, specialties, availability, notes, address, city, app_installed]
    );
    console.log("Success");
    await conn.end();
  } catch (e) {
    console.log("Error:", e.message);
  }
}
run();
