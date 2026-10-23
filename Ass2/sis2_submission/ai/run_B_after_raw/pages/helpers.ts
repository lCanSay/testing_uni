import { expect, type Locator } from '@playwright/test';

/** "$1,234.50" -> 1234.5 */
export function parseMoney(text: string): number {
  return Number(text.replace(/[^0-9.]/g, ''));
}

/**
 * Fill an input and make sure the value survived. The postcode lookup on register/checkout
 * can rewrite street/city after we typed, so retry until the typed value sticks.
 * Auto-retrying assertion, no sleeps.
 */
export async function fillStable(field: Locator, value: string): Promise<void> {
  await expect(async () => {
    await field.fill(value);
    await expect(field).toHaveValue(value, { timeout: 1_000 });
  }).toPass({ timeout: 10_000 });
}
