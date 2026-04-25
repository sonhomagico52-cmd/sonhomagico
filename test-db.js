import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();
async function run() {
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PUBLIC_PORT || 3307,
    user: process.env.MYSQL_USER || 'sonho_magico',
    password: process.env.MYSQL_PASSWORD || 'change_this_mysql_password',
    database: process.env.MYSQL_DATABASE || 'sonho_magico'
  });
  const [rows] = await conn.execute('SELECT id, name, specialties FROM users');
  console.log(rows);
  conn.end();
}
run().catch(console.error);
