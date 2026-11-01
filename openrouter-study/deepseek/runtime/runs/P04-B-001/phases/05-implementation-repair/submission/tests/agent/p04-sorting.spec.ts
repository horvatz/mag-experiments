import type { Page } from '@playwright/test'
import { board, click, columnIds, details, expect, expectIds, ids, makeTask, mount, project, readonly, select, table, test, webIds } from '../development/helpers.ts'

const value = (page: Page, name: string) => page.getByRole('combobox', { name, exact: true }).inputValue()

async function expectDefaults(page: Page) {
  expect(await value(page, 'Primarni ključ')).toBe('original')
  expect(await value(page, 'Primarna smer')).toBe('asc')
  expect(await value(page, 'Sekundarni ključ')).toBe('none')
  expect(await value(page, 'Sekundarna smer')).toBe('asc')
}

test('R01: privzete vrednosti in izvorni vrstni red', async ({ page }) => {
  await mount(page)
  await expectDefaults(page)
  await expectIds(page, webIds())
  const options = (name: string) => page.getByRole('combobox', { name, exact: true }).locator('option').evaluateAll((nodes) => nodes.map((node) => (node as HTMLOptionElement).value))
  expect(await options('Primarni ključ')).toEqual(['original', 'title', 'assignee', 'status', 'dueDate'])
  expect(await options('Sekundarni ključ')).toEqual(['none', 'title', 'assignee', 'status', 'dueDate'])
})

test('R02: NFD normalizacija, male črke in primerjava po UTF-16', async ({ page }) => {
  await mount(page, [
    makeTask('s1', { title: 'alfa 2' }),
    makeTask('s2', { title: 'Alfa 10' }),
    makeTask('s3', { title: 'Čas' }),
    makeTask('s4', { title: 'cas' }),
  ])
  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, ['s2', 's1', 's3', 's4'])
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['s3', 's4', 's1', 's2'])
})

test('R03: vrstni red stanj in kronološki datumi', async ({ page }) => {
  await mount(page, [
    makeTask('d1', { status: 'done', dueDate: '2026-01-05' }),
    makeTask('d2', { status: 'in_progress', dueDate: '2026-01-03' }),
    makeTask('d3', { status: 'todo', dueDate: '2026-01-04' }),
    makeTask('d4', { status: 'todo', dueDate: '2026-01-02' }),
  ])
  await select(page, 'Primarni ključ', 'status')
  await expectIds(page, ['d3', 'd4', 'd2', 'd1'])
  await select(page, 'Primarni ključ', 'dueDate')
  await expectIds(page, ['d4', 'd2', 'd3', 'd1'])
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['d1', 'd3', 'd2', 'd4'])
})

test('R04/R05/R06: smer ne obrača izenačenih, enak sekundarni ključ, original', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['web-07', 'web-04', 'web-05', 'web-01', 'web-08', 'web-02', 'web-03', 'web-06'])
  await select(page, 'Primarni ključ', 'original')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, webIds())
})

test('R07: tabla uporabi relativni vrstni red istega razvrščenega polja', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'dueDate')
  await board(page)
  await columnIds(page, 'Pripravljeno', ['web-07', 'web-02', 'web-04', 'web-08'])
  await select(page, 'Primarna smer', 'desc')
  await columnIds(page, 'Pripravljeno', ['web-08', 'web-04', 'web-02', 'web-07'])
  await columnIds(page, 'Končano', ['web-06', 'web-03'])
})

test('R08: preklop pogleda in podrobnosti ohranita vse štiri nastavitve', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'assignee')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'title')
  const expected = ['web-06', 'web-04', 'web-08', 'web-02', 'web-07', 'web-05', 'web-01', 'web-03']
  await expectIds(page, expected)
  await board(page)
  await columnIds(page, 'Pripravljeno', ['web-04', 'web-08', 'web-02', 'web-07'])
  await table(page)
  await expectIds(page, expected)
  await details(page, 'web-02')
  await expectIds(page, expected)
  expect(await value(page, 'Primarni ključ')).toBe('assignee')
  expect(await value(page, 'Primarna smer')).toBe('desc')
  expect(await value(page, 'Sekundarni ključ')).toBe('title')
})

test('R09: menjava projekta in osvežitev ponastavita, brez trajne shrambe', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'assignee')
  await project(page, 'launch')
  await expectDefaults(page)
  await expectIds(page, ['launch-01', 'launch-02'])
  await select(page, 'Primarni ključ', 'title')
  await page.reload()
  await expectDefaults(page)
  await expectIds(page, ['launch-01', 'launch-02'])
  const storage = await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }))
  expect(storage.local).toEqual([])
  expect(storage.session).toEqual([])
  expect(decodeURIComponent(page.url())).not.toContain('title')
})

test('R10: gumb Izvorni vrstni red ponastavi vse štiri kontrole', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await click(page, 'Izvorni vrstni red')
  await expectDefaults(page)
  await expectIds(page, webIds())
})

test('R10: prazen projekt deluje pri vseh ključih in smereh', async ({ page }) => {
  await mount(page, [], '#/projects/web')
  for (const key of ['original', 'title', 'assignee', 'status', 'dueDate']) {
    for (const direction of ['asc', 'desc']) {
      await select(page, 'Primarni ključ', key)
      await select(page, 'Primarna smer', direction)
      await select(page, 'Sekundarni ključ', key === 'original' ? 'none' : key)
      await select(page, 'Sekundarna smer', direction)
    }
  }
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
  await board(page)
  await expect(page.getByRole('region', { name: 'Tabla opravil' }).getByText('Ni opravil v tem stanju.')).toHaveCount(3)
})

test('R10: projekt z enim opravilom deluje pri vseh ključih in smereh', async ({ page }) => {
  await mount(page, [makeTask('only-1', { title: 'Edino opravilo' })])
  for (const key of ['original', 'title', 'assignee', 'status', 'dueDate']) {
    for (const direction of ['asc', 'desc']) {
      await select(page, 'Primarni ključ', key)
      await select(page, 'Primarna smer', direction)
      await select(page, 'Sekundarni ključ', key === 'original' ? 'none' : key)
      await select(page, 'Sekundarna smer', direction)
      await expectIds(page, ['only-1'])
    }
  }
})

test('R11/R12: enkratni ID-ji, prave podrobnosti, brez pisanja in ozek zaslon', async ({ page }) => {
  const writes = await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  const listed = await ids(page)
  expect([...listed].sort()).toEqual([...webIds()].sort())
  await page.locator('[data-task-id="web-03"]').getByRole('link').click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: 'Pregled vsebine' })).toBeVisible()
  await expect(dialog.getByText('web-03', { exact: true }).first()).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await readonly(page, writes)
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await board(page)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
