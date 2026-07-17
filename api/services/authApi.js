const AUTH_ENDPOINTS = require('../endpoints/authEndpoints');
const tokenManager = require('../../utils/tokenManager');
const logger = require('../../utils/logger');

/**
 * Business-level operations for the Auth API.
 * Successful logins automatically persist the token via TokenManager so
 * subsequent requests through the ApiClient are authenticated.
 */
class AuthApi {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  async login(credentials) {
    const response = await this.apiClient.post(AUTH_ENDPOINTS.login, credentials);

    if (response.ok()) {
      const body = await response.json();
      if (body.accessToken) {
        tokenManager.setToken(body.accessToken);
        logger.info('Login succeeded, token captured');
      }
    }

    return response;
  }

  // Protected endpoint - relies on the ApiClient auto-attaching the Bearer
  // token captured during login.
  async me() {
    return this.apiClient.get(AUTH_ENDPOINTS.me);
  }

  logout() {
    tokenManager.clearToken();
  }
}

module.exports = AuthApi;
