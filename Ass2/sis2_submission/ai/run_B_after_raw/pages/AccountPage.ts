import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class AccountPage extends BasePage {
  async expectLoaded(title: string): Promise<void> {
    await expect(this.page).toHaveURL(/\/account/);
    await expect(this.page.getByTestId('page-title')).toHaveText(title);
  }
}
