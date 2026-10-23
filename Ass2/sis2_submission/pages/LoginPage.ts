import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  async open(): Promise<void> {
    await this.goto('/auth/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.getByTestId('email').fill(email);
    await this.page.getByTestId('password').fill(password);
    await this.page.getByTestId('login-submit').click();
  }

  async expectLoginError(message: RegExp): Promise<void> {
    await expect(this.page.getByTestId('login-error')).toContainText(message);
    await expect(this.page).toHaveURL(/\/auth\/login/);
  }
}
