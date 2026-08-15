const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Loads environment-specific configuration and applies any process.env
 * overrides (e.g. secrets injected by a CI/CD pipeline).
 */
function loadConfig() {
  const env = (process.env.ENV || 'qa').toLowerCase();
  const configPath = path.resolve(__dirname, 'environments', `${env}.json`);
  // path.resolve(__dirname, '..', '..', 'environments', `${env}.json`);
  // path.resolve(__dirname, '..', 'environments', `${env}.json`);
  // __dirnameis a Node.js-provided variable containing the directory where the current JavaScript file is located.

  if (!fs.existsSync(configPath)) {
    throw new Error(
      `No environment configuration found for "${env}". Expected file at ${configPath}`
    );
  }

  const envConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  // JSON.parse will convert a string to JSON format 

  return {
    ...envConfig,
    baseUrl: process.env.BASE_URL || envConfig.baseUrl,
    bookerBaseUrl: process.env.BOOKER_BASE_URL || envConfig.bookerBaseUrl,
    apiKey: process.env.API_KEY || envConfig.apiKey,
  };
}

module.exports = loadConfig();
