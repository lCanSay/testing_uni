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

## Not verified yet (written without access to the site)

The sandbox could not reach practicesoftwaretesting.com, so nothing here has been run. On the first run check these, they are isolated in one place each:

- Texts in `data/messages.ts` (login error, reset success regex, payment success, "My account").
- Payload of `POST /users/register` in `fixtures/api.ts` (nested `address` object with `house_number`); and that the cart page is `/checkout`.
- Reset password: that the success message is a `role="alert"` and that an unknown email does NOT produce a success message (if the site answers identically for both, to avoid user enumeration, TC-PWD-02 will fail and should be rewritten).
- Compare: the selection must survive `page.goto` between two product pages (it is assumed to be stored in browser storage). If it is in memory only, navigate through the product list instead.
- Payment method value `cash-on-delivery`, and that `country` on checkout is a select or input (both handled).

## Not automated

- Account lock-out after 3 wrong logins and its unlock.
- Password policy / field validation messages on register, duplicate email.
- Login of the new password after reset (its value is site-defined).
- Other payment methods (credit card, bank transfer, gift card, buy now pay later), guest checkout, out-of-stock and rental products, discounts and totals of multi-line carts.
- Comparison limits, removing a product from comparison.
- Postcode lookup content itself, cross-browser, mobile, accessibility, performance.
