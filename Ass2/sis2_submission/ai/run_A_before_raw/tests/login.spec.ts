import { test } from '../fixtures';

test.describe('login', () => {
  test('TC-02a valid credentials reach the account page', async ({ app, registeredUser }) => {
    await app.login.logIn(registeredUser.email, registeredUser.password);
    await app.account.expectOnAccountPage();
    await app.header.expectSignedIn(`${registeredUser.firstName} ${registeredUser.lastName}`);
  });

  test('TC-02b invalid credentials show an error', async ({ app, registeredUser }) => {
    await app.login.logIn(registeredUser.email, 'Wrong!Passw0rd#999');
    await app.login.expectLoginError();
    await app.login.expectOnLoginPage();
    await app.account.expectNotOnAccountPage();
  });
});
