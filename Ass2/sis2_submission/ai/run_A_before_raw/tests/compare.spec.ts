import { test, expect } from '../fixtures';

// NOTE: Toolshop has no built-in "compare" feature that I could confirm.
// This test opens two products, captures name and price from their detail pages
// and asserts the comparison in the test itself. If the site gets a compare UI,
// add a page-object action for it. TODO-VERIFY
test('TC-04 compare two products', async ({ app }) => {
  await app.catalog.openProductByIndex(0);
  const first = await app.product.readInfo();

  await app.catalog.openProductByIndex(1);
  const second = await app.product.readInfo();

  expect(first.name).not.toBe(second.name);
  expect(first.price).toBeGreaterThan(0);
  expect(second.price).toBeGreaterThan(0);

  const cheaper = first.price <= second.price ? first : second;
  const pricier = cheaper === first ? second : first;
  expect(cheaper.price).toBeLessThanOrEqual(pricier.price);
  test.info().annotations.push({
    type: 'comparison',
    description: `${cheaper.name} ($${cheaper.price}) vs ${pricier.name} ($${pricier.price})`,
  });
});
