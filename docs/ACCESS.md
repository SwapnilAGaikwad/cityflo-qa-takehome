# ACCESS — how to test Monthly Pass + Auto-Renew on staging

The system under test is **Cityflo's real staging rider web app**:

> **https://app.cityflostaging.com**

This is a live React SPA — the same rider app, pointed at our staging backend. There is no bundled copy of the app and no separate dataset to download. **The staging app is the system under test.** You find issues by exercising it against the PRD, not by reading a fixture file.

## 1. Logging in (your own number)

- Login is **phone number + OTP**. There is **no shared test account** — you authenticate with **your own phone number** and the **real OTP** you receive on it.
- Enter your number, request the code, type the code you get, and you're in with your own rider account.
- If staging rate-limits OTP requests, wait it out — do not hammer the send button.

## 2. Payments on staging are SANDBOXED and FREE

- The staging backend is wired to a **sandbox payment gateway**. It **never charges a real card and never moves real money.** Purchases, payments, and auto-renew charges all run end-to-end against the sandbox.
- Because of that, you **can and should** exercise the **full purchase → payment → auto-renew funnel** end to end. That is the high-value path; do not stop at the paywall.
- **Never enter real card details.** Use only the sandbox test instruments the gateway's test mode provides (sandbox UPI handle / test-card numbers shown in the gateway's test UI). If you are ever unsure whether an input is real or sandbox, stop and assume it is real.

## 3. Respectful-testing rules (this is a shared live environment)

- **Your own account only.** Do not attempt to access, enumerate, or act on anyone else's account, number, or pass.
- **No load, stress, fuzzing, or destructive runs.** No scripted hammering, no parallel storms of requests, no attempts to break or take down the environment. Hand-paced functional testing and a small automated suite are exactly right; a load test is not.
- **No real money, no real PII** beyond your own login number.
- Staging is a **live, shared environment we do not control** — there are no planted bugs here. Whatever you find is real behaviour of the real app.

If anything about the environment seems unsafe to exercise, note it and move on rather than forcing it.

## 4. The OTP wall and Playwright (recommended pattern)

1. **Log in once, manually,** in a browser Playwright controls:
   ```bash
   npx playwright codegen --save-storage=auth.json https://app.cityflostaging.com
   ```
2. **Persist the session** with Playwright's `storageState` so subsequent runs reuse that authenticated session:
   ```ts
   // playwright.config.ts
   use: {
     baseURL: "https://app.cityflostaging.com",
     storageState: "auth.json",
   },
   ```
3. Specs then start already-authenticated and drive the pass / payment / auto-renew flows directly.

## 5. A note on time-based behaviour

Auto-renew fires on a renewal date, and pass validity is measured in days. You will not be able to wait a real month for a renewal — figure out how to **observe and reason about** renewal/validity behaviour within the timebox (e.g. inspect what the app shows and what the network calls return for a near-expiry pass), and be explicit about what was directly observed vs. inferred.
