const mysql = require('mysql2/promise');
const config = require('./env');

const pool = mysql.createPool(config.db);

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (err) {
    console.error('[DATABASE ERROR] Failed to connect to MySQL database:', err.message);
    throw err;
  }
}

module.exports = {
  pool,
  testConnection,
};

