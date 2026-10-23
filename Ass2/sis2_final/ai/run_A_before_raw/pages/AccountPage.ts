import { Page, expect } from '@playwright/test';

export class AccountPage {
  constructor(private readonly page: Page) {}

  async expectOnAccountPage() {
    await expect(this.page).toHaveURL(/\/account/);
    await expect(this.page.getByTestId('page-title')).toHaveText(/My account/i); // TODO-VERIFY
  }

  async expectNotOnAccountPage() {
    await expect(this.page).not.toHaveURL(/\/account/);
  }
}
