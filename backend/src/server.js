const app = require('./app');
const config = require('./config/env');
const { testConnection, pool } = require('./config/db');
const { initDatabaseTables } = require('./config/dbInit');
const logger = require('./utils/logger');

let server;

async function startServer() {
  try {
    // 1. Start HTTP server so port binds immediately for Render/PaaS
    server = app.listen(config.port, async () => {
      logger.info(`TeamUp backend server running in ${config.nodeEnv} mode on port ${config.port}`);

      // 2. Connect to MySQL and verify tables
      try {
        await testConnection();
        logger.info(`Connected to MySQL database "${config.db.database}" at ${config.db.host}:${config.db.port}`);
        await initDatabaseTables();
      } catch (dbErr) {
        logger.error(`[DATABASE ERROR] Failed to connect to MySQL database: ${dbErr.message}`);
        logger.error('Check your DATABASE_URL in Render environment variables or verify if cloud DB is running.');
      }
    });
  } catch (err) {
    logger.error('Failed to start server due to fatal initialization error:', err);
    process.exit(1);
  }
}

// Graceful shutdown handling
function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      try {
        await pool.end();
        logger.info('MySQL connection pool closed.');
        process.exit(0);
      } catch (err) {
        logger.error('Error closing MySQL pool:', err);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

startServer();

