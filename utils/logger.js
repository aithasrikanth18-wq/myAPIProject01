/* eslint-disable no-console */

const LEVELS = {
  INFO: 'INFO',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG',
  WARN: 'WARN',
};

function timestamp() {
  return new Date().toISOString();
}

function log(level, message, meta) {
  const line = `[${timestamp()}] [${level}] ${message}`;
  if (meta !== undefined) {
    console.log(line, meta);
  } else {
    console.log(line);
  }
}

const logger = {
  info: (message, meta) => log(LEVELS.INFO, message, meta),
  error: (message, meta) => log(LEVELS.ERROR, message, meta),
  debug: (message, meta) => {
    if (process.env.DEBUG_LOGS === 'true') {
      log(LEVELS.DEBUG, message, meta);
    }
  },
  warn: (message, meta) => log(LEVELS.WARN, message, meta),
};

module.exports = logger;
