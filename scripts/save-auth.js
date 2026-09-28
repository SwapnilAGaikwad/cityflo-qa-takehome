// One-time manual login helper: fills the phone number, sends the OTP,
// waits for you to type the real OTP in the browser by hand, then saves
// the authenticated session to auth.json for the test suite to reuse.
//
// Usage: node scripts/save-auth.js
// Requires TEST_PHONE_NUMBER in .env

require('dotenv').config();
const { chromium } = require('playwright');

const BASE_URL = process.env.STAGING_BASE_URL || 'https://app.cityflostaging.com';
const PHONE = process.env.TEST_PHONE_NUMBER;

async function waitForEnter(prompt) {
  process.stdout.write(prompt);
  return new Promise((resolve) => {
    process.stdin.resume();
    process.stdin.once('data', () => {
      process.stdin.pause();
      resolve();
    });
  });
}

(async () => {
  if (!PHONE) {
    console.error('Set TEST_PHONE_NUMBER in .env first.');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${BASE_URL}/login`);
  await page.getByRole('textbox', { name: /digit mobile number/i }).fill(PHONE);
  await page.getByRole('button', { name: 'Send OTP' }).click();

  await waitForEnter(
    '\nOTP sent. Type the 6-digit code into the browser window yourself, ' +
    'then come back here and press Enter to continue...\n'
  );

  await context.storageState({ path: 'auth.json' });
  console.log('Saved session to auth.json');

  await browser.close();
  process.exit(0);
})();
