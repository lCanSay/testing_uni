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
