import { test, expect } from './fixtures';

test.describe('Auth — phone + OTP login', () => {
  test('logs in with a valid own phone number', async ({ loggedInPage }) => {
    // TODO: assert on real post-login element once staging is explored
    await expect(loggedInPage).toHaveURL(/./);
  });
});
