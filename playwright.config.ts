import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false, // OTP + auto-renew flows share test state; run serially for now
  workers: 1, // staging is shared/live — ACCESS.md prohibits parallel request storms
  retries: 0, // no retries — a flaky pass hides a real bug during triage
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.STAGING_BASE_URL || 'https://app.cityflostaging.com',
    // OTP can't be scripted — log in once by hand via `npx playwright codegen
    // --save-storage=auth.json <baseURL>`, then every spec reuses that session.
    storageState: 'auth.json',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
