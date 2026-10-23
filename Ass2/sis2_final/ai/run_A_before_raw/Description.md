# Test cases: Toolshop (https://practicesoftwaretesting.com)

| ID | Title | Preconditions | Steps | Expected result |
|----|-------|---------------|-------|-----------------|
| TC-01 | Register a new customer | None. A unique email is generated per run. | 1. Open /auth/register. 2. Fill all required fields with valid data. 3. Submit. 4. Log in with the new credentials. | After submit the user lands on the login page. Login with the new credentials opens the account page. |
| TC-02a | Login with valid credentials | A customer exists (created through the API before the test). | 1. Open /auth/login. 2. Enter valid email and password. 3. Submit. | The account page ("My account") opens and the user's name is shown in the header menu. |
| TC-02b | Login with invalid credentials | A customer exists. | 1. Open /auth/login. 2. Enter valid email and a wrong password. 3. Submit. | An error message is shown. The user stays on the login page and is not on /account. |
| TC-03 | Buy a product | A customer exists (API). | 1. Log in. 2. Open the first product. 3. Set quantity to 2 and add to cart. 4. Open the cart. 5. Check item and quantity. 6. Proceed through sign-in, billing address and payment (credit card). 7. Confirm. | The cart holds exactly one line with the chosen product name and quantity 2. A payment success message appears after confirming. |
| TC-04 | Compare two products | None. | 1. Open the first product, read name and price. 2. Open the second product, read name and price. 3. Compare. | The names differ, both prices are greater than 0, and the comparison is consistent (cheaper vs more expensive). |
| TC-05a | Reset password, known email | A customer exists (API). | 1. Open /auth/forgot-password. 2. Enter the registered email. 3. Submit. | A confirmation message is shown. |
| TC-05b | Reset password, unknown email | None. | 1. Open /auth/forgot-password. 2. Enter a random unregistered email. 3. Submit. | An error message is shown and no confirmation. |

Notes:
- TC-04: the site has no compare feature that I could confirm, so this is a comparison of data captured from two product pages.
- TC-05b: the site may not distinguish known and unknown emails. Unverified.
