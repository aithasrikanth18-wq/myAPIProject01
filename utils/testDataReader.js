const fs = require('fs');
const path = require('path');

const TEST_DATA_DIR = path.resolve(__dirname, '..', 'test-data');
const cache = new Map();

/**
 * Reads and parses a JSON file from the test-data directory.
 * Results are cached so repeated lookups don't re-hit the filesystem.
 *
 * @param {string} fileName e.g. "users.json"
 * @returns {object}
 */
function readTestData(fileName) {
  if (cache.has(fileName)) {
    return cache.get(fileName);
  }

  const filePath = path.join(TEST_DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Test data file not found: ${filePath}`);
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  cache.set(fileName, data);
  return data;
}

/**
 * Convenience helper to fetch a single named data set from a file.
 *
 * @param {string} fileName e.g. "users.json"
 * @param {string} key e.g. "validUser"
 */
function getTestData(fileName, key) {
  const data = readTestData(fileName);
  if (!(key in data)) {
    throw new Error(`Key "${key}" not found in test data file "${fileName}"`);
  }
  return data[key];
}

module.exports = {
  readTestData,
  getTestData,
};
