import { buildUser } from '../data/userFactory';
import { MESSAGES } from '../data/messages';
import { test } from '../fixtures';

test('TC-REG-01: a visitor can register and then sign in with the new account', async ({
  registerPage,
  loginPage,
  accountPage,
}) => {
  const user = buildUser();

  await registerPage.open();
  await registerPage.register(user);
  await registerPage.expectRedirectedToLogin();

  // Proof that the account really exists: the credentials we just registered must work.
  await loginPage.login(user.email, user.password);
  await accountPage.expectLoaded(MESSAGES.accountTitle);
});
