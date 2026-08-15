const base = require('@playwright/test');
const ApiClient = require('../api/clients/apiClient');
const AUTH_ENDPOINTS = require('../api/endpoints/authEndpoints');
const testData = require('../utils/testDataReader');
const tokenManager = require('../utils/tokenManager');
const logger = require('../utils/logger');

/**
 * Extends the base Playwright test with framework-specific fixtures so
 * test files stay declarative:
 *
 *   test('Create User API', async ({ apiClient }) => { ... })
 */
const test = base.test.extend({
  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request));
  },

  // Logs in with valid credentials before the test runs and clears the
  // captured token afterwards, so tests that need authentication can just
  // declare this fixture as a dependency.
  authToken: async ({ apiClient }, use) => {
    const credentials = testData.getTestData('auth.json', 'validLogin');
    const response = await apiClient.post(AUTH_ENDPOINTS.login, credentials);
    const body = await response.json();

    if (body.accessToken) {
      tokenManager.setToken(body.accessToken);
      logger.info('Login succeeded, token captured');
    }

    await use(body.accessToken);

    tokenManager.clearToken();
  },
});

const expect = base.expect;

module.exports = { test, expect };
