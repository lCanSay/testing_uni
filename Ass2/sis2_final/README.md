# Toolshop v5.0: Playwright + TypeScript suite

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
