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
