const { test, expect } = require('../../fixtures/apiFixture');
const { validateStatus, validateResponseTime, validateHeader } = require('../../utils/validators');

test.describe('Health / Smoke Tests', () => {
  test('API is up and responding @smoke', async ({ userApi }) => {
    const response = await userApi.listUsers(1);

    validateStatus(response, 200);
    validateResponseTime(response.elapsedMs, 5000);
  });

  test('API responds with JSON content type', async ({ userApi }) => {
    const response = await userApi.listUsers(1);

    validateHeader(response, 'content-type', 'application/json');
  });
});
