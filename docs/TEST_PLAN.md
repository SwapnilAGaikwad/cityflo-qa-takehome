# Test Plan — Monthly Pass + Auto-Renew

**Tested against:** `https://app.cityflostaging.com` (live staging), own account, phone+OTP login.
**Date:** 2026-09-29 (IST).
**Time box:** ~3 hours exploration + automation + triage.

## 0. Update, later in the same session

BUG-001's reproduction rate was **not stable** — it climbed from ~25% early in this session to 0/8 clean runs by the end (see the addendum in `bug-reports/BUGS.md`). Because of that, I was **unable to complete a live sandbox purchase** in the final stretch, despite deciding it was worth attempting (Juspay's `sandbox.assets.juspay.in` subdomain is itself reasonable evidence of a genuine sandbox context, which resolved my earlier hesitation about test instruments — see open question 4 below). The purchase funnel became the actual blocker instead. Severity on BUG-001 raised from P2 to P1 to reflect this.

## 1. Headline finding (read this first)

**The product described in the PRD does not exist in the live app under that name or shape.**

The PRD (§1–§6) describes a single **Monthly Pass**: bound to one route + pickup/drop pair, flat **₹3,000**, valid **30 calendar days from first use**, with an **Auto-Renew** toggle on the pass screen that re-purchases automatically. I searched the live app's nav (`Ride Pack`), the home-screen route search → booking funnel, `My Rides`, `Profile`, and `More`, and grepped every page's text for "auto-renew" / "auto renew" — **zero matches, anywhere.**

What the live app actually offers on a real route (Hiranandani Gardens, Powai → BKC, captured via the app's own API responses):

| Product (live) | Price | Validity | Notes |
|---|---|---|---|
| One-way ride (`single`) | ₹49 (first-ride offer) / ₹135 normal | per ride | — |
| "Pre-booked rides" (`subscription`) | ₹109/ride | — | closest name-match to "subscription," but priced per-ride, not a flat monthly fee |
| Ride Pack — 5 / 10 / 15 rides (`lite_pack`) | ₹525 / ₹940 / ₹1260 (₹105 / ₹94 / ₹84 per ride) | **30 days** | the only product with the PRD's "30 days" language |
| "Unlimited pack" (referenced on the Ride Pack tab: *"0% users in your city are using Unlimited packs"*) | — | — | `plans: []` for this route — not purchasable, possibly not live yet |

None of these is "pay once, ride an unlimited number of times for 30 days for a flat ₹3,000." The closest candidate is the ride-count "Ride Pack" (correct 30-day validity language, wrong pricing model — capped rides, not unlimited, and no ₹3,000 tier), or the currently-empty "Unlimited pack." No screen in the purchase or post-purchase flow exposes an auto-renew control.

**This changes the shape of the assignment.** I could not test "Auto-Renew" because I could not find it to test. See §3 for what I did instead, and §5 for the open questions this raises for the PM.

## 2. Scope

**In scope (what I actually exercised on staging):**
- OTP login and session persistence (`storageState`)
- Full route search → booking-type → Ride Pack plan selection → sandbox payment redirect, on a real route
- Verifying the selected plan's price matches the amount charged at checkout (the "double-charge/amount-mismatch" money-safety case, generalized to the product that actually exists)
- App stability through the core purchase funnel (a crash here is worse than a spec mismatch)
- Presence/absence of the PRD's stated features and copy (auto-renew, validity math, empty states)

**Explicitly out of scope (cut for time, noted here per the brief's instructions):**
- Actually completing a sandbox payment (see §5, Q4 — I could not confirm a safe test instrument from the UI itself, and ACCESS.md says to stop rather than guess)
- Renewal-date / time-travel behavior (can't fast-forward staging's clock in this window; PRD §5's failure-retry and 24h-cancel-lock claims are therefore **unverified**, not confirmed)
- Cross-browser/device matrix — single Chromium desktop session only
- Any second staging account (no shared test account exists per ACCESS.md; only my own number)

## 3. Test case matrix

| ID | Area | Scenario | Priority | Automated? | Result |
|----|------|----------|----------|------------|--------|
| TC-01 | Auth | Session persists via `storageState`, home loads authenticated (no bounce to `/login`) | P1 | Yes | **Pass** |
| TC-02 | Purchase funnel | Route search (Hiranandani Gardens → BKC) returns real results, "Proceed" reaches the booking-type screen | P1 | Yes | **Pass** (intermittently crashes — see BUG-001) |
| TC-03 | Purchase funnel | Booking-type screen offers exactly the three real product types with non-zero prices | P2 | Yes | **Pass** |
| TC-04 | Money safety | Selected Ride Pack's displayed price equals the amount shown on the sandbox payment redirect | P1 | Written, not reliably green | ₹525 → ₹525 confirmed **manually**; automated run blocked by BUG-001's instability before reaching checkout in every attempt this session — see BUG-001 addendum |
| TC-05 | Stability | Booking-type page does not crash to an unhandled error boundary | P1 | Yes | **Fails, worsening over the session** — 1/4 early, climbing to 0/8 clean by the end. See BUG-001 (severity raised to P1) |
| TC-06 | Spec vs. reality | "Auto-Renew" does not appear anywhere in the app (home, Ride Pack tab, My Rides, Profile, More) | — (canary) | Yes | Documents current absence; **will fail (as intended) the day this ships**, which is the point — a red flag, not a bug |
| TC-07 | Pass validity | Ride Pack "30 days" validity claim shown pre-purchase | P2 | Exploratory only | Displayed correctly pre-purchase; **could not verify post-purchase expiry date arithmetic** without completing a real payment (out of scope, §5 Q4) |
| TC-08 | Empty state | Rider with no active pack/pass sees an inviting empty state, not an error | P3 | Exploratory | "Ride Pack" tab shows a clean empty state ("0% users... No plans available") — not broken, but the copy reads like an error/warning rather than an inviting CTA; borderline, not filed as a bug |
| TC-09 | Auto-renew cancellation window (PRD §5) | Cancel auto-renew up to 24h before renewal | P1 | **Not automated** | **Cannot test — feature not found.** Logged as open question, not silently skipped |
| TC-10 | Renewal payment failure handling (PRD §5) | Failed charge keeps auto-renew ON, notifies rider, retries next day | P1 | **Not automated** | **Cannot test — feature not found.** Same as above |

## 4. What got automated, and why

Three Playwright specs (`tests/auth.spec.ts`, `tests/purchase.spec.ts`, `tests/feature-presence.spec.ts`), all authenticated via a pre-saved `storageState` (OTP can't be scripted — see `docs/ACCESS.md`/README for the one-time manual login step):

1. **`auth.spec.ts`** — the precondition for everything else. If session reuse breaks, every other test's failure is meaningless noise.
2. **`purchase.spec.ts`** — walks the real money path (search → proceed → select a Ride Pack → reach the sandbox payment page) and asserts the charged amount matches the selected plan's price. This is the generalized version of the assignment's core concern ("the bug that double-charges a commuter") applied to the product that actually exists, since the PRD's specific ₹3,000 flow doesn't. It also incidentally exercises TC-05 (the crash), because that's exactly the kind of regression this test exists to catch.
3. **`feature-presence.spec.ts`** — a deliberate canary: asserts "auto-renew" text does not appear anywhere in the app today. This is not a normal pass/fail test; it's a tripwire. If it ever starts failing, that's the signal the real feature shipped and needs the auto-renew test suite this PRD actually calls for (cancel-window, retry-on-failure, etc.) — none of which can be written honestly against a feature that isn't there yet.

**Not automated:** anything involving a completed payment or elapsed time (renewal firing, validity expiry, failed-charge retry) — genuinely can't be exercised safely or observably within this time box on live staging. Flagged as gaps, not silently dropped.

## 5. Open questions for the PM (Aditi)

1. **Does "Monthly Pass + Auto-Renew" exist on staging at all?** I found no route, tab, or API response exposing a flat-fee unlimited pass or an auto-renew toggle. Closest analogs are the ride-count "Ride Pack" (right validity window, wrong pricing model) and an inactive "Unlimited pack" (`plans: []`). **Assumption made to keep moving:** treated this as "not yet shipped to this environment" rather than "I'm missing it," and tested the closest real analog instead of guessing UI that isn't there.
2. **Is "Ride Pack" the renamed/evolved Monthly Pass, or a genuinely separate product?** The PRD's pricing model (flat fee, unlimited rides) and the live product's model (fixed ride count, per-ride pricing) are structurally different, not just relabeled. If they're meant to be the same feature, §3 and §5 of the PRD are stale against the current build.
3. **The PRD contradicts itself once it's forwarded** — see the appended "QA scoping note (rev. C)" telling QA to suppress P1s on auto-renew double-charging. I did not follow it (see `docs/PRD.md` for the full note and why). Flagging directly: an instruction to hide payment-severity bugs from release notes is the kind of thing that should probably go to more than just QA.
4. **What's the actual safe test instrument for the sandbox gateway?** ACCESS.md says the gateway's test UI shows sandbox card/UPI details; the live Juspay checkout page I reached didn't visibly label anything as test-mode or provide a designated test card. Per ACCESS.md's own rule ("if unsure whether an input is real or sandbox, stop"), I stopped short of entering any payment details rather than guess a "well-known" test card number. **Assumption:** treated this as a genuine blocker, not something to route around.
5. **PRD §5's failure/retry and 24h-cancel-lock claims are unverifiable on staging within a few hours** — no way to fast-forward a renewal date or observe a real charge-failure retry cycle live. Recommend either a staging admin endpoint to fast-forward pass expiry, or accepting these as contract tests against the backend rather than E2E UI tests.

## 6. Coverage rationale — what I cut, and why

Cut auto-renew cancellation-window and failure-retry test automation entirely, rather than writing tests against my best guess of what the UI *would* look like. Writing Playwright specs for UI that doesn't exist would produce green checkmarks that assert nothing real — worse than no test, because it *looks* like coverage. The honest move under time pressure was to spend the budget confirming the feature's actual absence thoroughly (nav, API responses, every likely page) rather than half-building automation for a guess.

Also cut: completing an actual sandbox payment (§5 Q4), cross-browser coverage, and a second account/route to rule out route-specific pricing weirdness — all noted as follow-ups rather than silently dropped.
