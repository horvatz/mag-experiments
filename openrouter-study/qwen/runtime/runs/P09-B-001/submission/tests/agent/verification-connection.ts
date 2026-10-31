import { test, expect, mount, expectIds, select, click } from './helpers';
test('R01: ConnectionView opens with correct default state', async ({ page }) => {
  await mount(page);
  const searchInput = page.getByLabel('Iskanje v povezavi', { exact: true });
  const statusSelect = page.getByLabel('Stanje v povezavi', { exact: true });
  const orderSelect = page.getByLabel('Vrstni red v povezavi', { exact: true });
  expect(searchInput).toBeVisible();
  expect(statusSelect).toHaveValue(all);
  expect(orderSelect).toHaveValue(original);
});

