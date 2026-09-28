# Cityflo QA Assignment — Monthly Pass + Auto-Renew

Take-home for the QA Engineer role. See `docs/BRIEF.md`, `docs/PRD.md`, `docs/ACCESS.md` for the assignment as given; `docs/TEST_PLAN.md` for what was actually tested and found; `bug-reports/BUGS.md` for filed bugs; `docs/NOTES.md` for the submission reflection.

**Headline finding:** the "Monthly Pass + Auto-Renew" feature described in the PRD does not exist on staging under that name or shape — see `docs/TEST_PLAN.md` §1 and `bug-reports/BUGS.md` BUG-002. This shaped everything downstream.

## Setup

```
npm install
npx playwright install chromium
```

Login can't be scripted (real OTP to a real phone). One-time manual step:

```
cp .env.example .env   # fill in TEST_PHONE_NUMBER
node scripts/save-auth.js
```

This opens a browser, fills your number, sends the OTP. Type the OTP into the browser yourself, wait for the logged-in home screen, **then** return to the terminal and press Enter — it saves the session to `auth.json`, which every spec reuses via `storageState` (see `playwright.config.ts`). Session TTL/expiry wasn't tested; re-run this script if tests start failing with a bounce to `/login`.

## Run the suite

```
npm test              # headless
npm run test:headed   # watch it run
npm run report         # HTML report with traces/videos/screenshots on failure
```

Three specs, ~3 minutes:
- `tests/auth.spec.ts` — session reuse works
- `tests/purchase.spec.ts` — the real purchase funnel doesn't crash (regression test for BUG-001), and the selected plan's price matches the checkout amount (money-safety; see BUG-001 addendum for why this one isn't reliably green in this environment right now — that's itself part of the finding)
- `tests/feature-presence.spec.ts` — canary asserting "auto-renew" appears nowhere in the app today; meant to start failing the day the real feature ships

## Rules of engagement (from ACCESS.md)

- Authenticate with your own phone number only — no shared test account exists.
- Never enter real card/UPI details. Staging payments are sandboxed.
- Test respectfully — no load/stress/fuzzing against shared staging.
- QA only — bugs are reported, not fixed.
