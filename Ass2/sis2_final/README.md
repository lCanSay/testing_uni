# Toolshop v5.0: Playwright + TypeScript suite

[![Playwright Tests](https://github.com/lCanSay/testing_uni/actions/workflows/playwright.yml/badge.svg?branch=main)](https://github.com/lCanSay/testing_uni/actions/workflows/playwright.yml)

CI (SIS 3) is described in [Continuous integration](#continuous-integration-sis-3) below.

Five specs against https://practicesoftwaretesting.com: register, login, buy a product, compare products, reset password. Test cases are listed in [Description.md](Description.md).

## Run

```bash
npm install
npx playwright install chromium
npm test                 # all projects, parallel
npx playwright test tests/login.spec.ts
npm run report           # open the HTML report
npm run typecheck
```

Optional env vars: `BASE_URL` (default the public site), `API_URL` (default `https://api.practicesoftwaretesting.com`).

## Layout

```
playwright.config.ts   testIdAttribute 'data-test', 3 projects: setup / anonymous / authenticated
tests/                 one spec per feature + auth.setup.ts
pages/                 page objects with business actions (+ components/AddressForm)
fixtures/              test.extend: page objects, api client, newUser, sessionUser
data/                  user factory (random strong password), expected messages
```

## Decisions

- **Specs contain no locators and never construct page objects.** Page objects come from fixtures; assertions on UI state are `expect*` methods of the page objects.
- **Only `getByTestId` / `getByRole`.** `getByRole('alert')` is used for toasts/messages and `getByRole('row')` for cart rows.
- **Fresh user per test.** Reset password really changes the password and 3 failed logins lock an account, so nothing uses seeded accounts. `newUser` registers a user through `POST /users/register`; the password is random (CSPRNG, upper/lower/digit/symbol), so it cannot be a leaked one.
- **Log in once.** `tests/auth.setup.ts` (project `setup`) creates one more fresh user, logs in through the UI and saves storageState. Only `buy-product.spec.ts` uses it (project `authenticated`); it never changes that account, so it cannot interfere with other tests. Everything that must start anonymous runs in `anonymous`.
- **Independent and parallel.** `fullyParallel: true`; no test depends on another's data. Carts live in each test's own browser context.
- **No sleeps.** Waits are web-first assertions, `expect.poll`, `waitForResponse` (forgot-password) and the "added to cart" toast.
- **Postcode lookup.** Register and checkout can overwrite street/city. `fillStable` re-fills a field until the typed value sticks (`expect(...).toPass`), and postal code / house number are filled before street/city/state. The lookup is tolerated, not synchronised: no assertion depends on street/city values. house_number is always filled (required at checkout).
- **Products come from the API** (`GET /products`), so names are not hard-coded and the catalogue can change.
- **Why each test can fail for the right reason:** register ends with a login using the new credentials; login checks the account title / error text and URL; buy checks name, quantity, line price and the payment message; compare checks both names and both prices in the table; reset checks that the old password stops working (known) and that nothing changes for an unknown email.

## Verified on the live site

The code was written without access to the site. It was then run against https://practicesoftwaretesting.com (footer: `v2.5 | Built 2026-10-11 | Angular 20.0.5`); details in [ai/run_log.md](ai/run_log.md). The assumptions the AI could not check all held, so no locator, text or payload had to change:

- Texts in `data/messages.ts` match the site ("My account", "Invalid email or password", "Payment was successful"). The reset success regex `/successfully/i` matches the site's own translation file; see DEF-01 for why it is not shown.
- `POST /users/register` with the nested `address` object returns 201. The cart is `/checkout`.
- An unknown email on reset gets a 422 and an error alert ("The selected email is invalid."), not a success message.
- The compare selection survives `page.goto` between product pages.
- `cash-on-delivery` is a valid payment method; the full checkout reaches "Thanks for your order ... INV-...".

Result: **8 passed, 1 failed.** The failure is TC-PWD-01, caused by the site defect below. The test is correct and is left red on purpose: changing the expected text to the raw key would make the suite accept the bug.

*SIS 3 update:* a permanently red test makes a CI gate useless (every run is red, so a new failure is invisible). TC-PWD-01 is now marked `test.fail()` with an `issue: DEF-01` annotation. The assertion is unchanged and still fails on every run; Playwright reports it as an *expected* failure. When DEF-01 is fixed, the test "unexpectedly passes", turns the run red, and `test.fail()` must be removed.

Also checked: `--workers=1` (8 passed, 1 failed, the same test), `--repeat-each=2` (15 passed, 2 failed, both TC-PWD-01), and changing "My account" to "My accountX" in `data/messages.ts` makes TC-LOG-01 fail with `Expected: "My accountX" / Received: "My account"` (reverted afterwards).

## Known defect DEF-01

| Field | Value |
|---|---|
| Title | Forgot Password page: success alert shows the text "page.forgot-password.confirm" after requesting a reset for a registered email |
| Environment | https://practicesoftwaretesting.com, footer `v2.5, Built 2026-10-11, Angular 20.0.5`; Chromium (Playwright 1.64.1) on Linux; language EN; 2026-10-23 |
| Preconditions | A registered account (a fresh one created through `POST /users/register`) |
| Steps | 1. Open `/auth/forgot-password`. 2. Enter the email of the registered account. 3. Click "Set New Password". |
| Expected | A confirmation is shown: "Your password is **successfully** updated!" (the text the site defines for this message in `assets/i18n/en.json`) |
| Actual | A green alert with the text `page.forgot-password.confirm` appears under the button and disappears after a few seconds. No readable confirmation is shown. |
| Severity | Low to medium: the reset itself works (the server answers `200 {"success":true}` and the old password stops working), but the user gets no understandable confirmation |
| Priority | Proposal: medium (visible on a core account flow, easy to fix). To be set by the product owner. |
| Evidence | [screenshots/DEF-01_raw_i18n_key_after_reset.png](screenshots/DEF-01_raw_i18n_key_after_reset.png); TC-PWD-01 failure: `getByRole('alert').filter({ hasText: /successfully/i })` not found |
| Caught by | TC-PWD-01 (`tests/reset-password.spec.ts`) |

Note (diagnosis, not part of what the user sees): in the app source (`sprint5/UI/src/app/auth/forgot-password/forgot-password.component.html`, line 36) the template uses the key `page.forgot-password.confirm`, while `en.json` stores the text under `pages.forgot-password.confirm`.

## Not automated

- Account lock-out after 3 wrong logins and its unlock.
- Password policy / field validation messages on register, duplicate email.
- Login of the new password after reset (its value is site-defined).
- Other payment methods (credit card, bank transfer, gift card, buy now pay later), guest checkout, out-of-stock and rental products, discounts and totals of multi-line carts.
- Comparison limits, removing a product from comparison.
- Postcode lookup content itself, cross-browser, mobile, accessibility, performance.

## AI use (Level 1)

- `Prompt.md`: the two prompts used, verbatim, and the tools.
- `ai/run_A_before_raw/`, `ai/run_B_after_raw/`: raw AI output of each prompt, unchanged.
- `Review.md`: what the AI produced, what I changed and why.
- The project in the repo root is run B after my corrections.

## Continuous integration (SIS 3)

Workflow: [`.github/workflows/playwright.yml`](../../.github/workflows/playwright.yml) (repo root; this repo is a monorepo, so every job runs with `working-directory: Ass2/sis2_final`).

| Trigger | What runs |
|---|---|
| every `push`, every `pull_request` (no branch filters) | full suite, 4 shards |
| `workflow_dispatch` | inputs `shards` (`4` / `1`), `base_url`, `api_url` |

Pipeline:

1. **`test`** — matrix of 4 shards (`--shard=i/4`, `fail-fast: false`), Node 22, `setup-node` with npm cache, `npm ci`, `npx playwright install --with-deps chromium`, `npx playwright test --shard=…` (whole suite, no grep). Uploads `blob-report-N` (1 day, intermediate) and `test-results-N` (`test-results/` + `reports/junit.xml`, 14 days) even when tests fail (`if: !cancelled()`).
2. **`merge-reports`** — `needs: [test]`, runs unless cancelled, downloads `blob-report-*` with `merge-multiple: true`, runs `npx playwright merge-reports --config merge.config.ts ./all-blob-reports`. Uploads `playwright-report` (one HTML for all shards) and `junit-report` (`reports/junit-merged.xml`), 14 days.

`concurrency` cancels an older run of the same branch when a new commit arrives.

### CI vs local config

`playwright.config.ts` switches on `process.env.CI` (GitHub sets `CI=true`):

| | Local | CI |
|---|---|---|
| reporters | `list` + `html` | `list` + `blob` + `junit` (`reports/junit.xml`) |
| `forbidOnly` | off | on (a forgotten `test.only` fails the run) |
| `retries` | 0 | 2 |
| `workers` | default | 2 |

Same everywhere: `fullyParallel: true` (otherwise `--shard` splits by file and with 5 spec files some shards idle), `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`, projects `setup` / `anonymous` / `authenticated`, `testIdAttribute: 'data-test'`.

Run the CI mode locally:

```bash
npm ci
CI=true npx playwright test            # -> blob-report/, reports/junit.xml
mkdir -p all-blob-reports
CI=true npx playwright test --shard=1/2 && cp blob-report/*.zip all-blob-reports/
CI=true npx playwright test --shard=2/2 && cp blob-report/*.zip all-blob-reports/
npx playwright merge-reports --config merge.config.ts ./all-blob-reports
```

### Why a fork goes green without secrets

The workflow reads **no** `secrets` or `vars`. Every test creates its own user through the public `POST /users/register` with a random password (see Decisions above), so there are no logins to store. `BASE_URL` / `API_URL` default to production both in the workflow and in code (`playwright.config.ts`, `fixtures/api.ts`). The seeded demo accounts (`customer@practicesoftwaretesting.com` / `welcome01`) are deliberately not used: they are shared by everyone on the internet and can be locked by three wrong passwords. No absolute paths: storage state goes to `.auth/` relative to the project.

### When a test fails: what to open

1. Run summary → job `test shard N/4` that is red → log shows the failing test and the assertion diff.
2. Artefact **`playwright-report`** → unzip, `npx playwright show-report playwright-report`: all shards in one report, error, screenshot, video, and the trace of the first retry.
3. Artefact **`test-results-N`** → raw `trace.zip` (open with `npx playwright show-trace` or trace.playwright.dev), `test-failed-1.png`, `video.webm`, `error-context.md` per attempt, plus `reports/junit.xml`.
4. Artefact **`junit-report`** → `junit-merged.xml` for tools that read JUnit.

Checked locally: breaking the expected title in TC-LOG-01 gives three attempts; `retry1` contains `trace.zip`, every attempt contains screenshot, video and error-context.

Testing the bug-seeded site manually: *Actions → Playwright Tests → Run workflow*, `base_url = https://with-bugs.practicesoftwaretesting.com`, `api_url = https://api-with-bugs.practicesoftwaretesting.com`.

### Sharding: before / after

Median of 3 `workflow_dispatch` runs each. "Run tests step" = duration of the *Run Playwright tests* step; for 4 shards the slowest shard.

| Configuration | Total run time | Run tests step (slowest shard) | Run |
|---|---|---|---|
| 1 shard | TODO | TODO | TODO |
| 4 shards | TODO | TODO | TODO |

Conclusion: TODO (filled in after the measurements).

### What blocks a merge and what only reports, and why

> **DRAFT — proposal by the AI, final position is mine (TODO).**

| Signal | Effect | Why |
|---|---|---|
| any test still failing after 2 retries | **blocks** | the behaviour under test is broken (or the test is) — must be looked at before merge |
| `test.only` left in code | **blocks** (`forbidOnly`) | otherwise CI silently runs one test |
| expected failure (TC-PWD-01 / DEF-01) | reports only | known site defect, documented; it blocks again automatically if it starts passing |
| flaky test (failed, then passed on retry) | reports only | marked *flaky* in the HTML report; must be investigated, but one network hiccup on a public demo site should not block work |
| artefacts, HTML report, JUnit | informational | evidence for diagnosis, not a verdict |
| `merge-reports` job | informational | **it is green even when tests are red** — it only merges whatever blobs exist (`if: !cancelled()`). Using it as the gate would let red PRs through. |

The gate therefore relies on the shard jobs. Branch protection for `main` → *Require status checks to pass*:

- `test shard 1/4`
- `test shard 2/4`
- `test shard 3/4`
- `test shard 4/4`

(Not `merge-reports`.) If the shard count ever changes, these names change too; an alternative is a single `gate` job with `needs: [test]` that fails unless `needs.test.result == 'success'`, then only `gate` is required.

## AI usage (Level 1) — SIS 3

**Tool:** Claude Code (Claude Opus 5.5), in this repository.

**Prompt (short):** add a GitHub Actions CI pipeline to the SIS 2 Playwright suite; phases (analysis → local CI-mode check → GitHub), stop between phases. Requirements: run on every push/PR + manual dispatch; `setup-node` with npm cache, `npm ci`, chromium only, whole suite; HTML report + traces as artefacts (14 days, also on failure); CI branch in config via `process.env.CI` (`forbidOnly`, 2 retries, `list`+`blob`+`junit`); 4 shards + `merge-reports` job; badge; must go green in a fork without secrets; useful artefacts when red; README sections on merge gate and AI usage. Do not replace the SIS 2 config or touch page objects/specs without asking. Full prompt: TODO (paste or summarise here).

**What the AI generated:**
- Phase 0 analysis: found that the suite is red locally (TC-PWD-01 / DEF-01) and that no secrets are needed (users are created via API).
- `.github/workflows/playwright.yml`, `merge.config.ts`, CI branch + `video` in `playwright.config.ts`, `.gitignore` entries.
- `test.fail()` + `DEF-01` annotation on TC-PWD-01 (after my approval).
- These README sections (CI, merge-gate draft, this appendix skeleton).
- Local checks: `CI=true` run (9 passed incl. 1 expected failure), `forbidOnly` (`test.only` → exit 1), 2 shards + merge (4 + 5 tests → 9 in merged JUnit), failure artefacts (trace on retry1).

**My decisions during the session:**
- TC-PWD-01: chose `test.fail()` over `test.fixme` / leaving it red.
- Work directly in `Ass2/sis2_final` instead of a copy in `Ass3/`.
- No fallback to the seeded `customer@…` accounts (unused).

**What I checked myself:** TODO

**What I corrected and why:** TODO

**Final merge-gate position:** TODO
