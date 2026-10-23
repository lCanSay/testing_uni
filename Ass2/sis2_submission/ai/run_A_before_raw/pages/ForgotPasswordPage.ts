import { Page, expect } from '@playwright/test';

export class ForgotPasswordPage {
  constructor(private readonly page: Page) {}

  async requestReset(email: string) {
    await this.page.goto('/auth/forgot-password');
    await this.page.getByTestId('email').fill(email);
    await this.page.getByTestId('forgot-password-submit').click(); // TODO-VERIFY
  }

  async expectConfirmation() {
    await expect(this.page.getByTestId('forgot-password-success')).toBeVisible(); // TODO-VERIFY
  }

  async expectError() {
    await expect(this.page.getByTestId('forgot-password-error')).toBeVisible(); // TODO-VERIFY
    await expect(this.page.getByTestId('forgot-password-success')).toBeHidden();
  }
}
