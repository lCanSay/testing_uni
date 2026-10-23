import { randomBytes, randomInt } from 'node:crypto';

export interface Address {
  street: string;
  houseNumber: string;
  city: string;
  state: string;
  /** ISO 3166-1 alpha-2 code, used as the <option> value. */
  country: string;
  postalCode: string;
}

export interface User {
  firstName: string;
  lastName: string;
  /** YYYY-MM-DD */
  dob: string;
  phone: string;
  email: string;
  password: string;
  address: Address;
}

const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghijkmnopqrstuvwxyz';
const DIGIT = '23456789';
const SYMBOL = '!@#$%^&*-_=+';

const pick = (set: string): string => set[randomInt(set.length)];

/**
 * Random strong password (never a dictionary/leaked one): at least one upper, lower,
 * digit and symbol, shuffled with a CSPRNG.
 */
export function randomPassword(length = 18): string {
  const all = UPPER + LOWER + DIGIT + SYMBOL;
  const chars = [pick(UPPER), pick(LOWER), pick(DIGIT), pick(SYMBOL)];
  while (chars.length < length) chars.push(pick(all));
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

const uid = (): string => randomBytes(6).toString('hex');

export function uniqueEmail(prefix = 'qa'): string {
  return `${prefix}.${uid()}@example.com`;
}

/** An address that is syntactically valid but guaranteed not to belong to any account. */
export function unknownEmail(): string {
  return uniqueEmail('no.such.user');
}

/** Builds a brand new, unique user. Nothing here is shared between tests. */
export function buildUser(overrides: Partial<User> = {}): User {
  return {
    firstName: 'Test',
    lastName: `User${uid().slice(0, 6)}`,
    dob: '1990-05-15',
    phone: `555${randomInt(1_000_000, 9_999_999)}`,
    email: uniqueEmail(),
    password: randomPassword(),
    address: {
      street: 'Main Street',
      houseNumber: '12',
      city: 'Springfield',
      state: 'Illinois',
      country: 'US',
      postalCode: '62701',
    },
    ...overrides,
  };
}
