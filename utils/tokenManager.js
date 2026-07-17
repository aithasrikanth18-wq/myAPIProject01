const logger = require('./logger');

/**
 * In-memory token store shared across a test run.
 * Supports Bearer/JWT tokens obtained via the auth API, independent of the
 * static API key configured per environment.
 */
class TokenManager {
  constructor() {
    this.token = null;
  }

  setToken(token) {
    this.token = token;
    logger.debug('Token stored in TokenManager');
  }

  getToken() {
    return this.token;
  }

  hasToken() {
    return Boolean(this.token);
  }

  clearToken() {
    this.token = null;
    logger.debug('Token cleared from TokenManager');
  }
}

// Exported as a singleton so every service/fixture shares the same token
// for the duration of a test run.
module.exports = new TokenManager();
