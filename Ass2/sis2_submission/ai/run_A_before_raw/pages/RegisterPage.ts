import { Page } from '@playwright/test';
import { TestUser } from '../data/userFactory';

export class RegisterPage {
  constructor(private readonly page: Page) {}

  async registerCustomer(user: TestUser) {
    await this.page.goto('/auth/register');
    await this.page.getByTestId('first-name').fill(user.firstName);
    await this.page.getByTestId('last-name').fill(user.lastName);
    await this.page.getByTestId('dob').fill(user.dob); // TODO-VERIFY date input format
    await this.page.getByTestId('street').fill(user.street);
    await this.page.getByTestId('postal_code').fill(user.postalCode); // TODO-VERIFY
    await this.page.getByTestId('city').fill(user.city);
    await this.page.getByTestId('state').fill(user.state);
    await this.page.getByTestId('country').selectOption(user.country); // TODO-VERIFY option value
    await this.page.getByTestId('phone').fill(user.phone);
    await this.page.getByTestId('email').fill(user.email);
    await this.page.getByTestId('password').fill(user.password);
    await this.page.getByTestId('register-submit').click();
  }
}
