# Cityflo QA Assignment — Monthly Pass + Auto-Renew

Time-boxed to 2–4 focused hours. Small, sharp slice over volume.

## Workflow

1. **Paste the PRD** into `docs/PRD.md` verbatim.
2. **Get staging access** — fill in `.env` (copy from `.env.example`) with the staging URL and your own phone number for OTP login.
3. **Explore staging manually first.** Verify the PRD against the live app before trusting either it or the test plan below — this is the actual point of the exercise.
4. **Fill in `docs/TEST_PLAN.md`** — scope, spec gaps, and the test case matrix. Mark which cases get automated.
5. **Automate the handful of cases that matter** in `tests/*.spec.ts` (Playwright). Replace the `test.fixme` placeholders with real selectors/assertions found by exploring the live DOM — don't guess them from the PRD.
6. **Run against staging:**
   ```
   npm install
   npx playwright install chromium
   npm test
   ```
7. **Triage failures** — for each real bug, file a report in `bug-reports/` using `TEMPLATE.md`, with repro steps and a defensible severity.

## Rules of engagement

- Authenticate with your own phone number only.
- Never use a real card — staging payments are sandboxed and free.
- Test respectfully — no load/stress testing, no mass account creation.
- You are QA, not the implementer — don't fix bugs, report them.
