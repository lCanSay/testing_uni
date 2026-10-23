import { expect } from '@playwright/test';
import type { User } from '../data/userFactory';
import { BasePage } from './BasePage';
import { AddressForm } from './components/AddressForm';
import { fillStable } from './helpers';

export class RegisterPage extends BasePage {
  async open(): Promise<void> {
    await this.goto('/auth/register');
  }

  /** Fills the whole form and submits it. */
  async register(user: User): Promise<void> {
    await this.page.getByTestId('first-name').fill(user.firstName);
    await this.page.getByTestId('last-name').fill(user.lastName);
    await this.page.getByTestId('dob').fill(user.dob);
    await new AddressForm(this.page).fill(user.address);
    await fillStable(this.page.getByTestId('phone'), user.phone);
    await this.page.getByTestId('email').fill(user.email);
    await this.page.getByTestId('password').fill(user.password);
    await this.page.getByTestId('register-submit').click();
  }

  async expectRedirectedToLogin(): Promise<void> {
    await expect(this.page).toHaveURL(/\/auth\/login/);
  }
}
