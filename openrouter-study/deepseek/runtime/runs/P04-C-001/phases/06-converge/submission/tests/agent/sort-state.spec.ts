import { click, expect, expectIds, expectSelection, ids, makeTask, mount, select, test, webIds } from './helpers.ts'

test('R09: menjava projekta ponastavi vse stiri nastavitve', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja' }).click()
  await expect(page.getByRole('heading', { name: 'Jesenska kampanja', exact: true })).toBeVisible()
  await expectSelection(page, 'Primarni ključ', 'original')
  await expectSelection(page, 'Primarna smer', 'asc')
  await expectSelection(page, 'Sekundarni ključ', 'none')
  await expectSelection(page, 'Sekundarna smer', 'asc')
  await expectIds(page, ['launch-01', 'launch-02'])
})

test('R09: osvezitev strani se zacne s privzetimi vrednostmi in brez zapisa v URL', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Primarna smer', 'desc')
  expect(page.url()).not.toContain('sort')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Spletna prenova', exact: true })).toBeVisible()
  await expectSelection(page, 'Primarni ključ', 'original')
  await expectSelection(page, 'Primarna smer', 'asc')
  await expectIds(page, webIds())
})

test('R08: odpiranje in zapiranje podrobnosti ne ponastavi vrstnega reda', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'title')
  const before = await ids(page)
  await page.locator('[data-task-id="web-03"]').getByRole('link').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expectIds(page, before)
  await expectSelection(page, 'Primarni ključ', 'title')
})

test('R10: prazni projekt deluje pri vseh kljucih in smereh', async ({ page }) => {
  await mount(page, [])
  await expect(page.getByText('V tem projektu še ni opravil')).toBeVisible()
  for (const key of ['original', 'title', 'assignee', 'status', 'dueDate']) {
    await select(page, 'Primarni ključ', key)
    await select(page, 'Primarna smer', 'desc')
    await select(page, 'Primarna smer', 'asc')
  }
  for (const key of ['none', 'title', 'assignee', 'status', 'dueDate']) {
    await select(page, 'Sekundarni ključ', key)
    await select(page, 'Sekundarna smer', 'desc')
    await select(page, 'Sekundarna smer', 'asc')
  }
  await expect(page.locator('[data-task-id]')).toHaveCount(0)
})

test('R10: projekt z enim opravilom deluje pri vseh kljucih in smereh', async ({ page }) => {
  await mount(page, [makeTask('solo-01', { title: 'Čas za pregled', assignee: 'Ana Novak', status: 'in_progress', dueDate: '2026-09-18' })])
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await expectIds(page, ['solo-01'])
  await click(page, 'Izvorni vrstni red')
  await expectIds(page, ['solo-01'])
})
