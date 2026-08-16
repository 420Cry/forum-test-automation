import { defineConfig, devices } from '@playwright/test'
import { hasE2EAuthCredentials } from './tests/config/env'
import { authStoragePath } from './tests/config/paths'

const baseURL = process.env.BASE_URL ?? 'http://app.forum.test'
const hasAuth = hasE2EAuthCredentials()

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 2,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],
  // Generous: follow-edge specs queue on `peerFollowLock`, and the wait counts
  // against the test's own budget.
  timeout: 90_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: process.env.PW_VIDEO === '1' ? 'retain-on-failure' : 'off',
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
    // Do not set custom extraHTTPHeaders here: Playwright applies them to
    // cross-origin API calls too, and unknown headers fail browser CORS
    // (net::ERR_FAILED on /auth/me → stuck on /onboard after login).
  },
  projects: [
    ...(hasAuth
      ? [
          {
            name: 'setup',
            testMatch: /auth\.setup\.ts/,
          },
          {
            name: 'chromium',
            use: {
              ...devices['Desktop Chrome'],
              storageState: authStoragePath,
            },
            dependencies: ['setup'],
            testMatch: /e2e\/(?!smoke\/).*\.spec\.ts$/,
          },
        ]
      : []),
    {
      name: 'guest',
      fullyParallel: false,
      workers: 1,
      use: {
        ...devices['Desktop Chrome'],
        storageState: { cookies: [], origins: [] },
      },
      testMatch: /e2e\/smoke\/.*\.spec\.ts$/,
    },
  ],
})
