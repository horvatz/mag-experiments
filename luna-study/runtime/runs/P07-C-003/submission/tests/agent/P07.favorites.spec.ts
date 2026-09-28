import { board, click, expect, expectIds, mount, readonly, table, test } from '../development/helpers.ts'

test('favorites persist by ID and are shared by table and board', async ({ page }) => {
  const writes = await mount(page)
  await click(page, 'Priljubljeno opravilo web-02')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('folio:favorites:v1')!))).toEqual({ version: 1, ids: ['web-02'] })
  await board(page)
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await table(page)
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await expectIds(page, ['web-02'])
  await click(page, 'Priljubljeno opravilo web-02')
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await expect(page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })).toBeVisible()
  await readonly(page, writes)
})
