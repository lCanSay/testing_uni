import fs from 'node:fs';
import { buildUser } from '../data/userFactory';
import { MESSAGES } from '../data/messages';
import { test as setup } from '../fixtures';
import { AUTH_DIR, SESSION_USER_FILE, STORAGE_STATE } from '../fixtures/paths';

// Runs once per `playwright test`: fresh (non-seeded) user, API creation, one UI login.
setup('create user and store signed-in state', async ({ api, loginPage, accountPage, page }) => {
  const user = buildUser();
  await api.registerUser(user);

  await loginPage.open();
  await loginPage.login(user.email, user.password);
  await accountPage.expectLoaded(MESSAGES.accountTitle);

  fs.mkdirSync(AUTH_DIR, { recursive: true });
  fs.writeFileSync(SESSION_USER_FILE, JSON.stringify(user));
  await page.context().storageState({ path: STORAGE_STATE });
});
