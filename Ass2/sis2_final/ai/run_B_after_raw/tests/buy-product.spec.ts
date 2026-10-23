import { expect } from '@playwright/test';
import { MESSAGES, PAYMENT_METHOD } from '../data/messages';
import { test } from '../fixtures';

// Runs in the "authenticated" project: the signed-in state comes from storageState.
test('TC-BUY-01: signed-in user buys 3 units of a product', async ({
  api,
  sessionUser,
  productPage,
  cartPage,
  checkoutPage,
}) => {
  const [product] = await api.pickProducts(1);
  const quantity = 3;

  await productPage.open(product.id);
  const name = await productPage.name();
  const unitPrice = await productPage.unitPrice();
  expect(name).toBe(product.name);

  await productPage.setQuantity(quantity);
  await productPage.addToCart(MESSAGES.addedToCart);

  // Cart: exactly this product, right quantity, right line total.
  await cartPage.open();
  await cartPage.expectOnlyProduct(name);
  const line = await cartPage.line(name);
  expect(line.quantity).toBe(quantity);
  expect(line.linePrice).toBeCloseTo(unitPrice * quantity, 2);

  // Checkout wizard.
  await cartPage.proceed();
  await checkoutPage.continueAsSignedIn();
  await checkoutPage.submitBilling(sessionUser.address);
  await checkoutPage.pay(PAYMENT_METHOD);
  await checkoutPage.expectPaymentSuccess(MESSAGES.paymentSuccess);
});
