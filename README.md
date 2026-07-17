# API Automation Framework

Enterprise-grade API automation framework built with **Playwright Test Runner** and
**JavaScript (Node.js)**. It is designed for maintainability, scalability, and easy
CI/CD integration.

The example suite runs against [dummyjson.com](https://dummyjson.com), a free,
key-less public REST API that supports user CRUD and a real login/JWT flow — ideal
for demonstrating positive and negative API test scenarios without any account
signup. Swap the `baseUrl` (and optionally `apiKey`) in `config/environments/*.json`
to point the framework at your own service.

---

## 1. Project Structure

```
api-automation-framework
│
├── tests
│   ├── user
│   │   └── user.spec.js
│   ├── auth
│   │   └── auth.spec.js
│   └── health
│       └── health.spec.js
│
├── api
│   ├── clients
│   │   └── apiClient.js        # Reusable GET/POST/PUT/PATCH/DELETE wrapper
│   ├── services
│   │   ├── userApi.js          # Business-level user operations
│   │   └── authApi.js          # Business-level auth operations
│   └── endpoints
│       ├── userEndpoints.js    # Centralized user URL paths
│       └── authEndpoints.js    # Centralized auth URL paths
│
├── test-data
│   ├── users.json
│   └── auth.json
│
├── utils
│   ├── testDataReader.js       # Loads/caches JSON test data
│   ├── tokenManager.js         # In-memory auth token store
│   ├── logger.js                # Request/response logging
│   └── validators.js           # Status / schema / header / timing assertions
│
├── fixtures
│   └── apiFixture.js           # apiClient / userApi / authApi / authToken fixtures
│
├── schemas
│   ├── userSchema.json
│   ├── createUserSchema.json
│   └── loginSchema.json
│
├── config
│   ├── config.js                # Loads + merges environment config
│   └── environments
│       ├── qa.json
│       ├── uat.json
│       └── prod.json
│
├── reports                      # HTML / JUnit reports, traces (generated)
│
├── playwright.config.js
├── package.json
├── Jenkinsfile
├── .env
├── .gitignore
└── README.md
```

---

## 2. Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run tests

```bash
npm test                 # runs against the ENV set in .env (default: qa)
npm run test:qa          # force QA environment
npm run test:uat         # force UAT environment
npm run test:prod        # force PROD environment
npm run test:user        # only tests/user
npm run test:auth        # only tests/auth
npm run test:health      # only tests/health
```

### View the HTML report

```bash
npm run report
```

---

## 3. Environment Configuration

The active environment is controlled by the `ENV` variable (see `.env`):

```
ENV=qa
```

`config/config.js` loads `dotenv`, reads `ENV`, and merges the matching file from
`config/environments/`:

```json
{
  "env": "qa",
  "baseUrl": "https://dummyjson.com/",
  "apiKey": "",
  "timeout": 30000
}
```

`BASE_URL` / `API_KEY` environment variables (e.g. injected as CI secrets) take
precedence over the values in the JSON file — useful for pointing a pipeline at a
different backend without editing tracked files.

> **Note:** `baseUrl` intentionally ends with a trailing `/` and endpoint paths never
> start with `/` (e.g. `users/2`, not `/users/2`). This is required for Playwright's
> `request` context to correctly append paths onto a `baseURL` that itself has a path
> segment — a leading `/` on the request path would otherwise replace it.

---

## 4. Authentication Handling

`utils/tokenManager.js` is a singleton in-memory store for a Bearer/JWT token.
`api/services/authApi.js#login()` calls the login endpoint, extracts the token from
the response, and stores it via `tokenManager.setToken()`. `api/clients/apiClient.js`
then automatically attaches `Authorization: Bearer <token>` (and an `x-api-key`
header, if `config.apiKey` is set) to every subsequent request — tests never handle
headers directly.

The `authToken` fixture (`fixtures/apiFixture.js`) performs this login before a test
runs and clears the token afterward, so authenticated flows are declared simply by
depending on the fixture:

```javascript
test('Authenticated requests automatically attach the Bearer token', async ({ authToken, authApi }) => {
  const response = await authApi.me();
  expect(response.status()).toBe(200);
});
```

---

## 5. Writing a Test

```javascript
const { test, expect } = require('../../fixtures/apiFixture');
const { validateStatus } = require('../../utils/validators');
const { getTestData } = require('../../utils/testDataReader');

test('Create User API', async ({ userApi }) => {
  const payload = getTestData('users.json', 'validUser');
  const response = await userApi.createUser(payload);

  validateStatus(response, 201);
});
```

Tests never construct URLs or payloads inline — endpoints live in `api/endpoints`,
payloads live in `test-data/*.json`, and assertions go through `utils/validators.js`.

---

## 6. Test Coverage

| Suite | Positive | Negative |
|---|---|---|
| `tests/user/user.spec.js` | Create, Get, Update, Delete user | Resource not found (404), unauthorized request (401), invalid token (401), duplicate creation |
| `tests/auth/auth.spec.js` | Login success + schema validation, authenticated protected-resource access | Missing mandatory field, invalid password, unregistered user |
| `tests/health/health.spec.js` | API availability + response time, content-type header | — |

Responses are validated for status code, JSON schema (via Ajv), header presence, and
response time using the shared helpers in `utils/validators.js`.

---

## 7. Reporting

`playwright.config.js` is configured with:

```javascript
reporter: [
  ['html', { outputFolder: 'reports/html-report', open: 'never' }],
  ['list'],
  ['junit', { outputFile: 'reports/junit-results.xml' }],
],
use: {
  trace: 'retain-on-failure',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
},
```

- **HTML report**: `reports/html-report` (open via `npm run report`)
- **JUnit XML**: `reports/junit-results.xml` (for CI test-result publishing)
- **Traces**: retained on failure for step-by-step debugging (`npx playwright show-trace <file>`)
- **Retries**: 2 automatic retries in CI (`process.env.CI`)

---

## 8. CI/CD Integration

A ready-to-use `Jenkinsfile` is provided. It:

1. Checks out the repository
2. Installs dependencies (`npm ci`) and Playwright browsers
3. Runs the suite against a parameterized `ENVIRONMENT` (qa/uat/prod)
4. Publishes the HTML report via the Jenkins HTML Publisher plugin
5. Publishes JUnit results for pass/fail trend graphs
6. Archives all report/trace artifacts

Trigger a build with the `ENVIRONMENT` build parameter to target QA, UAT, or PROD.

---

## 9. Coding Standards

- Async/await throughout, no callback chains
- ES6 classes for clients/services (`ApiClient`, `UserApi`, `AuthApi`)
- Clear separation of concerns: endpoints → services → fixtures → tests
- No hardcoded URLs or payloads inside test files
- Centralized logging for every request/response (`utils/logger.js`)
- JSON Schema validation for response contracts (`schemas/`)

---

## 10. Extending the Framework

- **New endpoint**: add it to the relevant file in `api/endpoints/`.
- **New service method**: add it to the relevant class in `api/services/`, calling
  the endpoint + `apiClient`.
- **New test data**: add a key to the relevant file in `test-data/`.
- **New response contract**: add a JSON schema under `schemas/` and validate with
  `validateSchema()`.
- **Pointing at your own API**: update `baseUrl` (and `apiKey`, if required) in
  `config/environments/<env>.json`, and adjust endpoint paths/service payloads to
  match your API's contract.
