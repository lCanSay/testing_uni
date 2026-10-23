# Run log: Playwright suite for practicesoftwaretesting.com

Agent: Claude Code (VS Code extension), Claude Opus 5.5. Prompts C and D in `Prompt.md`.
Date: 2026-10-23. Site build seen in the footer: `v2.5 | Built 2026-10-11 | Angular 20.0.5`.
Environment: Linux, Node v24.14.0, @playwright/test 1.64.1, Chromium only.

Final status: **8 passed, 1 failed.** The failure (TC-PWD-01) is a real site defect, DEF-01. The student
decided to leave it red and document it (option B, no `test.fail`).

## Commands and results

| # | Command | Result |
|---|---------|--------|
| 1 | `node -v` | v24.14.0 (meets the 20+ requirement) |
| 2 | `npm install` | 6 packages added, 0 vulnerabilities |
| 3 | `npx playwright install chromium` | installed (warning: OS not officially supported, ubuntu24.04 fallback build used) |
| 4 | `npx playwright test` | **7 passed, 2 failed** (TC-CMP-01, TC-PWD-01) |
| 5 | `npx playwright test tests/compare-products.spec.ts --repeat-each=3` | 1 passed, 2 failed (TC-CMP-01, failure now at line 16, the *second* product) |
| 6 | `npx playwright test tests/compare-products.spec.ts --repeat-each=4 --trace=on` | **4 passed** (full flow including `compare-link` and price check) |
| 7 | `npx playwright test tests/compare-products.spec.ts --repeat-each=8 --trace=retain-on-failure` | 2 passed, 6 failed. All 6 traces: `net::ERR_NETWORK_CHANGED` |
| 8 | `npx playwright test` (re-run; the `kafdrop` container was no longer on the host) | **8 passed, 1 failed** (TC-PWD-01 only) |
| 9 | `npx playwright test tests/compare-products.spec.ts --repeat-each=8` | **8 passed**. The network flake is gone |
| 10 | `npx playwright test --workers=1` | **8 passed, 1 failed** (TC-PWD-01) |
| 11 | `npx playwright test --repeat-each=2` | **15 passed, 2 failed** (both TC-PWD-01). 17 tests in total: the setup project runs once, the 8 tests run twice |
| 12 | `data/messages.ts`: `'My account'` changed to `'My accountX'`, then `npx playwright test tests/login.spec.ts` | **1 failed, 2 passed**, as intended. See the message below. Reverted; `git diff data/messages.ts` is empty |

Diagnostic scripts were run outside the repo (scratch directory) against the live site and API. They
are not part of the suite. One of them took the evidence screenshot
`screenshots/DEF-01_raw_i18n_key_after_reset.png`.

### Failure message of the negative check (run 12)

```
TC-LOG-01: valid credentials open the account page
Error: expect(locator).toHaveText(expected) failed
Locator:  getByTestId('page-title')
Expected: "My accountX"
Received: "My account"
  22 x locator resolved to <h1 data-test="page-title">My account</h1>
     - unexpected value "My account"
  at pages/AccountPage.ts:7
```

## Changes to the suite

**None.** No file in `pages/`, `data/messages.ts`, `fixtures/api.ts`, `tests/` or the config was changed.
Neither failure was a wrong `data-test` name or a wrong expected text.

| File | Before | After | Why |
|------|--------|-------|-----|
| (none) | | | No change was justified, see the analysis below |

## Changes to the documents (prompt D)

| File | Change |
|------|--------|
| `README.md` | Section "Not verified yet" replaced by "Verified on the live site" (results of this log); defect report DEF-01 added |
| `Description.md` | Status note appended: TC-PWD-01 fails because of DEF-01 |
| `Prompt.md` | Appended "Prompt C" (verbatim) and "Prompt D" |
| `Review.md` | "How I checked" filled from this log; sections "Defect found by the suite" and "Known weakness I kept" appended, the student's reasons left as `[MY REASON]` |
| `screenshots/DEF-01_raw_i18n_key_after_reset.png` | New: the alert with the raw key, taken while it is visible |
| `ai/run_log.md` | This file |

## Failure analysis

### TC-PWD-01: reset for a known email succeeds... SITE DEFECT (left red by the student's decision)

Error message:

```
expect(locator).toBeVisible() failed
Locator: getByRole('alert').filter({ hasText: /successfully/i })
Error: element(s) not found
  at pages/ForgotPasswordPage.ts:20
```

What the site really does (checked in a browser and through the API):

- `POST /users/forgot-password` returns `200 {"success":true}`. The reset itself works: logging in with
  the old password afterwards returns `401`.
- About 0.5 s after submit the page renders
  `<div role="alert" class="alert alert-success mt-3">page.forgot-password.confirm</div>`.
  This is the **raw i18n key**, not translated text. The alert then disappears.
- The site's translation file `/assets/i18n/en.json` has the text under
  `pages.forgot-password.confirm`: "Your password is <strong>successfully</strong> updated!".
  The template (`forgot-password.component.html`, line 36, checked on GitHub) asks for
  `page.forgot-password.confirm`. The top-level key in `en.json` is `pages`, so the lookup fails.

Conclusion: the expectation (`/successfully/i`) matches what the site is supposed to show. Changing
`resetSuccess` to match the raw key would encode the bug, so it was not done. The Playwright failure
screenshot does not show the alert (it has faded by the time the 10 s timeout ends), so a separate
evidence screenshot was taken while the alert was visible.

### TC-CMP-01: two products added to compare... LOCAL ENVIRONMENT (resolved without code changes)

Error message:

```
expect(locator).toBeVisible() failed
Locator: getByTestId('product-name')
Error: element(s) not found
  at pages/ProductPage.ts:8
```

The error looks like a wrong locator, but it is not one:

- On the live product page `product-name`, `unit-price`, `add-to-compare` exist with exactly these
  names. The same test passed in runs 6, 8 and 9, which includes `compare-link`, `comparison-table`
  and `compare-price`.
- Every failed trace contains `page.goto: net::ERR_NETWORK_CHANGED`: Chromium aborted the navigation
  because a network interface on the host changed.
- The Docker container `real-crm-project-kafdrop-1` was in a restart loop (`Restarting (1)`). Each
  restart adds and removes a veth interface on a Docker bridge, which Chromium reports as a network
  change. Once the container was gone, the test passed 8/8 (run 9).

## Oracle review (would each test fail if the feature broke?)

| Test | Fails when | Note |
|------|-----------|------|
| TC-REG-01 | account not created, or user not sent to login | Logs in with the new credentials afterwards |
| TC-LOG-01 | account page not reached | Checks URL and title; proven by run 12 |
| TC-LOG-02/03 | error missing or user gets in | Checks error text and that the URL stays on `/auth/login` |
| TC-BUY-01 | wrong item, quantity, line total, or order not placed | Web-first assertions; goes through "Confirm" to the INV number |
| TC-CMP-01 | product missing from the table, or price differs from the product page | Prices compared with the table on the page |
| TC-PWD-01 | no confirmation, or old password still works | Currently red: caught DEF-01 |
| TC-PWD-02 | no error shown, or success shown | Weakness: "any alert without *successfully*" also accepts the current buggy success alert. Kept as is by the student's decision; noted in `Review.md` |

## Not fixed

1. **TC-PWD-01**: site defect DEF-01 (raw i18n key instead of the confirmation). Left red on purpose
   and documented in `README.md`.
