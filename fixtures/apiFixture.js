const base = require('@playwright/test');
const ApiClient = require('../api/clients/apiClient');
const UserApi = require('../api/services/userApi');
const AuthApi = require('../api/services/authApi');
const testData = require('../utils/testDataReader');
const tokenManager = require('../utils/tokenManager');

/**
 * Extends the base Playwright test with framework-specific fixtures so
 * test files stay declarative:
 *
 *   test('Create User API', async ({ userApi }) => { ... })
 */
const test = base.test.extend({
  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request));
  },

  userApi: async ({ apiClient }, use) => {
    await use(new UserApi(apiClient));
  },

  authApi: async ({ apiClient }, use) => {
    await use(new AuthApi(apiClient));
  },

  // Logs in with valid credentials before the test runs and clears the
  // captured token afterwards, so tests that need authentication can just
  // declare this fixture as a dependency.
  authToken: async ({ authApi }, use) => {
    const credentials = testData.getTestData('auth.json', 'validLogin');
    const response = await authApi.login(credentials);
    const body = await response.json();

    await use(body.accessToken);

    tokenManager.clearToken();
  },
});

const expect = base.expect;

module.exports = { test, expect };
