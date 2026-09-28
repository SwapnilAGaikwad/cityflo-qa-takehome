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
      const bodyText = await page.innerText('body');
      expect(bodyText).not.toMatch(/auto.?renew/i);
    });
  }
});
