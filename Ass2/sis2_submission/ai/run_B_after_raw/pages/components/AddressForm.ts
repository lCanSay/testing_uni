import type { Page } from '@playwright/test';
import type { Address } from '../../data/userFactory';
import { fillStable } from '../helpers';

/** Address block shared by the register form and the checkout billing step. */
export class AddressForm {
  constructor(private readonly page: Page) {}

  async fill(address: Address): Promise<void> {
    const country = this.page.getByTestId('country');
    // Select on register, may be a plain input on checkout: handle both.
    const isSelect = (await country.evaluate((el) => el.tagName)) === 'SELECT';
    if (isSelect) await country.selectOption(address.country);
    else await fillStable(country, address.country);

    // Postal code + house number trigger the lookup, so they go first and
    // street/city/state are (re)filled last and verified.
    await fillStable(this.page.getByTestId('postal_code'), address.postalCode);
    await fillStable(this.page.getByTestId('house_number'), address.houseNumber);
    await fillStable(this.page.getByTestId('street'), address.street);
    await fillStable(this.page.getByTestId('city'), address.city);
    await fillStable(this.page.getByTestId('state'), address.state);
  }
}
