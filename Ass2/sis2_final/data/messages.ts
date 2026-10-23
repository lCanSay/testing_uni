/**
 * Texts the UI is expected to show. Kept in one place because they are the part of this
 * suite that was written without access to the live site: if a first run shows different
 * wording, change it here only.
 */
export const MESSAGES = {
  accountTitle: 'My account',
  loginError: /invalid email or password/i,
  resetSuccess: /successfully/i, // was /success|updated|sent/i: too loose, almost any text matches
  addedToCart: /added to shopping cart/i,
  paymentSuccess: /payment was successful/i,
} as const;

export const PAYMENT_METHOD = 'cash-on-delivery';
