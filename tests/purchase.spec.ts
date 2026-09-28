import { test, expect } from '@playwright/test';
import { searchRoute, proceedToBookingType } from './fixtures';

// Note: the PRD's "Monthly Pass" (flat ₹3,000, unlimited rides, route-bound)
// does not exist on staging — see docs/TEST_PLAN.md §1 and BUG-002. These
// tests cover the real purchase funnel and its money-safety property
// instead of a product that isn't there.

test.describe('Purchase funnel', () => {
  test('booking-type screen loads without crashing (regression test for BUG-001)', async ({ page }) => {
    await searchRoute(page);
    await proceedToBookingType(page);

    const crashed = await page.getByText('Unexpected Application Error').count();
    expect(crashed, 'app crashed to an unhandled error boundary — see BUG-001').toBe(0);

    await expect(page.getByText('Book One-way ride')).toBeVisible();
    await expect(page.getByText('Pre-booked rides')).toBeVisible();
    await expect(page.getByText('Pack of rides')).toBeVisible();
  });

  test('selected Ride Pack price matches the amount charged at checkout', async ({ page }) => {
    await searchRoute(page);
    await proceedToBookingType(page);

    if (await page.getByText('Unexpected Application Error').count()) {
      test.fixme(true, 'hit BUG-001 crash on this run — retry; not this test\'s concern');
    }

    // "Pack of rides" -> Ride Pack plan list. Scoped to the card itself
    // (not an index) because the sibling "Pre-booked rides" card sometimes
    // fails to render at all — see BUG-001 addendum in bug-reports/BUGS.md.
    const packCard = page.locator('div', { hasText: 'Pack of rides' }).last();
    await packCard.locator('button:has-text("Proceed")').click();
    await page.waitForURL('**/booking/ride-pack', { timeout: 15_000 });

    const plan = page.getByText('5 Rides Pack').locator('..').locator('..');
    await expect(plan).toContainText('₹525');
    await page.getByText('5 Rides Pack').first().click();

    await page.locator('button:has-text("Proceed to payment")').click();
    await page.waitForURL(/juspay\.in/, { timeout: 20_000 });

    await expect(page.getByText('₹525')).toBeVisible();
  });
});
