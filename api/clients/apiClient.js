const config = require('../../config/config');
const logger = require('../../utils/logger');
const tokenManager = require('../../utils/tokenManager');

/**
 * Thin, reusable wrapper around Playwright's APIRequestContext.
 * Centralizes common headers, authentication, and request/response logging
 * so individual services and tests never talk to the request context directly.
 */
class ApiClient {
  constructor(request) {
    this.request = request;
  }

  /**
   * Builds the headers applied to every request: content type, the
   * environment API key, and a Bearer token when one has been captured by
   * the TokenManager (e.g. after a successful login).
   */
  _buildHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (config.apiKey) {
      headers['x-api-key'] = config.apiKey;
    }

    if (tokenManager.hasToken()) {
      headers.Authorization = `Bearer ${tokenManager.getToken()}`;
    }

    return { ...headers, ...customHeaders };
  }

  async _logRequest(method, url, data) {
    logger.info(`--> ${method} ${url}`, data ? { body: data } : undefined);
  }

  async _logResponse(method, url, response, elapsedMs) {
    logger.info(
      `<-- ${method} ${url} ${response.status()} (${elapsedMs}ms)`
    );
  }

  async _execute(method, url, requestFn, data) {
    await this._logRequest(method, url, data);
    const startTime = Date.now();

    const response = await requestFn();

    const elapsedMs = Date.now() - startTime;
    await this._logResponse(method, url, response, elapsedMs);

    // Attach the measured duration so tests can validate response time
    // without needing to track timestamps themselves.
    response.elapsedMs = elapsedMs;
    return response;
  }

  async get(url, options = {}) {
    const { headers, params, ...rest } = options;
    return this._execute('GET', url, () =>
      this.request.get(url, {
        headers: this._buildHeaders(headers),
        params,
        ...rest,
      })
    );
  }

  async post(url, data = {}, options = {}) {
    const { headers, ...rest } = options;
    return this._execute(
      'POST',
      url,
      () =>
        this.request.post(url, {
          headers: this._buildHeaders(headers),
          data,
          ...rest,
        }),
      data
    );
  }

  async put(url, data = {}, options = {}) {
    const { headers, ...rest } = options;
    return this._execute(
      'PUT',
      url,
      () =>
        this.request.put(url, {
          headers: this._buildHeaders(headers),
          data,
          ...rest,
        }),
      data
    );
  }

  async patch(url, data = {}, options = {}) {
    const { headers, ...rest } = options;
    return this._execute(
      'PATCH',
      url,
      () =>
        this.request.patch(url, {
          headers: this._buildHeaders(headers),
          data,
          ...rest,
        }),
      data
    );
  }

  async delete(url, options = {}) {
    const { headers, ...rest } = options;
    return this._execute('DELETE', url, () =>
      this.request.delete(url, {
        headers: this._buildHeaders(headers),
        ...rest,
      })
    );
  }
}

module.exports = ApiClient;
