import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Sequential - ek ke baad ek test
  retries: 2,
  workers: 1,
  
  reporter: [
    ['html', { outputFolder: 'audit-report', open: 'never' }],
    ['json', { outputFile: 'audit-results.json' }],
    ['list'] // Terminal me live progress
  ],

  timeout: 60000, // 60 seconds per test

  use: {
    baseURL: 'https://admin.mancu.cloud',
    screenshot: 'on', // Har test ka screenshot
    video: 'on',      // Har test ki video recording
    trace: 'on',      // Debug ke liye
    headless: false,  // Browser dikhega
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
});
