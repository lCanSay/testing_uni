import { Page, expect } from '@playwright/test';

export class CatalogPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto('/');
    await expect(this.page.getByTestId('product-name').first()).toBeVisible(); // TODO-VERIFY
  }

  /** Opens the product card at the given position (0-based) from the home listing. */
  async openProductByIndex(index: number) {
    await this.open();
    await this.page.getByTestId('product-name').nth(index).click();
  }
}
