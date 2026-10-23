const config = require('../config/env');

function formatMessage(level, message, meta) {
  const timestamp = new Date().toISOString();
  const metaString = meta ? (meta instanceof Error ? `\n${meta.stack}` : ` | ${JSON.stringify(meta)}`) : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}`;
}

const logger = {
  info: (message, meta) => {
    console.log(formatMessage('info', message, meta));
  },
  warn: (message, meta) => {
    console.warn(formatMessage('warn', message, meta));
  },
  error: (message, meta) => {
    console.error(formatMessage('error', message, meta));
  },
  debug: (message, meta) => {
    if (config.nodeEnv !== 'production') {
      console.debug(formatMessage('debug', message, meta));
    }
  },
};

module.exports = logger;

