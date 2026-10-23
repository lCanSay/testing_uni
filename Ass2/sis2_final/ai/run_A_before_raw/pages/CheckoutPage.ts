import { Page, expect } from '@playwright/test';
import { TestUser } from '../data/userFactory';

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  /** Walks sign-in step, billing address and payment, then confirms the order. */
  async completeOrder(user: TestUser) {
    // Step 2: already signed in
    await this.page.getByTestId('proceed-2').click(); // TODO-VERIFY

    // Step 3: billing address (fill is idempotent if the form is prefilled)
    await this.page.getByTestId('street').fill(user.street);
    await this.page.getByTestId('city').fill(user.city);
    await this.page.getByTestId('state').fill(user.state);
    await this.page.getByTestId('country').fill(user.country); // TODO-VERIFY text input vs select
    await this.page.getByTestId('postal_code').fill(user.postalCode);
    await this.page.getByTestId('proceed-3').click();

    // Step 4: payment
    await this.page.getByTestId('payment-method').selectOption('credit-card'); // TODO-VERIFY
    await this.page.getByTestId('credit_card_number').fill('1111-1111-1111-1111'); // TODO-VERIFY
    await this.page.getByTestId('expiration_date').fill('12/2030'); // TODO-VERIFY
    await this.page.getByTestId('cvv').fill('123'); // TODO-VERIFY
    await this.page.getByTestId('card_holder_name').fill(`${user.firstName} ${user.lastName}`); // TODO-VERIFY
    await this.page.getByTestId('finish').click(); // TODO-VERIFY
  }

  async expectOrderConfirmed() {
    await expect(this.page.getByTestId('payment-success-message')).toBeVisible(); // TODO-VERIFY
  }
}
