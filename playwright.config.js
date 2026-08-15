const { defineConfig } = require('@playwright/test');
const config = require('./config/config');

module.exports = defineConfig({
  testDir: './tests',
  timeout: config.timeout || 30000,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],
    ['list'],
    ['junit', { outputFile: 'reports/junit-results.xml' }],
  ],

  use: {
    baseURL: config.baseUrl,
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  outputDir: 'reports/test-results',
});


