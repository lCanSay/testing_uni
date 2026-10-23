import { test } from '../fixtures';
import { UNKNOWN_EMAIL } from '../data/userFactory';

test.describe('reset password', () => {
  test('TC-05a known email shows confirmation', async ({ app, registeredUser }) => {
    await app.forgotPassword.requestReset(registeredUser.email);
    await app.forgotPassword.expectConfirmation();
  });

  // TODO-VERIFY: the demo site may answer identically for unknown emails
  // (to avoid account enumeration). If so, this test will fail and the
  // expected result in Description.md must be changed.
  test('TC-05b unknown email shows an error', async ({ app }) => {
    await app.forgotPassword.requestReset(UNKNOWN_EMAIL());
    await app.forgotPassword.expectError();
  });
});
