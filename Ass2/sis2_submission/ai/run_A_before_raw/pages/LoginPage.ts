import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async logIn(email: string, password: string) {
    await this.page.goto('/auth/login');
    await this.page.getByTestId('email').fill(email);
    await this.page.getByTestId('password').fill(password);
    await this.page.getByTestId('login-submit').click();
  }

  async expectOnLoginPage() {
    await expect(this.page).toHaveURL(/\/auth\/login/);
  }

  async expectLoginError() {
    await expect(this.page.getByTestId('login-error')).toBeVisible(); // TODO-VERIFY
  }
}
