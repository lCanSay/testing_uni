import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { parseMoney } from './helpers';

export interface CartLine {
  title: string;
  quantity: number;
  linePrice: number;
}

/** The cart is step 1 of the checkout wizard (/checkout). */
export class CartPage extends BasePage {
  async open(): Promise<void> {
    await this.goto('/checkout');
    await expect(this.page.getByTestId('product-title').first()).toBeVisible();
  }

  async expectOnlyProduct(title: string): Promise<void> {
    await expect
      .poll(async () => (await this.page.getByTestId('product-title').allTextContents()).map((t) => t.trim()))
      .toEqual([title]);
  }

  async line(title: string): Promise<CartLine> {
    const row = this.page.getByRole('row').filter({ hasText: title });
    return {
      title: ((await row.getByTestId('product-title').textContent()) ?? '').trim(),
      quantity: Number(await row.getByTestId('product-quantity').inputValue()),
      linePrice: parseMoney((await row.getByTestId('line-price').textContent()) ?? ''),
    };
  }

  async proceed(): Promise<void> {
    await this.page.getByTestId('proceed-1').click();
  }
}
