import { expect } from '@playwright/test';
import { BasePage } from './BasePage';


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

  // Changed by me: the AI version read the row once with textContent()/inputValue() and compared
  // in the spec. That is a query, it does not retry (week 6: query vs assertion), so it can read
  // the cart before Angular has updated it. Now both checks are web-first assertions.
  async expectLine(title: string, quantity: number, unitPrice: number): Promise<void> {
    const row = this.page.getByRole('row').filter({ hasText: title });
    await expect(row.getByTestId('product-quantity')).toHaveValue(String(quantity));
    await expect(row.getByTestId('line-price')).toHaveText(
      `$${(unitPrice * quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    );
  }

  async proceed(): Promise<void> {
    await this.page.getByTestId('proceed-1').click();
  }
}
