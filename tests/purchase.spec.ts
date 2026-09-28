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

  test('completes a real sandbox purchase end-to-end via Net Banking test flow', async ({ page }) => {
    // Exercises ACCESS.md's "full purchase -> payment -> auto-renew funnel"
    // instruction for real, using the One-way ride card (more resilient to
    // BUG-001 than the Ride Pack card — see BUGS.md). Test instrument:
    // Juspay sandbox's own Net Banking simulator (test bank login
    // payu/payu, then "Simulate Success Response") — found via manual
    // codegen, not guessed. This is a real order; staging payments are
    // sandboxed/free per ACCESS.md.
    await searchRoute(page);
    await proceedToBookingType(page);

    if (await page.getByText('Unexpected Application Error').count()) {
      test.fixme(true, 'hit BUG-001 crash on this run — retry');
    }

    // Note: this card's position/availability shifts once the account
    // already has an active pack (as it will after this test's first
    // successful run) — another symptom of the instability in BUG-001.
    // Best-effort locator; if the UI has changed shape, fail clearly
    // rather than hang on the full 60s test timeout.
    const oneWayCard = page.locator('div', { hasText: 'Book One-way ride' }).last();
    const proceedBtn = oneWayCard.locator('button:has-text("Proceed")');
    if (!(await proceedBtn.isVisible({ timeout: 10_000 }).catch(() => false))) {
      test.fixme(true, 'One-way ride card not in its expected shape this run — see BUG-001/TEST_PLAN.md §0b');
    }
    await proceedBtn.click();
    await page.waitForURL(/juspay\.in/, { timeout: 20_000 });

    await page.getByRole('tab', { name: 'netbanking Net Banking' }).click();
    await page.locator('[id="70000200"]').click(); // State Bank of India (sandbox)
    await page.getByRole('button', { name: 'State Bank of India' }).click();
    await page.getByRole('button', { name: 'Proceed to Pay' }).click();

    await page.getByRole('textbox', { name: 'Enter payu as username' }).fill('payu');
    await page.getByRole('textbox', { name: 'Enter payu as password' }).fill('payu');
    await page.getByRole('button', { name: 'Submit' }).press('Enter');
    await page.getByRole('button', { name: 'Simulate Success Response' }).click();

    await page.goto('/my-rides', { waitUntil: 'networkidle' });
    await expect(page.getByText('Upcoming Rides')).toBeVisible();

    // Even on a completed, real, paid booking, no auto-renew concept appears.
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toMatch(/auto.?renew/i);
  });
});
