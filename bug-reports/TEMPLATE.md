# Bug report template

Copy this block once per bug into `BUGS.md`.

---

## [BUG-001] <one-line title: what's wrong, where>

- **Severity:** P1 / P2 / P3 / P4
- **Severity rationale:** _one line — why this severity. Tie it to user/revenue impact, not just "it's broken."_
- **Area / feature:** _e.g. Auto-renew, Pass validity, Purchase, Empty state, Login_
- **Environment:** staging — `https://app.cityflostaging.com` · browser + version · date/time tested (IST) · your test account (your own number, masked)
- **PRD reference:** _which PRD section/claim this contradicts, if any. If the PRD is silent on this, say so._

### Steps to reproduce
1.
2.
3.

### Expected
_What the PRD says should happen (quote or cite it), or what a reasonable rider would expect._

### Actual
_What the app actually does. Be specific and observable._

### Evidence
_Screenshot, console output, the network request/response that proves it, or your Playwright trace._

### Notes (optional)
_Reproducibility (always / intermittent), suspected scope, workaround, app bug vs. spec gap._

---

> **Severity guide:**
> - **P1** — money is wrong (charged twice / charged when they shouldn't be), or a paying rider silently loses access. Blocks release.
> - **P2** — a core promise of the feature is broken/wrong (e.g. validity window off, a documented failure path not handled), no direct money loss.
> - **P3** — degraded experience, missing state, or accessibility gap; rider can still get the core job done.
> - **P4** — cosmetic / copy / polish.
