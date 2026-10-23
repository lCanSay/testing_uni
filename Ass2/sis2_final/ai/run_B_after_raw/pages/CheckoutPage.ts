import { expect } from '@playwright/test';
import type { Address } from '../data/userFactory';
import { BasePage } from './BasePage';
import { AddressForm } from './components/AddressForm';

/** Steps 2-4 of the checkout wizard: sign-in, billing address, payment. */
export class CheckoutPage extends BasePage {
  /** Step 2: already signed in (storageState), just continue. */
  async continueAsSignedIn(): Promise<void> {
    await this.page.getByTestId('proceed-2').click();
  }

  /** Step 3: billing address. house_number is required here. */
  async submitBilling(address: Address): Promise<void> {
    await new AddressForm(this.page).fill(address);
    await this.page.getByTestId('proceed-3').click();
  }

  /** Step 4: choose payment method and confirm. */
  async pay(method: string): Promise<void> {
    await this.page.getByTestId('payment-method').selectOption(method);
    await this.page.getByTestId('finish').click();
  }

  async expectPaymentSuccess(message: RegExp): Promise<void> {
    await expect(this.page.getByTestId('payment-success-message')).toContainText(message);
  }
}
