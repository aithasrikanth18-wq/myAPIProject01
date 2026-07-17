const { expect } = require('@playwright/test');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

/**
 * Asserts the HTTP status code of a response.
 * @param {import('@playwright/test').APIResponse} response
 * @param {number} expectedCode
 */
function validateStatus(response, expectedCode) {
  expect(
    response.status(),
    `Expected status ${expectedCode} but received ${response.status()} for ${response.url()}`
  ).toBe(expectedCode);
}

/**
 * Asserts the response body against a JSON schema (Ajv/JSON Schema draft-07).
 * @param {object} body Parsed JSON response body
 * @param {object} schema JSON schema object
 */
function validateSchema(body, schema) {
  const validate = ajv.compile(schema);
  const isValid = validate(body);

  expect(
    isValid,
    `Schema validation failed: ${JSON.stringify(validate.errors, null, 2)}`
  ).toBe(true);
}

/**
 * Asserts that a set of key/value pairs are present in the response body.
 * @param {object} body
 * @param {object} expected
 */
function validateBodyContains(body, expected) {
  for (const [key, value] of Object.entries(expected)) {
    expect(body[key]).toEqual(value);
  }
}

/**
 * Asserts a response header is present and optionally matches a value.
 * @param {import('@playwright/test').APIResponse} response
 * @param {string} headerName
 * @param {string} [expectedValue]
 */
function validateHeader(response, headerName, expectedValue) {
  const headers = response.headers();
  const actual = headers[headerName.toLowerCase()];

  expect(actual, `Expected header "${headerName}" to be present`).toBeDefined();

  if (expectedValue !== undefined) {
    expect(actual).toContain(expectedValue);
  }
}

/**
 * Asserts that a response completed within the given time budget.
 * @param {number} elapsedMs Elapsed request duration in milliseconds
 * @param {number} maxMs Maximum acceptable duration in milliseconds
 */
function validateResponseTime(elapsedMs, maxMs) {
  expect(
    elapsedMs,
    `Response took ${elapsedMs}ms, exceeding the ${maxMs}ms budget`
  ).toBeLessThanOrEqual(maxMs);
}

module.exports = {
  validateStatus,
  validateSchema,
  validateBodyContains,
  validateHeader,
  validateResponseTime,
};
