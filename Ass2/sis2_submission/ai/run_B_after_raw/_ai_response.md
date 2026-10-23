I wrote the Playwright + TypeScript suite in `/home/claude/runs/B`, but none of it has been run. The sandbox can't reach practicesoftwaretesting.com, and I didn't run `npm install` or the tests, as instructed.

**What's there**
- **Specs:** one spec per feature in `tests/`: register, login (valid, wrong password, unknown email), buy a product, compare two products, and reset password (known and unknown email).
- **Structure:** `pages/` holds the page objects, `fixtures/` the fixtures and API client, and `data/` the user factory and expected messages. `playwright.config.ts` sets `testIdAttribute: 'data-test'`. `Description.md` has the test case table and `README.md` covers how to run, decisions and what isn't automated.
- **Specs stay clean:** they contain no locators and never create page objects. Page objects come from fixtures, and UI checks are `expect*` methods on the page objects. Only `getByTestId` and `getByRole` are used, and there are no `waitForTimeout` calls.
- **Fresh users:** each test gets its own user from `POST /users/register`, with a random strong password. No seeded accounts are used.
- **Log in once:** `tests/auth.setup.ts` creates one more fresh user, logs in through the UI and saves storageState. Only the buy spec uses it, in the `authenticated` project. The other specs run in the `anonymous` project, so register, login and reset password don't share that user.
- **Postcode lookup:** street, city and state are filled after postal code and house number, and each field is re-filled until the value sticks. Nothing asserts on street or city values.
- **Assertions that can fail:**
  - Register ends with a login using the new credentials.
  - Buy checks the cart contains only that product, the quantity is 3, the line price equals unit price times 3, and the payment success message appears.
  - Compare checks both names and both prices in the table.
  - Reset for a known email checks that the old password no longer logs in.
  - Reset for an unknown email checks that no success alert appears and that a control user can still log in.

**Needs checking on the first run**

I had to guess several things, and each guess sits in one place:
- **Message texts:** the login error, reset success, payment success and "My account" wording are guesses in `data/messages.ts`.
- **Register payload:** the shape of the `POST /users/register` body (a nested `address` with `house_number`) is in `fixtures/api.ts`. The cart is assumed to be at `/checkout` and the payment method value `cash-on-delivery`.
- **Reset alert:** I assumed the reset message is a `role="alert"`. If the site answers the same for known and unknown emails, TC-PWD-02 will fail and needs rewriting.
- **Compare state:** the selection has to survive `page.goto` between the two product pages. If it is kept only in memory, navigation has to go through the product list instead.

**Not automated:** lock-out after 3 wrong logins, field validation and duplicate email, logging in with the new password after a reset, other payment methods and guest checkout, comparison limits, and cross-browser, accessibility and mobile.
