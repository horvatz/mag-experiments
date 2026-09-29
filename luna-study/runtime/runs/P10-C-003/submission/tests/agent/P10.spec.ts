import { expect, test, mount, expectIds, webIds, click, board, examples } from '../development/helpers.ts'

test('P10: začetni vrstni red, ID mesti in premik z razveljavitvijo', async ({ page }) => {
  await mount(page)
  await expectIds(page, webIds())
  await expect(page.getByLabel('Mesto opravila web-01', { exact: true })).toHaveText('1')
  await expect(page.getByLabel('Mesto opravila web-02', { exact: true })).toHaveText('2')
  await click(page, 'Premakni web-02 gor')
  await expectIds(page, ['web-02', 'web-01', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
  await click(page, 'Razveljavi premik')
  await expectIds(page, webIds())
  await click(page, 'Ponovi premik')
  await expect(page.getByLabel('Mesto opravila web-02', { exact: true })).toHaveText('1')
})

test('P10: meja, veja po razveljavitvi, ponastavitev in brez zapisov', async ({ page }) => {
  const writes = await mount(page)
  await expect(page.getByRole('button', { name: 'Premakni web-01 gor', exact: true })).toBeDisabled()
  await click(page, 'Premakni web-02 gor')
  await click(page, 'Razveljavi premik')
  await click(page, 'Premakni web-03 gor')
  await expect(page.getByRole('button', { name: 'Ponovi premik', exact: true })).toBeDisabled()
  await click(page, 'Začetni vrstni red')
  await expectIds(page, webIds())
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 2. Ponovitve: 0.')
  expect(writes).toEqual([])
})

test('P10: tabla uporablja globalnega soseda in statusov ne spreminja', async ({ page }) => {
  const writes = await mount(page)
  await board(page)
  await click(page, 'Premakni web-02 gor')
  await expect(page.getByLabel('Mesto opravila web-02', { exact: true })).toHaveText('1')
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 1. Ponovitve: 0.')
  expect(writes).toEqual([])
  expect(examples.find((task) => task.id === 'web-02')?.status).toBe('todo')
})
