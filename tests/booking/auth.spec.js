const { test, expect } = require('../../fixtures/apiFixture');
const { validateStatus, validateSchema } = require('../../utils/validators');
const { getTestData } = require('../../utils/testDataReader');
const BOOKING_ENDPOINTS = require('../../api/endpoints/bookingEndpoints');
const logger = require('../../utils/logger');
const authTokenSchema = require('../../schemas/booker/authTokenSchema.json');

test.beforeEach(({}, testInfo) => {
  logger.info(`Starting test: "${testInfo.title}"`);
});

test.describe('Booker Auth API - Positive Tests', () => {
  test('Create Token - Success @smoke', async ({ apiClient }) => {
    const credentials = getTestData('bookerAuth.json', 'validCredentials');

    const response = await apiClient.post(BOOKING_ENDPOINTS.auth, credentials);
    const body = await response.json();

    validateStatus(response, 200);
    validateSchema(body, authTokenSchema);
    expect(body.token).toBeTruthy();
  });
});

test.describe('Booker Auth API - Negative Tests', () => {
  test('Create Token - Invalid credentials', async ({ apiClient }) => {
    const credentials = getTestData('bookerAuth.json', 'invalidCredentials');

    const response = await apiClient.post(BOOKING_ENDPOINTS.auth, credentials);
    const body = await response.json();

    // restful-booker doesn't reject bad credentials with a 4xx status - it
    // responds 200 with a `reason` field instead. Documenting that mock
    // behavior here rather than asserting a status code it never returns.
    validateStatus(response, 200);
    expect(body.reason).toBe('Bad credentials');
    expect(body.token).toBeUndefined();
  });
});
