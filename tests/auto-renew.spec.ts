import { test, expect } from '@playwright/test';

// TC-09 / TC-10 from docs/TEST_PLAN.md. These are written as test.fixme()
// deliberately, not skipped silently and not faked as passing: the
// Auto-Renew feature these specs target does not exist anywhere in the
// live app today (BUG-002). Selectors below are best-guess placeholders
// based on the PRD's spec language, not verified against real UI — do
// not trust them blindly when the feature ships; re-derive selectors
// from the actual DOM at that point, the same way every other spec in
// this suite was built. The value here is the assertions and structure,
// not the selectors.
//
// tests/feature-presence.spec.ts is the live canary: the day it starts
// failing is the day these two stop being fixme.

test.describe('Auto-Renew (PRD §5) — not testable against live app, see BUG-002', () => {
  test.fixme(
    'TC-09: auto-renew can be cancelled up to 24h before renewal date, locked after',
    async ({ page }) => {
      // Intended assertion per PRD §5: a rider can toggle auto-renew off
      // any time up until 24h before the renewal date; after that point,
      // the toggle should be disabled/locked with a message explaining why.
      await page.goto('/my-rides');
      await page.getByRole('button', { name: /manage ride/i }).first().click();
      const toggle = page.getByRole('switch', { name: /auto.?renew/i });
      await expect(toggle).toBeVisible();
      await expect(toggle).toBeEnabled();
      await toggle.click();
      await expect(toggle).not.toBeChecked();

      // Within the 24h lock window, the toggle should be disabled with an
      // explanation, not silently ignore the click.
      // await expect(toggle).toBeDisabled();
      // await expect(page.getByText(/locked in for the upcoming cycle/i)).toBeVisible();
    }
  );

  test.fixme(
    'TC-10: a failed renewal charge keeps auto-renew ON, notifies the rider, and does not leave a phantom active pass',
    async ({ page }) => {
      // Intended assertion per PRD §5: on payment failure, auto-renew
      // stays ON, the rider is notified (in-app and/or push/SMS — verify
      // whichever channel the real implementation uses), and the rider
      // has no active pass until a charge succeeds. This can't be forced
      // on live staging without a way to fail a specific renewal charge
      // on demand — flag to eng/PM whether a staging-only endpoint for
      // this exists before attempting to automate for real.
      await page.goto('/my-rides');
      await expect(page.getByText(/renewal (failed|unsuccessful)/i)).toBeVisible();
      const toggle = page.getByRole('switch', { name: /auto.?renew/i });
      await expect(toggle).toBeChecked();
      await expect(page.getByText(/no active pass/i)).toBeVisible();
    }
  );
});
