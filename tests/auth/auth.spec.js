const { test, expect } = require('../../fixtures/apiFixture');
const { validateStatus, validateSchema } = require('../../utils/validators');
const { getTestData } = require('../../utils/testDataReader');
const loginSchema = require('../../schemas/loginSchema.json');

test.describe('Auth API - Positive Tests', () => {
  test('Login Success @smoke', async ({ authApi }) => {
    const credentials = getTestData('auth.json', 'validLogin');

    const response = await authApi.login(credentials);
    const body = await response.json();

    validateStatus(response, 200);
    validateSchema(body, loginSchema);
    expect(body.accessToken).toBeTruthy();
  });

  test('Authenticated requests automatically attach the Bearer token', async ({
    authToken,
    authApi,
  }) => {
    // The `authToken` fixture performs login and stores the token before
    // this test body runs; ApiClient attaches it to every subsequent call.
    expect(authToken).toBeTruthy();

    const response = await authApi.me();
    validateStatus(response, 200);
  });
});

test.describe('Auth API - Negative Tests', () => {
  test('Login - missing mandatory field (password)', async ({ authApi }) => {
    const credentials = getTestData('auth.json', 'missingPasswordLogin');

    const response = await authApi.login(credentials);
    const body = await response.json();

    validateStatus(response, 400);
    expect(body.message).toBeTruthy();
  });

  test('Login - invalid password for an existing user', async ({ authApi }) => {
    const credentials = getTestData('auth.json', 'invalidCredentialsLogin');

    const response = await authApi.login(credentials);
    const body = await response.json();

    validateStatus(response, 400);
    expect(body.message).toBe('Invalid credentials');
  });

  test('Login - unregistered username', async ({ authApi }) => {
    const credentials = getTestData('auth.json', 'unregisteredLogin');

    const response = await authApi.login(credentials);
    const body = await response.json();

    validateStatus(response, 400);
    expect(body.message).toBeTruthy();
  });
});
