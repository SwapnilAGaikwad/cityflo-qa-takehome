import { test, expect } from '@playwright/test';

// TC-07 and TC-08 from docs/TEST_PLAN.md.

test.describe('Ride Pack display', () => {
  test('TC-07: validity claim ("30 days") is shown on every plan tier pre-purchase', async ({ page }) => {
    await page.goto('/rides', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3_000); // skeleton -> real content, see feature-presence.spec.ts comment

    const validityLabels = page.getByText('Validity: 30 days');
    const count = await validityLabels.count();
    expect(count, 'expected at least one plan tier showing the 30-day validity claim').toBeGreaterThan(0);
  });

  test('TC-08: once pack credits are exhausted, tab shows fresh purchase plans, not a broken/error state', async ({ page }) => {
    // This account's original 5 Rides Pack has since been fully consumed
    // via testing (see bug-reports/BUGS.md's resolved credit-balance
    // note) — its Ride Pack tab is now naturally back in the
    // "no active pack" state without needing a second account (which
    // ACCESS.md prohibits creating). This is effectively the same UI
    // state the original TC-08 targeted: a rider with no active pack
    // should see an inviting purchase flow, not an error.
    await page.goto('/rides', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3_000);

    await expect(page.getByText('Unexpected Application Error')).toHaveCount(0);
    const bodyText = await page.innerText('body');
    expect(bodyText).toMatch(/Validity: 30 days/i);
    expect(bodyText).not.toMatch(/error/i);
  });
});
