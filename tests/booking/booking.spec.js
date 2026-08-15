const { test, expect } = require('../../fixtures/apiFixture');
const { request: playwrightRequest } = require('@playwright/test');
const ApiClient = require('../../api/clients/apiClient');
const {
  validateStatus,
  validateSchema,
  validateBodyContains,
} = require('../../utils/validators');
const { getTestData } = require('../../utils/testDataReader');
const BOOKING_ENDPOINTS = require('../../api/endpoints/bookingEndpoints');
const logger = require('../../utils/logger');
const bookingSchema = require('../../schemas/booker/bookingSchema.json');
const createBookingResponseSchema = require('../../schemas/booker/createBookingResponseSchema.json');
const bookingIdsSchema = require('../../schemas/booker/bookingIdsSchema.json');

test.describe('Booking API - Positive Tests', () => {
  let setupContext;
  let authCookie;
  let sharedBookingId;

  test.beforeAll(async () => {
    // `beforeAll` runs before any test-scoped fixture (like `apiClient`) is
    // available, so a request context is created manually here purely for
    // one-time suite setup: authenticate once and create the booking record
    // that the read/update tests below share.
    setupContext = await playwrightRequest.newContext();
    const setupClient = new ApiClient(setupContext);

    const credentials = getTestData('bookerAuth.json', 'validCredentials');
    const authResponse = await setupClient.post(BOOKING_ENDPOINTS.auth, credentials);
    const authBody = await authResponse.json();
    authCookie = `token=${authBody.token}`;

    const sharedBookingPayload = getTestData('booking.json', 'sharedBooking');
    const createResponse = await setupClient.post(BOOKING_ENDPOINTS.booking, sharedBookingPayload);
    const createBody = await createResponse.json();
    sharedBookingId = createBody.bookingid;

    logger.info(`Booking suite setup complete: sharedBookingId=${sharedBookingId}`);
  });

  test.afterAll(async () => {
    await setupContext.dispose();
    logger.info('Booking suite teardown complete: setup request context disposed');
  });

  test.beforeEach(({}, testInfo) => {
    logger.info(`Starting test: "${testInfo.title}"`);
  });

  test('Create Booking @smoke', async ({ apiClient }) => {
    const payload = getTestData('booking.json', 'sharedBooking');
    let response;
    let body;

    await test.step('Create a new booking', async () => {
      response = await apiClient.post(BOOKING_ENDPOINTS.booking, payload);
      body = await response.json();
    });

    await test.step('Validate response status, schema and echoed fields', async () => {
      validateStatus(response, 200);
      validateSchema(body, createBookingResponseSchema);
      expect(body.bookingid).toBeTruthy();
      validateBodyContains(body.booking, payload);
    });
  });

  test('Get All Booking Ids @smoke', async ({ apiClient }) => {
    let response;
    let body;

    await test.step('Fetch all booking ids', async () => {
      response = await apiClient.get(BOOKING_ENDPOINTS.booking);
      body = await response.json();
    });

    await test.step('Validate response status and schema', async () => {
      validateStatus(response, 200);
      validateSchema(body, bookingIdsSchema);
      expect(body.length).toBeGreaterThan(0);
    });
  });

  test('Get Booking Ids Filtered By Name', async ({ apiClient }) => {
    const payload = getTestData('booking.json', 'filterByNameBooking');
    let createdId;
    let response;
    let body;

    await test.step('Create a booking with a distinctive name', async () => {
      const createResponse = await apiClient.post(BOOKING_ENDPOINTS.booking, payload);
      const createBody = await createResponse.json();
      createdId = createBody.bookingid;
    });

    await test.step('Filter bookings by firstname/lastname', async () => {
      response = await apiClient.get(BOOKING_ENDPOINTS.booking, {
        params: { firstname: payload.firstname, lastname: payload.lastname },
      });
      body = await response.json();
    });

    await test.step('Validate the created booking is present in the filtered results', async () => {
      validateStatus(response, 200);
      validateSchema(body, bookingIdsSchema);
      expect(body.map((entry) => entry.bookingid)).toContain(createdId);
    });
  });

  test('Get Booking Ids Filtered By Checkin/Checkout Dates - documents mock API behavior', async ({
    apiClient,
  }) => {
    const payload = getTestData('booking.json', 'filterByDateBooking');
    let response;
    let body;

    await test.step('Create a booking with distinctive checkin/checkout dates', async () => {
      await apiClient.post(BOOKING_ENDPOINTS.booking, payload);
    });

    await test.step('Filter bookings by checkin/checkout', async () => {
      response = await apiClient.get(BOOKING_ENDPOINTS.booking, {
        params: {
          checkin: payload.bookingdates.checkin,
          checkout: payload.bookingdates.checkout,
        },
      });
      body = await response.json();
    });

    // Verified directly against the live API: the checkin/checkout filter
    // does not return matches even for a booking created with those exact
    // dates moments earlier - a known limitation of the public
    // restful-booker demo instance. The endpoint still responds correctly
    // (200 + valid array shape), which is what's asserted here; against a
    // real backend this would instead assert the created id is included.
    await test.step('Validate the endpoint responds with a valid (possibly empty) list', async () => {
      validateStatus(response, 200);
      validateSchema(body, bookingIdsSchema);
    });
  });

  test('Get Specific Booking By Id @smoke', async ({ apiClient }) => {
    const payload = getTestData('booking.json', 'sharedBooking');
    let response;
    let body;

    await test.step('Fetch the shared booking by id', async () => {
      response = await apiClient.get(BOOKING_ENDPOINTS.bookingById(sharedBookingId));
      body = await response.json();
    });

    await test.step('Validate response status, schema and field values', async () => {
      validateStatus(response, 200);
      validateSchema(body, bookingSchema);
      validateBodyContains(body, payload);
    });
  });

  test('Update Booking (Full)', async ({ apiClient }) => {
    const payload = getTestData('booking.json', 'updateBooking');
    let response;
    let body;

    await test.step('Update the shared booking with a full payload', async () => {
      response = await apiClient.put(BOOKING_ENDPOINTS.bookingById(sharedBookingId), payload, {
        headers: { Cookie: authCookie },
      });
      body = await response.json();
    });

    await test.step('Validate response status, schema and updated fields', async () => {
      validateStatus(response, 200);
      validateSchema(body, bookingSchema);
      validateBodyContains(body, payload);
    });
  });

  test('Partial Update Booking', async ({ apiClient }) => {
    // Verified directly against the live API: PUT with a partial body
    // returns 400 Bad Request (it expects the full booking object). PATCH
    // is the verb that actually performs a partial update.
    const payload = getTestData('booking.json', 'partialUpdateBooking');
    let response;
    let body;

    await test.step('Partially update the shared booking', async () => {
      response = await apiClient.patch(BOOKING_ENDPOINTS.bookingById(sharedBookingId), payload, {
        headers: { Cookie: authCookie },
      });
      body = await response.json();
    });

    await test.step('Validate response status and updated fields', async () => {
      validateStatus(response, 200);
      validateBodyContains(body, payload);
    });
  });

  test('Delete Booking', async ({ apiClient }) => {
    const payload = getTestData('booking.json', 'bookingToDelete');
    let bookingId;
    let deleteResponse;

    await test.step('Create a throwaway booking to delete', async () => {
      const createResponse = await apiClient.post(BOOKING_ENDPOINTS.booking, payload);
      const createBody = await createResponse.json();
      bookingId = createBody.bookingid;
    });

    await test.step('Delete the booking', async () => {
      deleteResponse = await apiClient.delete(BOOKING_ENDPOINTS.bookingById(bookingId), {
        headers: { Cookie: authCookie },
      });
    });

    await test.step('Validate delete status and that the booking no longer exists', async () => {
      validateStatus(deleteResponse, 201);

      const getResponse = await apiClient.get(BOOKING_ENDPOINTS.bookingById(bookingId));
      validateStatus(getResponse, 404);
    });
  });
});

test.describe('Booking API - Negative Tests', () => {
  test.beforeEach(({}, testInfo) => {
    logger.info(`Starting test: "${testInfo.title}"`);
  });

  test('Get Booking - Non-existent Id', async ({ apiClient }) => {
    const nonExistentId = getTestData('booking.json', 'nonExistentBookingId');

    const response = await apiClient.get(BOOKING_ENDPOINTS.bookingById(nonExistentId));

    validateStatus(response, 404);
  });

  test('Update Booking - No auth token', async ({ apiClient }) => {
    // restful-booker checks auth before existence, so the auth rejection
    // can be verified without touching a real booking record.
    const payload = getTestData('booking.json', 'updateBooking');
    const bookingId = getTestData('booking.json', 'nonExistentBookingId');

    const response = await apiClient.put(BOOKING_ENDPOINTS.bookingById(bookingId), payload);

    validateStatus(response, 403);
  });

  test('Delete Booking - No auth token', async ({ apiClient }) => {
    const bookingId = getTestData('booking.json', 'nonExistentBookingId');

    const response = await apiClient.delete(BOOKING_ENDPOINTS.bookingById(bookingId));

    validateStatus(response, 403);
  });
});
