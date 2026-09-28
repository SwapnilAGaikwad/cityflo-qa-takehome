import { test, expect } from '@playwright/test';

// OTP can't be scripted. Precondition: run `node scripts/save-auth.js` once
// (see README) to produce auth.json, which playwright.config.ts loads as
// storageState for every test in this suite.

test.describe('Auth — session reuse', () => {
  test('authenticated session loads Home without bouncing to /login', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByText(/where are you heading today/i)).toBeVisible();
  });
});
