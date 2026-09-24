import { test as base, expect } from '@playwright/test';

/**
 * Shared fixtures for the Monthly Pass + Auto-Renew suite.
 * Fill in real selectors/flows once staging access is confirmed —
 * don't guess selectors from the PRD, read them off the live DOM.
 */
export const test = base.extend<{ loggedInPage: import('@playwright/test').Page }>({
  loggedInPage: async ({ page }, use) => {
    const phone = process.env.TEST_PHONE_NUMBER;
    if (!phone) throw new Error('TEST_PHONE_NUMBER not set in .env');

    await page.goto('/');
    // TODO: replace with real login flow once selectors are confirmed against staging
    // await page.getByLabel('Phone number').fill(phone);
    // await page.getByRole('button', { name: /send otp/i }).click();
    // await page.getByLabel('OTP').fill(await getOtp());

    await use(page);
  },
});

export { expect };
