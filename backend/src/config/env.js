const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const requiredEnv = hasDatabaseUrl
  ? ['JWT_SECRET']
  : ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];

for (const envVar of requiredEnv) {
  if (!process.env[envVar]) {
    console.error(`[CRITICAL] Missing required environment variable: ${envVar}`);
    console.error(`Please check your backend/.env file based on backend/.env.example.`);
    process.exit(1);
  }
}

let dbConfig = {};

if (process.env.DATABASE_URL) {
  // Support cloud database URL (e.g. mysql://user:password@host:port/database)
  try {
    const parsedUrl = new URL(process.env.DATABASE_URL);
    dbConfig = {
      host: parsedUrl.hostname,
      port: parseInt(parsedUrl.port, 10) || 3306,
      user: decodeURIComponent(parsedUrl.username),
      password: decodeURIComponent(parsedUrl.password),
      database: parsedUrl.pathname.replace(/^\//, ''),
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
      waitForConnections: true,
      queueLimit: 0,
      timezone: 'Z',
    };
  } catch (err) {
    console.error('[CRITICAL] Invalid DATABASE_URL provided:', err.message);
    process.exit(1);
  }
} else {
  dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
    waitForConnections: true,
    queueLimit: 0,
    timezone: 'Z',
  };
}

// Enable SSL if explicitly requested or on managed cloud databases (e.g. Aiven, TiDB, Railway)
if (process.env.DB_SSL === 'true' || (process.env.NODE_ENV === 'production' && !dbConfig.host.includes('localhost') && !dbConfig.host.includes('127.0.0.1'))) {
  dbConfig.ssl = { rejectUnauthorized: false };
}

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  db: dbConfig,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
