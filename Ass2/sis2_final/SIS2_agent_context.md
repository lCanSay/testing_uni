# Context for the agent: SIS 2 (Playwright, Toolshop)

You are reviewing and finishing a university assignment. Your job is not only to make tests green but to judge whether each test proves the right thing. A green test that asserts the wrong thing is worse than a red one. Talk to the student; code and repo documents in English. No long dashes (— or –) in documents.

## 1. The assignment

Course: Software Testing and Debugging (KBTU, master's). SIS 2, deadline today.
Build a Playwright suite (any language, here TypeScript) for https://practicesoftwaretesting.com (Toolshop v5.0, Angular over a REST API). Public GitHub repo with:

1. At least 5 automated test cases (below).
2. `Description.md`: what we automate, list of test cases.
3. `Prompt.md`: exactly the prompts used with AI tools, with the exact tool/model.
4. `Review.md`: what the AI produced, how the student reviewed and changed it, why.
5. Screenshots: AI responses, run results.
6. Link to the public repo (student submits via a form).

### The five tests (from the lecture brief)

| # | Test | What it must prove |
|---|---|---|
| 1 | Register a new customer | A unique new account is created and the user ends up signed in or on the login page |
| 2 | Log in | Valid credentials reach the account page; invalid ones show the error and do not |
| 3 | Buy a product | Add to cart, cart shows the right item and quantity, checkout completes |
| 4 | Compare two products | Open two products, capture name and price, assert the comparison you state |
| 5 | Reset a password | Expected confirmation for a known email, an error for an invalid one |

Each test is independent and creates its own data. No test may depend on another.

### Grading (lecturer)

- IT RUNS: clean clone, `npm install`, `npx playwright test` goes green on another machine. If it cannot run, zero.
- IT IS STRUCTURED: page objects used by specs, no locator anywhere in a spec file, at least one fixture, unique data per run.
- IT ASSERTS: every test has an assertion that could fail. No meaningful assertion = nothing.
- README (each decision explained), Prompt.md, Review.md with the student's corrections carry real marks.

### Hard rules (cost marks)

- No `waitForTimeout` anywhere.
- No CSS classes, no positional XPath. Only `getByTestId` / `getByRole` (prefer `filter()` over `nth()`).
- Pass in any order and in parallel.
- Course settings: `testIdAttribute: 'data-test'`, `trace: 'on-first-retry'`, `retries: CI ? 2 : 0`, log in once with storageState.

## 2. Facts about the site (verified in the app source, github.com/testsmith-io/practice-software-testing, folder sprint5 = live site)

- Reset password REALLY changes the password on the server. 3 wrong logins lock an account. So the seeded accounts (customer@practicesoftwaretesting.com etc.) must never be used for these tests: other students use them too. Every test creates its own user via `POST https://api.practicesoftwaretesting.com/users/register`.
- Registration rejects weak and breached passwords: the factory generates random ones.
- The site now has a real comparison page (`/comparison`). The lecture slides say it has none; the site changed.
- Checkout payment: the first click on `finish` is "Check payment" (shows "Payment was successful"); the order is placed only by the second click "Confirm" ("Thanks for your order! Your invoice number is INV-...").
- Register and checkout run a postcode lookup that can overwrite street/city; house_number is required at checkout.
- The forgot-password success and error messages are `role="alert"` without data-test, and the success alert fades out after about 3 s.
- The buggy build `with-bugs.practicesoftwaretesting.com` is older: different register field names, no comparison page. Red there can mean locator drift, not a caught bug.

## 3. Current state of the repo

- Code in the repo root = AI run B (Claude Sonnet 5.5) after 5 student corrections listed in `Review.md`.
- `ai/run_A_before_raw/`, `ai/run_B_after_raw/`: raw AI output, must stay unchanged.
- `ai/run_log.md`: log of the run-and-fix agent (Prompt C).
- Last run: 8 passed, 1 failed (TC-PWD-01). TC-CMP-01 failures earlier were a local network problem (ERR_NETWORK_CHANGED), gone after a local Docker container was removed; 8/8 on repeats.

### Known finding: TC-PWD-01 fails because of a real site defect

After a successful reset the page shows the raw translation key `page.forgot-password.confirm` instead of "Your password is successfully updated!".
Cause, confirmed in source: `sprint5/UI/src/app/auth/forgot-password/forgot-password.component.html` line 36 uses the key `page.forgot-password.confirm`, but `assets/i18n/en.json` stores it under `pages.forgot-password.confirm` (missing "s"). The reset itself works (the old password stops working).

The test is correct: it caught a defect. Do NOT change the expected text to the raw key and do NOT weaken the assertion.

Student's decision needed (ask, do not choose yourself):
- A. Mark it as a known failure: `test.fail(true, 'Known defect DEF-01: raw i18n key shown after reset, see README')` at the top of that test. The suite goes green, the assertion stays, and if the site is fixed the test turns red and tells us to remove the mark. Recommended: the grader needs green.
- B. Leave it red and explain in README.

Either way: write a defect report in README (title, environment, steps, expected, actual, severity, priority, evidence) in the week 4 format: Title formula "[Where]: [what happens] [under what condition]", actual = what the user sees, not a diagnosis; severity low-medium (cosmetic text, function works), priority set by the product owner (propose, mark as proposal).

## 4. How to judge each test (the oracle)

For every test check: would it FAIL if the feature broke? Name the broken behaviour it catches.

| Test | Must fail when | Red flags |
|---|---|---|
| Register | account not created, or user not sent to login | Only checks URL; does not log in with the new account |
| Login valid | account page not reached | Asserts only "no error" |
| Login invalid | error missing OR user gets in | Asserts only error, not that URL stays on login |
| Buy | wrong item, wrong quantity, wrong line total, order not placed | Stops after "Check payment"; reads values with textContent() once instead of web-first assertions |
| Compare | product missing from the table, price differs from the product page | Compares two numbers in the test without using the page |
| Reset known | no confirmation; old password still works | Regex so loose any text matches |
| Reset unknown | no error shown; success shown | Only checks "no success" (an empty page passes) |

Proof that assertions assert: change one expected value on purpose (e.g. "My account" to "My accountX" in `data/messages.ts`), run, see it fail with a readable message, revert. Optional: run against the buggy build and classify each red result.

## 5. What you may and may not change

May: locators in `pages/`, texts in `data/messages.ts`, API payload in `fixtures/api.ts`, README, Description.md (keep it in sync with the code), `ai/run_log.md`.
Ask first: anything in `tests/`, `playwright.config.ts`, adding `test.fail`.
Never: `waitForTimeout`, CSS/XPath, `.nth()`, locators in specs, `test.skip`/`fixme`, deleting or weakening assertions, seeded accounts, editing `ai/run_*_raw/`, commit or push.
`Prompt.md` and `Review.md`: only append, and never invent the student's reasons. Where a reason is the student's, write `[MY REASON]`.

## 6. Remaining to-do

1. Student decision on TC-PWD-01 (A or B), then the defect report in README.
2. Step 5 checks: `--workers=1`, `--repeat-each=2`, the "My accountX" check. Can run now; TC-PWD-01 is a known exception.
3. Append "Prompt C: running and fixing" (the run prompt, agent and model) to `Prompt.md`, and a section for this agent's prompt too.
4. Fill "How I checked" in `Review.md` from `ai/run_log.md` and add the defect finding.
5. Remind the student about screenshots and that `.gitignore` excludes node_modules, .auth, test-results, playwright-report before pushing.
