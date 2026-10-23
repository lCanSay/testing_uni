import { expect } from '@playwright/test';
import { test } from '../fixtures';

test('TC-CMP-01: two products added to compare appear on the comparison page with their prices', async ({
  api,
  productPage,
  comparePage,
}) => {
  const [first, second] = await api.pickProducts(2);

  await productPage.open(first.id);
  const firstName = await productPage.name();
  const firstPrice = await productPage.unitPrice();
  await productPage.addToCompare();

  await productPage.open(second.id);
  const secondName = await productPage.name();
  const secondPrice = await productPage.unitPrice();
  await productPage.addToCompare();

  expect(firstName).not.toBe(secondName);

  await productPage.openComparison();
  await comparePage.expectOpen();
  await comparePage.expectProductListed(firstName);
  await comparePage.expectProductListed(secondName);
  await comparePage.expectPrices([firstPrice, secondPrice]);
});
