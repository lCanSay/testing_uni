import { test, expect } from '../fixtures';

test('TC-03 buy a product', async ({ app, registeredUser }) => {
  const quantity = 2;

  await app.login.logIn(registeredUser.email, registeredUser.password);
  await app.account.expectOnAccountPage();

  await app.catalog.openProductByIndex(0);
  const product = await app.product.readInfo();
  await app.product.addToCart(quantity);

  await app.header.openCart();
  await app.cart.expectSingleItem(product.name, quantity);

  await app.cart.proceedToCheckout();
  await app.checkout.completeOrder(registeredUser);
  await app.checkout.expectOrderConfirmed();
  expect(product.price).toBeGreaterThan(0);
});
