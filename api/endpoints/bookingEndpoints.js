const config = require('../../config/config');

// restful-booker.com is a fixed second host, independent of the
// dummyjson-based `baseUrl`. These are absolute URLs on purpose: Playwright's
// request context uses an absolute URL as-is and ignores the configured
// baseURL, so these can be passed straight into the shared ApiClient.
const BOOKER_BASE = config.bookerBaseUrl;

module.exports = {
  auth: `${BOOKER_BASE}auth`,
  ping: `${BOOKER_BASE}ping`,
  booking: `${BOOKER_BASE}booking`,
  bookingById: (id) => `${BOOKER_BASE}booking/${id}`,
};
