import { defineConfig, devices } from '@playwright/test';
import { STORAGE_STATE } from './fixtures/paths';

const BASE_URL = process.env.BASE_URL ?? 'https://practicesoftwaretesting.com';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0, // course rule: retry only in CI, max 2
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    testIdAttribute: 'data-test',
    trace: 'on-first-retry', // changed from retain-on-failure (course setting)
    screenshot: 'only-on-failure',
  },
  projects: [
    // Creates ONE fresh user through the API, logs in through the UI once and saves storageState.
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    // Everything that must start anonymous (register, login, reset password, compare).
    {
      name: 'anonymous',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: [/.*\.setup\.ts/, /buy-product\.spec\.ts/],
    },

    // Specs that need a signed-in session reuse the stored state instead of logging in again.
    {
      name: 'authenticated',
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
      testMatch: /buy-product\.spec\.ts/,
      dependencies: ['setup'],
    },
  ],
});
