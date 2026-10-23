import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ForgotPasswordPage extends BasePage {
  async open(): Promise<void> {
    await this.goto('/auth/forgot-password');
  }

  /** Submits the form and returns once the server has answered, so later checks cannot pass early. */
  async requestReset(email: string): Promise<void> {
    await this.page.getByTestId('email').fill(email);
    const answered = this.page.waitForResponse(
      (r) => r.url().includes('forgot-password') && r.request().method() === 'POST',
    );
    await this.page.getByTestId('forgot-password-submit').click();
    await answered;
  }

  async expectSuccessMessage(message: RegExp): Promise<void> {
    await expect(this.page.getByRole('alert').filter({ hasText: message })).toBeVisible();
  }

  // Added by me: the brief says "an error for an invalid one". Checking only that there is
  // no success message would also pass on a page that shows nothing at all.
  async expectErrorMessage(success: RegExp): Promise<void> {
    await expect(this.page.getByRole('alert').filter({ hasNotText: success })).toBeVisible();
  }

  async expectNoSuccessMessage(message: RegExp): Promise<void> {
    await expect(this.page.getByRole('alert').filter({ hasText: message })).toHaveCount(0);
  }
}
