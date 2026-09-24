# Test Plan — Monthly Pass + Auto-Renew

> Fill this in after reading docs/PRD.md and exploring staging. Do not write this from the PRD alone — every row needs a staging observation, not just a spec inference.

## 1. Scope

**In scope for this pass (time-boxed to 2–4 hours):**
-

**Explicitly out of scope (and why):**
-

## 2. Spec gaps / open questions

Where the PRD is silent, ambiguous, or contradicts what staging actually does. Flag these before automating — an automated test built on a guess just encodes the guess.

| # | Question | PRD says | Staging does | Resolution / assumption made |
|---|----------|----------|---------------|-------------------------------|
|   |          |          |               |                               |

## 3. Test case matrix

Cover E2E, edge cases, and negative paths. Mark which ones get automated vs. exploratory-only, and why.

| ID | Area | Scenario | Priority | Automated? | Notes |
|----|------|----------|----------|------------|-------|
| TC-01 | Auth | OTP login with valid own number | P0 | Yes | Precondition for every other test |
| TC-02 | Purchase | Buy monthly pass, sandbox payment success | P0 | Yes | Core funnel |
| TC-03 | Purchase | Sandbox payment failure/decline handling | P0 | Yes | Money path — high severity if broken |
| TC-04 | Auto-renew | Auto-renew toggle default state on purchase | P0 | Yes | Verify against PRD's stated default |
| TC-05 | Auto-renew | Cancel auto-renew before renewal date | P0 | Yes | |
| TC-06 | Auto-renew | Re-enable auto-renew after cancelling | P1 | Maybe | |
| TC-07 | Purchase | Duplicate/double-tap purchase (idempotency) | P0 | Yes | The "double-charges a commuter" case |
| TC-08 | Billing | Pass expiry state / renewal reminder | P1 | Exploratory | Depends on whether staging supports time-travel |
| TC-09 | Edge | Network drop mid-payment | P1 | Exploratory | Hard to automate reliably; note manual repro |
| TC-10 | Auth | OTP resend / expiry / wrong OTP | P2 | Maybe | |

## 4. What actually got automated (fill in after)

List the handful of Playwright specs written, and the one-line reason each earned automation (money path, regression-prone, or spec/reality mismatch found).

## 5. Divergences found (spec vs. reality)

The core deliverable. For each: what the PRD says, what staging actually does, and why it matters.
