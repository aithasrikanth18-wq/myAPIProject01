const { test } = require('../../fixtures/apiFixture');
const { validateStatus, validateResponseTime } = require('../../utils/validators');
const BOOKING_ENDPOINTS = require('../../api/endpoints/bookingEndpoints');
const logger = require('../../utils/logger');

test.beforeEach(({}, testInfo) => {
  logger.info(`Starting test: "${testInfo.title}"`);
});

test.describe('Booker Health / Smoke Tests', () => {
  test('Ping - API health check @smoke', async ({ apiClient }) => {
    // /ping returns 201 with an empty body, so there is no JSON to parse
    // or validate against a schema here - status and timing are the signal.
    const response = await apiClient.get(BOOKING_ENDPOINTS.ping);

    validateStatus(response, 201);
    validateResponseTime(response.elapsedMs, 5000);
  });
});
