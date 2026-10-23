# Prompts

## Tools

- Claude Opus 5.5 (claude.ai, Project "Software Testing" with the course notes): used to analyse the assignment and the site and to write the two prompts below.
- Claude Sonnet 5.5 (run as a separate agent from the same claude.ai session, no access to the course notes or to the Opus work): received each prompt below and wrote the code.
- Harness note added before each prompt, not part of the prompt: output folder, do not run npm install, the sandbox cannot reach the site.

Neither model could open practicesoftwaretesting.com from its sandbox, so no AI output was run by the AI.

## Prompt A: written before knowing how the site works

Raw output: `ai/run_A_before_raw/`

```text
Write a Playwright + TypeScript test suite for https://practicesoftwaretesting.com (Toolshop demo shop).

Five tests, one spec file each:
1. Register a new customer: unique account, user ends signed in or on the login page.
2. Log in: valid credentials reach the account page; invalid ones show an error and do not.
3. Buy a product: add to cart, cart shows the right item and quantity, checkout completes.
4. Compare two products: open two products, capture name and price, assert the comparison.
5. Reset password: confirmation for a known email, error for an unknown one.

Rules:
- Page objects in pages/ (business actions, not element getters), a fixture in fixtures/ so specs never create page objects, a data factory in data/ for unique emails. No locator in spec files.
- playwright.config.ts: baseURL, testIdAttribute 'data-test', trace on-first-retry, retries only in CI.
- Locators: getByTestId / getByRole / getByLabel only. No CSS classes, no XPath, no waitForTimeout.
- Every test has an assertion that would fail if the feature broke. Tests are independent and pass in parallel.
- Use the real data-test names from the site. If you cannot verify one, mark it // TODO-VERIFY instead of guessing.

Also write Description.md with a table of test cases (ID, title, preconditions, steps, expected result) and a short README (how to run, what is not automated).
```

## Prompt B: written after studying the site (DevTools, app source on GitHub)

Raw output: `ai/run_B_after_raw/` (this is the version I continued with)

```text
Write a Playwright + TypeScript test suite for https://practicesoftwaretesting.com (Toolshop v5.0). Folder layout: tests/, pages/, fixtures/, data/, playwright.config.ts, Description.md, README.md.

Five tests, one spec each: register, login (valid + invalid), buy a product (cart item and quantity, checkout completes), compare two products, reset password (known + unknown email).

What I already know about the site, use it:
- data-test names: login email/password/login-submit/login-error; register first-name, last-name, dob (YYYY-MM-DD), country (select), postal_code, house_number, street, city, state, phone, email, password, register-submit; forgot-password email/forgot-password-submit; product page product-name, unit-price, quantity, add-to-cart, add-to-compare, compare-link; cart product-title, product-quantity, line-price, proceed-1; checkout proceed-2, proceed-3, payment-method, finish, payment-success-message; account page-title.
- The site now has a real comparison page (/comparison, comparison-table, compare-price). Test it.
- Reset password really changes the password, and 3 wrong logins lock an account. So never use the seeded accounts for these tests: create a fresh user per test via POST https://api.practicesoftwaretesting.com/users/register.
- Passwords must be strong and not leaked: generate a random one.
- Register and checkout run a postcode lookup that can overwrite street/city; house_number is required at checkout.

Rules: page objects with business actions, a fixture so specs never create page objects, data factory, no locator in specs, testIdAttribute 'data-test', getByTestId/getByRole only, no waitForTimeout, log in once with storageState, every test asserts something that fails if the feature breaks, tests independent and parallel.

Also write Description.md (test case table: ID, title, preconditions, steps, expected result) and a README (how to run, decisions, what is not automated).
```

## Prompt C: running and fixing

Tool: Claude Code (VS Code extension) with Claude Opus 5.5 (`claude-opus-5-5`), working in the project folder with a terminal, so this agent could run the suite against the live site. Log of what it ran and found: `ai/run_log.md`.

```text
You are working in this folder: a Playwright + TypeScript test suite for https://practicesoftwaretesting.com (university assignment). Run it, make it green, and log everything. Talk to me in Russian.

Steps:
1. Check `node -v` (need 20+). Run `npm install` and `npx playwright install chromium`.
2. Run `npx playwright test`. Show me the summary.
3. For every failing test, read the error message first and classify it:
   - Timeout waiting for a locator: the data-test name is wrong. Open the page with `npx playwright codegen` or inspect the live site and find the real name.
   - Assertion mismatch: compare with what the site really shows. Decide whether the expected text is wrong or whether this is a real bug on the site. If it looks like a site bug, STOP and tell me. Do not change the test to make it pass.
4. Fix only in these places: locators in `pages/`, expected texts in `data/messages.ts`, API payload in `fixtures/api.ts`. Re-run after each fix.
5. When everything is green, also run:
   - `npx playwright test --workers=1`
   - `npx playwright test --repeat-each=2`
   - In `data/messages.ts`, temporarily change "My account" to "My accountX", run `npx playwright test tests/login.spec.ts`, confirm it FAILS, show me the message, then revert.

Hard rules (assignment grading):
- Never add `waitForTimeout`, CSS class selectors, XPath or `.nth()`. Only getByTestId / getByRole.
- Never put a locator in a spec file.
- Never delete, skip or weaken an assertion to make a test pass. Never add `test.skip` or `.fixme`.
- Never use the seeded accounts (customer@practicesoftwaretesting.com etc.).
- Do not touch the `ai/` folder, `Prompt.md` or `Review.md`.
- Do not commit or push anything.

At the end, create `ai/run_log.md` with:
- the commands you ran and the final result of each (passed / failed counts);
- a table of every change: file, before, after, why (what the error message said);
- anything you could not fix and why.
Then give me a short summary in Russian.
```
