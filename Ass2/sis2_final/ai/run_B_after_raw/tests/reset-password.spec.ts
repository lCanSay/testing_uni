import { MESSAGES } from '../data/messages';
import { unknownEmail } from '../data/userFactory';
import { test } from '../fixtures';

// The reset really changes the password on the server, so both tests use their own fresh user.

test('TC-PWD-01: reset for a known email succeeds and the old password stops working', async ({
  forgotPasswordPage,
  loginPage,
  newUser,
}) => {
  await forgotPasswordPage.open();
  await forgotPasswordPage.requestReset(newUser.email);
  await forgotPasswordPage.expectSuccessMessage(MESSAGES.resetSuccess);

  // Side effect check: the password we registered with must no longer be valid.
  await loginPage.open();
  await loginPage.login(newUser.email, newUser.password);
  await loginPage.expectLoginError(MESSAGES.loginError);
});

test('TC-PWD-02: reset for an unknown email shows no success and changes nothing', async ({
  forgotPasswordPage,
  loginPage,
  accountPage,
  newUser,
}) => {
  await forgotPasswordPage.open();
  await forgotPasswordPage.requestReset(unknownEmail());
  await forgotPasswordPage.expectNoSuccessMessage(MESSAGES.resetSuccess);

  // Control: an unrelated existing account keeps its password.
  await loginPage.open();
  await loginPage.login(newUser.email, newUser.password);
  await accountPage.expectLoaded(MESSAGES.accountTitle);
});
