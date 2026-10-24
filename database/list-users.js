/**
 * TeamUp User Activity Inspector
 * 
 * Lists registered users, their university, registration date, and last login time.
 * Supports both local database and remote Cloud MySQL (via DATABASE_URL).
 */
const path = require('path');
const dotenv = require('../backend/node_modules/dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const mysql = require('../backend/node_modules/mysql2/promise');

async function listUsers() {
  const dbUrl = process.env.DATABASE_URL || process.argv[2];

  let connection;
  if (dbUrl) {
    const parsed = new URL(dbUrl);
    connection = await mysql.createConnection({
      host: parsed.hostname,
      port: parseInt(parsed.port, 10) || 3306,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, '') || 'defaultdb',
      ssl: { rejectUnauthorized: false },
    });
  } else {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'teamup_db',
    });
  }

  try {
    const [rows] = await connection.execute(`
      SELECT 
        id,
        name,
        email,
        university,
        department,
        last_login_at,
        created_at
      FROM users
      ORDER BY COALESCE(last_login_at, created_at) DESC
    `);

    console.log('\n================================================================================');
    console.log(` TEAMUP REGISTERED USERS & ACTIVITY (Total: ${rows.length})`);
    console.log('================================================================================\n');

    if (rows.length === 0) {
      console.log('No users registered yet.');
    } else {
      console.table(
        rows.map((u) => ({
          ID: u.id,
          Name: u.name,
          Email: u.email,
          University: u.university,
          Department: u.department,
          'Last Login': u.last_login_at ? new Date(u.last_login_at).toLocaleString() : 'Never / Prior to tracking',
          Registered: new Date(u.created_at).toLocaleString(),
        }))
      );
    }
    console.log('\n');
  } catch (err) {
    console.error('Error querying users:', err.message);
  } finally {
    await connection.end();
  }
}

listUsers();
