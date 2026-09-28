import { test, expect } from '@playwright/test';

// Canary, not a normal pass/fail test: the PRD's Auto-Renew feature could
// not be found anywhere in the live app (see docs/TEST_PLAN.md §1, BUG-002).
// This asserts that current absence. If it ever fails, that's the signal
// the feature shipped and the real auto-renew suite (cancel window,
// failure-retry, etc. — PRD §5) needs to be written against the real UI.

const PAGES = ['/', '/rides', '/my-rides', '/profile', '/more'];

test.describe('Auto-Renew feature presence (canary)', () => {
  for (const path of PAGES) {
    test(`"${path}" does not mention auto-renew today`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      // networkidle fires once requests settle, but this app renders
      // skeleton placeholders that fill in afterward (observed on the
      // Ride Pack tab during manual exploration). Since this test's whole
      // point is proving absence, a page that hasn't finished painting
      // would produce a false negative — so wait for content to settle
      // and confirm we're not still looking at a skeleton screen.
      await page.waitForTimeout(3_000);
      await expect(page.locator('body')).not.toContainText(/loading/i);

      const bodyText = await page.innerText('body');
      expect(bodyText.length, 'page body looks empty — may not have loaded').toBeGreaterThan(100);
      expect(bodyText).not.toMatch(/auto.?renew/i);
    });
  }
});
