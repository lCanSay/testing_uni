import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { parseMoney } from './helpers';

export class ComparePage extends BasePage {
  async expectOpen(): Promise<void> {
    await expect(this.page).toHaveURL(/\/comparison/);
    await expect(this.page.getByTestId('comparison-table')).toBeVisible();
  }

  async expectProductListed(name: string): Promise<void> {
    await expect(this.page.getByTestId('comparison-table')).toContainText(name);
  }

  /** Prices shown in the table, sorted, so the check does not depend on column order. */
  async expectPrices(expected: number[]): Promise<void> {
    const sortedExpected = [...expected].sort((a, b) => a - b);
    await expect
      .poll(async () =>
        (await this.page.getByTestId('compare-price').allTextContents()).map(parseMoney).sort((a, b) => a - b),
      )
      .toEqual(sortedExpected);
  }
}
