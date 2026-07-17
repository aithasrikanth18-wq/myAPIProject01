const { test, expect } = require('../../fixtures/apiFixture');
const {
  validateStatus,
  validateSchema,
  validateBodyContains,
} = require('../../utils/validators');
const { getTestData } = require('../../utils/testDataReader');
const AUTH_ENDPOINTS = require('../../api/endpoints/authEndpoints');
const userSchema = require('../../schemas/userSchema.json');
const createUserSchema = require('../../schemas/createUserSchema.json');

test.describe('User API - Positive Tests', () => {
  test('Create User API @smoke', async ({ userApi }) => {
    const payload = getTestData('users.json', 'validUser');

    const response = await userApi.createUser(payload);
    const body = await response.json();

    validateStatus(response, 201);
    validateSchema(body, createUserSchema);
    validateBodyContains(body, payload);
  });

  test('Get User API @smoke', async ({ userApi }) => {
    const userId = getTestData('users.json', 'existingUserId');

    const response = await userApi.getUser(userId);
    const body = await response.json();

    validateStatus(response, 200);
    validateSchema(body, userSchema);
    expect(body.id).toBe(userId);
  });

  test('Update User API', async ({ userApi }) => {
    const userId = getTestData('users.json', 'existingUserId');
    const payload = getTestData('users.json', 'updatedUser');

    const response = await userApi.updateUser(userId, payload);
    const body = await response.json();

    validateStatus(response, 200);
    validateBodyContains(body, payload);
  });

  test('Delete User API', async ({ userApi }) => {
    const userId = getTestData('users.json', 'existingUserId');

    const response = await userApi.deleteUser(userId);
    const body = await response.json();

    validateStatus(response, 200);
    expect(body.isDeleted).toBe(true);
  });
});

test.describe('User API - Negative Tests', () => {
  test('Get User - Resource Not Found', async ({ userApi }) => {
    const nonExistentId = getTestData('users.json', 'nonExistentUserId');

    const response = await userApi.getUser(nonExistentId);
    const body = await response.json();

    validateStatus(response, 404);
    expect(body.message).toContain(String(nonExistentId));
  });

  test('Unauthorized request - protected resource without a token', async ({ request }) => {
    // Hit the protected /auth/me endpoint directly (bypassing authApi/token
    // setup) to simulate a caller that never authenticated.
    const response = await request.get(AUTH_ENDPOINTS.me);

    validateStatus(response, 401);
  });

  test('Invalid token is rejected', async ({ request }) => {
    const response = await request.get(AUTH_ENDPOINTS.me, {
      headers: { Authorization: 'Bearer invalidtokenvalue' },
    });

    validateStatus(response, 401);
  });

  test('Duplicate record creation - documents mock API behavior', async ({ userApi }) => {
    const payload = getTestData('users.json', 'validUser');

    const firstResponse = await userApi.createUser(payload);
    const secondResponse = await userApi.createUser(payload);

    // dummyjson.com is a stub API with no persistence/uniqueness
    // constraints, so duplicate submissions both succeed. Against a real
    // backend this assertion would instead expect a 409 Conflict on the
    // second call.
    validateStatus(firstResponse, 201);
    validateStatus(secondResponse, 201);
  });
});
