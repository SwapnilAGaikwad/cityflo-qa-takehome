# QA Engineer — Take-home: own the quality of "Monthly Pass + Auto-Renew" on staging

## Read this first

This is under-specified on purpose. You're getting a short PRD and a **live app** the way a real ticket lands the week of a ship: written by a tired PM, built in a hurry, going out Friday. The PRD won't answer every question. The app won't match the PRD in places. Some of those mismatches are bugs in the app. A few are the PRD being wrong or contradicting itself. A few are genuinely ambiguous, and the right move is to write down the call you made and ask the question — not to guess silently and move on.

We are not testing whether you can grind out 200 test cases. We're testing **judgment**: do you find the issues that actually cost a commuter their seat or cost Cityflo money, do you verify the live app against the spec instead of trusting the PRD or your AI, and do you know the difference between "the app is broken" and "the spec never said." A tight test plan plus three sharp, well-triaged bug reports beats a sprawling matrix that misses the one thing that double-charges a rider.

Use your coding agent throughout — drafting the scenario matrix, scaffolding Playwright, triaging failures. That's the job, not a workaround. We grade the result **and** the trajectory (your session log).

You do **not** need to fix anything. You're QA here, not the implementer. Verify it, prove it, report it.

## The situation

Cityflo sells monthly passes for its premium Mumbai commuter buses. A rider buys a pass for a route and a pickup/drop pair — say the **Powai → BKC** line, boarding at **Hiranandani Gardens** — and it covers their daily rides for the validity window. **Auto-Renew** keeps their seat by re-purchasing before the pass lapses. Payments run on Indian rails (UPI / cards). A lapsed pass means a commuter shows up at 8am with no seat. A wrongly-charged pass is a support fire and, at our daily ridership, a trust and revenue problem. This is **recurring money** — the part of the product we are most paranoid about.

You're picking up **"Monthly Pass purchase + Auto-Renew"** for QA. The system under test is **Cityflo's real staging rider web app** — the live React SPA at `https://app.cityflostaging.com`. It is shared, live, and pointed at our staging backend. This landed in your queue from the feature's PM along with a forwarded note (it's at the top of `PRD.md`). Read it the way you'd read anything that shows up the week of a ship — with your eyes open. The PRD is **intent**. The app is **behaviour**. When they disagree, that's the job.

## A word on the environment (read `ACCESS.md` in full)

- You log in with **your own phone number and the real OTP** you receive. There is **no shared test account**.
- Staging payments are **sandboxed and free** — the backend never charges a real card. So the **full purchase → payment → auto-renew funnel is safe to exercise end to end**, and you should. But **never enter real card details**, use **only your own account**, and **test respectfully** — no load, stress, fuzzing, or destructive runs against a shared environment.
- Because staging is a **live shared environment we do not control, there are no planted bugs** here. Nothing has been seeded for you to "find." The signal is whether you **verify the live app against the PRD** and discover where reality and the spec actually diverge — missing states, silent failures, claims the app doesn't honour — rather than trusting the PRD or your AI's assumptions.
- Login is phone + OTP. The expected pattern is to **log in once manually, persist the Playwright `storageState`, and automate against that session.** Figuring out how to get past the OTP wall cleanly — and noting it as an assumption — is itself part of what we're looking at. `ACCESS.md` has the recommended setup.

## Your task

Drive your agent to do three things. Scope them yourself. If you run low on time, cut deliberately and tell us what you cut and why — that cut is part of the answer.

1. **Derive a test plan / scenario matrix from the PRD.** Cover the happy paths, the edge cases, and — the part most people skip — the places where the PRD is **silent or contradicts itself**. Surface those gaps as explicit questions for the PM, each with the provisional assumption you made to keep moving. We read the questions as closely as the cases. The PRD makes several confident claims; treat each as a hypothesis to check against the live app, not a fact.

2. **Automate the handful of cases that actually matter.** Write automated tests — **Playwright preferred** (justify any other choice in one line) — for the high-value scenarios: money, pass validity, renewal. Do **not** try to automate everything. Three or four tests that pin the cases where a regression would actually hurt are worth more than thirty shallow ones. Say why you picked the ones you picked. Note how you handled the OTP wall.

3. **Run them against staging, triage failures, and file bug reports.** Run your suite, then actually use the app yourself — a green assertion is not the same as correct. Confirm each finding is real before you file it. For each real bug: a clear title, exact repro steps, expected vs actual, a **severity with a one-line rationale**, and evidence (screenshot, console, the network request/response, a Playwright trace). Severity is a judgment call and we will weigh it. Argue it. Use the `bug-report-template.md` in the bundle.

## Deliverable

Submit via `submit_assignment("qa-engineer", { deliverable_url, session_log_key, notes })`:

- **`deliverable_url`** — a repo or gist containing: your test plan / scenario matrix, your automated tests (runnable, with a one-line run command and a note on how the OTP session is handled), and your bug reports (`BUGS.md`, or your tracker's export — markdown is fine).
- **`session_log_key`** — the full transcript of your agent session(s). Not a summary. The trajectory is graded. Export the raw session file, upload it via `get_session_log_upload_url("qa-engineer")` (HTTP PUT), and pass the returned key here.
- **`notes`** — your written reflection, including the three sections below.

In `notes`:

- **Coverage rationale (short).** What you prioritised, and — more important — what you deliberately did **not** test, and why that was the right cut for a 2–4 hour box.
- **Open questions for the PM.** The gaps, contradictions, and unverifiable-on-staging claims you found, each with the assumption you made to keep moving. If something in the PRD or the forwarded note struck you as wrong to act on, say so here.
- **"Where I disagreed with the AI" (required — 3 to 5 concrete examples).** Where your agent was wrong and what you did instead. Be specific. Vague answers — "I used my judgment throughout" — are a **negative signal**. Be concrete or leave it out.

## Last note on scope

2–4 focused hours. Past that, you're overbuilding — stop, write down what you'd do next, and submit. Tell us what you cut, and why. That decision is part of what we're grading.
