import { defineConfig, devices } from '@playwright/test'
import { hasE2EAuthCredentials } from './tests/config/env'

const baseURL = process.env.BASE_URL ?? 'http://app.forum.test'
const hasAuth = hasE2EAuthCredentials()

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : 2,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: process.env.PW_VIDEO === '1' ? 'retain-on-failure' : 'off',
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
    extraHTTPHeaders: {
      'X-Forum-E2E': '1',
    },
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
              storageState: 'playwright/.auth/user.json',
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
