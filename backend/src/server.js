const app = require('./app');
const config = require('./config/env');
const { testConnection, pool } = require('./config/db');
const logger = require('./utils/logger');

let server;

async function startServer() {
  try {
    // 1. Verify database connectivity
    await testConnection();
    logger.info(`Connected to MySQL database "${config.db.database}" at ${config.db.host}:${config.db.port}`);

    // 2. Start HTTP server
    server = app.listen(config.port, () => {
      logger.info(`TeamUp backend server running in ${config.nodeEnv} mode on port ${config.port}`);
    });
  } catch (err) {
    logger.error('Failed to start server due to database or initialization error:', err);
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
