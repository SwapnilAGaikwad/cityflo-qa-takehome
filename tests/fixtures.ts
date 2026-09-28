import { Page, expect } from '@playwright/test';

export const PICKUP = 'Hiranandani Gardens, Powai';
export const DROPOFF = 'Bandra Kurla Complex, Bandra East';

/**
 * Sets pickup/drop on Home if not already persisted from a prior run
 * (the app keeps the last search in localStorage), then searches.
 */
export async function searchRoute(page: Page) {
  await page.goto('/', { waitUntil: 'networkidle' });

  const needsPickup = await page.getByText('Select pickup location').isVisible().catch(() => false);
  if (needsPickup) {
    await page.getByText('Select pickup location').click();
    await page.getByRole('textbox').first().fill(PICKUP.split(',')[0]);
    await page.getByText(PICKUP).first().click();

    await page.getByText('Select drop location').click();
    await page.getByRole('textbox').first().fill('BKC');
    await page.getByText(DROPOFF).first().click();
  }

  await page.getByRole('button', { name: 'Search' }).click();
  await page.waitForURL('**/search-results', { timeout: 15_000 });
}

/** Proceeds from search results into the booking-type screen. */
export async function proceedToBookingType(page: Page) {
  await page.locator('button:has-text("Proceed")').first().click();
  await page.waitForTimeout(3_000);
}

export { expect };
