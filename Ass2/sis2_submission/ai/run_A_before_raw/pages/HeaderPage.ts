import { Page, expect } from '@playwright/test';

export class HeaderPage {
  constructor(private readonly page: Page) {}

  async openCart() {
    await this.page.getByTestId('nav-cart').click(); // TODO-VERIFY
  }

  async expectSignedIn(fullName: string) {
    await expect(this.page.getByTestId('nav-menu')).toContainText(fullName); // TODO-VERIFY
  }

  async expectSignedOut() {
    await expect(this.page.getByTestId('nav-sign-in')).toBeVisible(); // TODO-VERIFY
  }
}
