import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.CUHALIDE_BASE_URL || 'https://cuhalide-atlas-v3.vercel.app';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  timeout: 60_000,
  expect: { timeout: 12_000 },
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  outputDir: 'test-results',
  use: {
    baseURL,
    ignoreHTTPSErrors: false,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } },
    },
    {
      name: 'tablet-chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 820, height: 1180 } },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
  ],
});
