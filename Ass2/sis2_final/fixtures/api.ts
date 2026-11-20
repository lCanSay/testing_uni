import { expect, type APIRequestContext } from '@playwright/test';
import type { Address, User } from '../data/userFactory';

export const API_URL = process.env.API_URL ?? 'https://api.practicesoftwaretesting.com';

export interface ApiProduct {
  id: string;
  name: string;
  price: number;
}

/** Thin client for the pieces of the Toolshop API that tests use for setup (not for assertions). */
export class ToolshopApi {
  constructor(private readonly request: APIRequestContext) {}

  /** Creates a user without touching the UI. Fails loudly if the API refuses. */
  async registerUser(user: User): Promise<void> {
    const res = await this.request.post(`${API_URL}/users/register`, {
      data: {
        first_name: user.firstName,
        last_name: user.lastName,
        dob: user.dob,
        phone: user.phone,
        email: user.email,
        password: user.password,
        address: {
          street: user.address.street,
          house_number: user.address.houseNumber,
          city: user.address.city,
          state: user.address.state,
          country: user.address.country,
          postal_code: user.address.postalCode,
        },
      },
    });
    expect(res.status(), `register ${user.email}: ${await res.text()}`).toBe(201);
  }

  /**
   * The site's postcode lookup decides street/city/state for a country + postcode, the UI
   * auto-fills them, and POST /invoices rejects (422) a city/state that does not match.
   * Returns the address with the locality the site itself expects, so typed and auto-filled
   * values agree.
   */
  async withLookedUpLocality(address: Address): Promise<Address> {
    const res = await this.request.get(`${API_URL}/postcode-lookup`, {
      params: { country: address.country, postcode: address.postalCode, house_number: address.houseNumber },
    });
    expect(res.ok(), `postcode lookup ${address.country}/${address.postalCode}: ${await res.text()}`).toBeTruthy();
    const found = (await res.json()) as { street: string; city: string; state: string };
    return { ...address, street: found.street, city: found.city, state: found.state };
  }

  /** First N purchasable (in stock, not rental) products with distinct names. */
  async pickProducts(count: number): Promise<ApiProduct[]> {
    const res = await this.request.get(`${API_URL}/products?page=1`);
    expect(res.ok(), 'GET /products').toBeTruthy();
    const body = (await res.json()) as {
      data: Array<{ id: string; name: string; price: number; in_stock?: boolean; is_rental?: boolean }>;
    };
    const seen = new Set<string>();
    const picked = body.data
      .filter((p) => p.in_stock !== false && !p.is_rental)
      .filter((p) => (seen.has(p.name) ? false : (seen.add(p.name), true)))
      .slice(0, count)
      .map((p) => ({ id: p.id, name: p.name, price: Number(p.price) }));
    expect(picked, `need ${count} purchasable products`).toHaveLength(count);
    return picked;
  }
}
