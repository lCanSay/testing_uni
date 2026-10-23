# Toolshop Playwright suite

## Run
```
npm install
npx playwright install chromium
npx playwright test            # all tests, parallel
npx playwright test tests/login.spec.ts
npx playwright show-report
```
Set `CI=1` to enable retries (2) and traces on first retry.

## Structure
- `pages/` page objects with business actions
- `fixtures/index.ts` the `app` fixture (all page objects), `newUser`, `registeredUser` (created via API)
- `data/userFactory.ts` unique emails and user data
- `tests/` one spec per feature, no locators in specs

## Not verified / not automated
- The suite has not been run. The authoring sandbox could not reach the site, so every `data-test` name marked `// TODO-VERIFY` is from memory and must be checked in the browser.
- No compare feature was confirmed on the site, so TC-04 only compares data from two product pages.
- Unknown-email behaviour of reset password (TC-05b) is an assumption.
- Not automated: the actual reset email and link, real payment providers, form field validation messages, negative registration cases (duplicate email, weak password), cross-browser and mobile layouts.
- `registeredUser` depends on the public API `POST /users/register` payload (TODO-VERIFY).
