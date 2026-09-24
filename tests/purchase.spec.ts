import { test, expect } from './fixtures';

test.describe('Monthly Pass purchase (sandbox payment)', () => {
  test.fixme('purchases a monthly pass end-to-end with sandbox payment success', async ({ loggedInPage }) => {
    // TODO
  });

  test.fixme('handles sandbox payment decline gracefully, no pass granted', async ({ loggedInPage }) => {
    // TODO
  });

  test.fixme('double-tapping purchase does not create duplicate charges/passes', async ({ loggedInPage }) => {
    // TODO — the "double-charges a commuter" case
  });
});
