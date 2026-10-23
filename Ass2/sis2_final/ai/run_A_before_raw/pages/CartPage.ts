import { Page, expect } from '@playwright/test';

export class CartPage {
  constructor(private readonly page: Page) {}

  async expectSingleItem(name: string, quantity: number) {
    await expect(this.page.getByTestId('product-title')).toHaveCount(1); // TODO-VERIFY
    await expect(this.page.getByTestId('product-title')).toContainText(name);
    await expect(this.page.getByTestId('product-quantity')).toHaveValue(String(quantity)); // TODO-VERIFY
  }

  async proceedToCheckout() {
    await this.page.getByTestId('proceed-1').click(); // TODO-VERIFY
  }
}
