I wrote the Playwright + TypeScript suite in /home/claude/runs/A, but it has not been run. The sandbox could not reach the site and you told me not to install or run anything. Most selectors are from memory, so expect to fix some on the first run.

What is there:
- Five spec files in `tests/` (register, login, checkout, compare, resetPassword). Login and reset password each have two cases, so there are 7 test cases in total.
- Page objects in `pages/` with business actions only, an `app` fixture in `fixtures/index.ts`, and a unique-email factory in `data/`. The spec files contain no locators.
- `playwright.config.ts` with the baseURL, `testIdAttribute: 'data-test'`, trace on first retry, and retries only when `CI` is set.
- `Description.md` with the test-case table, and `README.md` with how to run and what is not automated.

Things to know:
- I could not verify the `data-test` names. Every one I was unsure of is marked `// TODO-VERIFY`, and that is most of them. That includes the payment fields, the reset-password messages and `login-error`.
- The login, checkout and reset-password tests create their user through the site's API (`POST /users/register`) so they stay independent. That payload is also unverified.
- I could not confirm that the site has a product compare feature. Test 4 opens two products, captures name and price, and asserts they differ and both prices are positive. If the site does have a compare page, that test needs a real compare action.
- TC-05b (unknown email shows an error) may fail if the site gives the same answer for every email.
- Registration is checked by redirecting to the login page and then logging in with the new account.
