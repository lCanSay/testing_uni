import { Page, expect } from '@playwright/test';

export interface ProductInfo {
  name: string;
  price: number;
}

export class ProductPage {
  constructor(private readonly page: Page) {}

  /** Reads name and price shown on the product details page. */
  async readInfo(): Promise<ProductInfo> {
    const name = this.page.getByTestId('product-name'); // TODO-VERIFY
    const price = this.page.getByTestId('unit-price'); // TODO-VERIFY
    await expect(name).toBeVisible();
    await expect(price).toBeVisible();
    const priceText = (await price.innerText()).replace(/[^0-9.]/g, '');
    return { name: (await name.innerText()).trim(), price: parseFloat(priceText) };
  }

  async addToCart(quantity = 1) {
    if (quantity !== 1) {
      await this.page.getByTestId('quantity').fill(String(quantity)); // TODO-VERIFY
    }
    await this.page.getByTestId('add-to-cart').click();
    // The app shows a toast confirming the item was added.
    await expect(this.page.getByRole('alert')).toContainText(/added to shopping cart/i); // TODO-VERIFY
  }
}
