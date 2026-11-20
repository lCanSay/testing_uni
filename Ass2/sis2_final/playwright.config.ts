import { defineConfig, devices } from '@playwright/test';
import { STORAGE_STATE } from './fixtures/paths';

// `||` (not `??`): in CI an unset workflow input arrives as an empty string.
const BASE_URL = process.env.BASE_URL || 'https://practicesoftwaretesting.com';
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true, // required for --shard to split by test, not by file
  forbidOnly: isCI,
  retries: isCI ? 2 : 0, // course rule: retry only in CI, max 2
  workers: isCI ? 2 : undefined,
  // CI: blob is merged into one HTML report by the merge-reports job (merge.config.ts).
  reporter: isCI
    ? [['list'], ['blob'], ['junit', { outputFile: 'reports/junit.xml' }]]
    : [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    testIdAttribute: 'data-test',
    trace: 'on-first-retry', // changed from retain-on-failure (course setting)
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Full Chromium in "new headless" mode instead of chromium-headless-shell: the site's
    // Cloudflare bot check challenged the headless shell on GitHub runners.
    channel: 'chromium',
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
