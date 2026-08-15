const { test, expect } = require('../../fixtures/apiFixture');
const { validateStatus, validateResponseTime, validateHeader } = require('../../utils/validators');
const { getTestData } = require('../../utils/testDataReader');
const USER_ENDPOINTS = require('../../api/endpoints/userEndpoints');

test.describe('Health / Smoke Tests', () => {
  test('API is up and responding @smoke', async ({ apiClient }) => {
    const page = getTestData('users.json', 'listUsersPage');

    const response = await apiClient.get(USER_ENDPOINTS.listUsers, { params: { page } });

    validateStatus(response, 200);
    validateResponseTime(response.elapsedMs, 5000);
  });

  test('API responds with JSON content type', async ({ apiClient }) => {
    const page = getTestData('users.json', 'listUsersPage');

    const response = await apiClient.get(USER_ENDPOINTS.listUsers, { params: { page } });

    validateHeader(response, 'content-type', 'application/json');
  });
});
