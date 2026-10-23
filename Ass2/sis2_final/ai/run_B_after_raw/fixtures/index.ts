import { test as base, expect } from '@playwright/test';
import fs from 'node:fs';
import { buildUser, type User } from '../data/userFactory';
import { AccountPage } from '../pages/AccountPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { ComparePage } from '../pages/ComparePage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { LoginPage } from '../pages/LoginPage';
import { ProductPage } from '../pages/ProductPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ToolshopApi } from './api';
import { SESSION_USER_FILE } from './paths';

interface Fixtures {
  api: ToolshopApi;
  /** A brand new user, created via API for this test only. Safe to lock out / reset. */
  newUser: User;
  /** The user behind the shared storageState (created once by tests/auth.setup.ts). */
  sessionUser: User;

  registerPage: RegisterPage;
  loginPage: LoginPage;
  accountPage: AccountPage;
  forgotPasswordPage: ForgotPasswordPage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  comparePage: ComparePage;
}

export const test = base.extend<Fixtures>({
  api: async ({ request }, use) => use(new ToolshopApi(request)),

  newUser: async ({ api }, use) => {
    const user = buildUser();
    await api.registerUser(user);
    await use(user);
  },

  // eslint-disable-next-line no-empty-pattern
  sessionUser: async ({}, use) => use(JSON.parse(fs.readFileSync(SESSION_USER_FILE, 'utf-8')) as User),

  registerPage: async ({ page }, use) => use(new RegisterPage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  accountPage: async ({ page }, use) => use(new AccountPage(page)),
  forgotPasswordPage: async ({ page }, use) => use(new ForgotPasswordPage(page)),
  productPage: async ({ page }, use) => use(new ProductPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  comparePage: async ({ page }, use) => use(new ComparePage(page)),
});

export { expect };
