import { expect, expectIds, ids, mount, openBoard, select, test, webIds } from './helpers.ts'

test('R11: razvrscanje ne posilja zapisov in ne spreminja podatkov', async ({ page }) => {
  const writes = await mount(page)
  await select(page, 'Primarni ključ', 'assignee')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await expect(page.locator('[data-task-id]')).toHaveCount(8)
  const row = page.locator('[data-task-id="web-01"]')
  await expect(row.getByText('Čas za pregled')).toBeVisible()
  await expect(row.locator('time')).toHaveAttribute('datetime', '2026-09-18')
  await expect(page.locator('[aria-label="Pregled stanj opravil"] strong')).toHaveText(['4', '2', '2'])
  expect(writes).toEqual([])
  const state = await (await page.request.get('/__test/state')).json() as { saveRequests: number }
  expect(state.saveRequests).toBe(0)
})

test('R12: vsak ID je prikazan natanko enkrat v preglednici in na tabli', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'title')
  const tableIds = await ids(page)
  expect(tableIds).toHaveLength(8)
  expect([...tableIds].sort()).toEqual([...webIds()].sort())
  await openBoard(page)
  const boardIds = await ids(page)
  expect(boardIds).toHaveLength(8)
  expect([...boardIds].sort()).toEqual([...webIds()].sort())
})

test('R12: enaki naslovi odpirajo prave podrobnosti', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await page.locator('[data-task-id="web-03"]').getByRole('link').click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText('web-03', { exact: true }).first()).toBeVisible()
  await expect(dialog.getByText('Ana Novak', { exact: true }).first()).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expectIds(page, ['web-07', 'web-04', 'web-05', 'web-01', 'web-08', 'web-02', 'web-03', 'web-06'])
})

test('R12: pri 390 piks se stran ne razsiri v preglednici in na tabli', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mount(page)
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Sekundarni ključ', 'dueDate')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  await openBoard(page)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
})

test('R12: vrstice in kartice ohranijo data-task-id', async ({ page }) => {
  await mount(page)
  await expect(page.locator('tr[data-task-id]')).toHaveCount(8)
  await openBoard(page)
  await expect(page.locator('li[data-task-id]')).toHaveCount(8)
})
