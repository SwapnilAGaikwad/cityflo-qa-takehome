import { test, expect } from './fixtures';

test.describe('Auto-renew', () => {
  test.fixme('auto-renew defaults to the state specified in the PRD on purchase', async ({ loggedInPage }) => {
    // TODO — verify actual default against PRD, don't assume
  });

  test.fixme('cancelling auto-renew before renewal date prevents next charge', async ({ loggedInPage }) => {
    // TODO
  });
});
