import { test as base, expect } from '@playwright/test';
import { AccountPage } from '../pages/AccountPage';
import { CartPage } from '../pages/CartPage';
import { CatalogPage } from '../pages/CatalogPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { HeaderPage } from '../pages/HeaderPage';
import { LoginPage } from '../pages/LoginPage';
import { ProductPage } from '../pages/ProductPage';
import { RegisterPage } from '../pages/RegisterPage';
import { buildUser, TestUser } from '../data/userFactory';

type App = {
  register: RegisterPage;
  login: LoginPage;
  account: AccountPage;
  header: HeaderPage;
  catalog: CatalogPage;
  product: ProductPage;
  cart: CartPage;
  checkout: CheckoutPage;
  forgotPassword: ForgotPasswordPage;
};

type Fixtures = {
  app: App;
  /** Fresh user data, not yet registered. */
  newUser: TestUser;
  /** A user created through the API before the test, so tests stay independent. */
  registeredUser: TestUser;
};

const API_URL = 'https://api.practicesoftwaretesting.com'; // TODO-VERIFY

export const test = base.extend<Fixtures>({
  app: async ({ page }, use) => {
    await use({
      register: new RegisterPage(page),
      login: new LoginPage(page),
      account: new AccountPage(page),
      header: new HeaderPage(page),
      catalog: new CatalogPage(page),
      product: new ProductPage(page),
      cart: new CartPage(page),
      checkout: new CheckoutPage(page),
      forgotPassword: new ForgotPasswordPage(page),
    });
  },

  newUser: async ({}, use) => {
    await use(buildUser());
  },

  registeredUser: async ({ request }, use) => {
    const user = buildUser();
    const res = await request.post(`${API_URL}/users/register`, {
      // TODO-VERIFY payload field names against the API docs
      data: {
        first_name: user.firstName,
        last_name: user.lastName,
        dob: user.dob,
        phone: user.phone,
        email: user.email,
        password: user.password,
        address: {
          street: user.street,
          city: user.city,
          state: user.state,
          country: user.country,
          postal_code: user.postalCode,
        },
      },
    });
    expect(res.ok(), `API registration failed: ${res.status()}`).toBeTruthy();
    await use(user);
  },
});

export { expect };
