import { randomPassword, unknownEmail } from '../data/userFactory';
import { MESSAGES } from '../data/messages';
import { test } from '../fixtures';

// Each test owns its user: a failed attempt counts towards the 3-strike lock-out of THAT user only,
// and each test below makes at most one failed attempt.

test('TC-LOG-01: valid credentials open the account page', async ({ loginPage, accountPage, newUser }) => {
  await loginPage.open();
  await loginPage.login(newUser.email, newUser.password);
  await accountPage.expectLoaded(MESSAGES.accountTitle);
});

test('TC-LOG-02: wrong password is rejected', async ({ loginPage, newUser }) => {
  await loginPage.open();
  await loginPage.login(newUser.email, randomPassword());
  await loginPage.expectLoginError(MESSAGES.loginError);
});

test('TC-LOG-03: unknown email is rejected', async ({ loginPage }) => {
  await loginPage.open();
  await loginPage.login(unknownEmail(), randomPassword());
  await loginPage.expectLoginError(MESSAGES.loginError);
});
