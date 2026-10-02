import { defineConfig } from '@playwright/test';
const baseURL = process.env.TEST_URL || 'http://127.0.0.1:4323';
export default defineConfig({
  testDir: './tests/browser',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL, channel: process.env.CI ? 'chromium' : 'chrome', headless: true, trace: 'retain-on-failure' },
  workers: 1,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  webServer: process.env.TEST_URL ? undefined : {
    command: 'npm run preview -- --host 127.0.0.1 --port 4323',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
