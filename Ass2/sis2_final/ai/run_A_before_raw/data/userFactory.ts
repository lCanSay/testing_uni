import { randomUUID } from 'crypto';

export interface TestUser {
  firstName: string;
  lastName: string;
  dob: string; // YYYY-MM-DD
  street: string;
  postalCode: string;
  city: string;
  state: string;
  country: string; // ISO code used by the country select
  phone: string;
  email: string;
  password: string;
}

/** Unique per call, safe across parallel workers (UUID, not just a timestamp). */
export function uniqueEmail(prefix = 'qa'): string {
  return `${prefix}.${Date.now()}.${randomUUID().slice(0, 8)}@example.com`;
}

export function buildUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    firstName: 'Test',
    lastName: 'Customer',
    dob: '1990-05-15',
    street: '1 Test Street',
    postalCode: '10001',
    city: 'Testville',
    state: 'NY',
    country: 'US',
    phone: '5551234567',
    email: uniqueEmail(),
    // Strong password: upper, lower, digit, symbol, 12+ chars (site enforces complexity).
    password: 'Str0ng!Passw0rd#' + randomUUID().slice(0, 4),
    ...overrides,
  };
}

export const UNKNOWN_EMAIL = () => uniqueEmail('nobody');
