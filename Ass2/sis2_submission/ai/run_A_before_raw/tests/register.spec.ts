import { test } from '../fixtures';

test('TC-01 register a new customer', async ({ app, newUser }) => {
  await app.register.registerCustomer(newUser);

  // Site redirects to the login page after registration.
  await app.login.expectOnLoginPage();

  // Proof the account really exists: it can log in.
  await app.login.logIn(newUser.email, newUser.password);
  await app.account.expectOnAccountPage();
});
