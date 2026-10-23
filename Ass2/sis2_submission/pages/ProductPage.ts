import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { parseMoney } from './helpers';

export class ProductPage extends BasePage {
  async open(productId: string): Promise<void> {
    await this.goto(`/product/${productId}`);
    await expect(this.page.getByTestId('product-name')).toBeVisible();
  }

  async name(): Promise<string> {
    return ((await this.page.getByTestId('product-name').textContent()) ?? '').trim();
  }

  async unitPrice(): Promise<number> {
    return parseMoney((await this.page.getByTestId('unit-price').textContent()) ?? '');
  }

  async setQuantity(quantity: number): Promise<void> {
    const field = this.page.getByTestId('quantity');
    await field.fill(String(quantity));
    await expect(field).toHaveValue(String(quantity));
  }

  /** Clicks add-to-cart and waits for the confirmation toast, so the cart is saved before we leave. */
  async addToCart(confirmation: RegExp): Promise<void> {
    await this.page.getByTestId('add-to-cart').click();
    await expect(this.page.getByRole('alert').filter({ hasText: confirmation })).toBeVisible();
  }

  async addToCompare(): Promise<void> {
    await this.page.getByTestId('add-to-compare').click();
  }

  async openComparison(): Promise<void> {
    await this.page.getByTestId('compare-link').click();
  }
}
