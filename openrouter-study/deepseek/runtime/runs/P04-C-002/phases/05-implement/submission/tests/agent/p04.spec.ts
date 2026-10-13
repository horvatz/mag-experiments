import type { Page } from '@playwright/test'
import { expect, test, mount, makeTask, webIds, ids, select, click, board, table, project, details, expectIds, columnIds, readonly } from '../development/helpers.ts'

const field = (page: Page, name: string) => page.getByRole('combobox', { name, exact: true })

test('A01: privzete nastavitve in izvorni vrstni red', async ({ page }) => {
  await mount(page)
  await expect(field(page, 'Primarni ključ')).toHaveValue('original')
  await expect(field(page, 'Primarna smer')).toHaveValue('asc')
  await expect(field(page, 'Sekundarni ključ')).toHaveValue('none')
  await expect(field(page, 'Sekundarna smer')).toHaveValue('asc')
  await expectIds(page, webIds())
})

test('B01: title primerja normalizirane nize po UTF-16', async ({ page }) => {
  await mount(page, [
    makeTask('b1', { title: 'Žaba' }),
    makeTask('b2', { title: 'čaj' }),
    makeTask('b3', { title: 'Zebra' }),
    makeTask('b4', { title: 'Alpha' }),
    makeTask('b5', { title: 'alfa 2' }),
    makeTask('b6', { title: 'alfa 10' }),
  ])
  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, ['b6', 'b5', 'b4', 'b2', 'b1', 'b3'])
})

test('B02: assignee normalizira šumnike in velikost črk', async ({ page }) => {
  await mount(page, [
    makeTask('a1', { assignee: 'Špela' }),
    makeTask('a2', { assignee: 'ana' }),
    makeTask('a3', { assignee: 'Ana' }),
    makeTask('a4', { assignee: 'Črt' }),
  ])
  await select(page, 'Primarni ključ', 'assignee')
  await expectIds(page, ['a2', 'a3', 'a4', 'a1'])
})

const statusRecords = [
  makeTask('c1', { status: 'done', dueDate: '2026-03-05' }),
  makeTask('c2', { status: 'todo', dueDate: '2026-01-10' }),
  makeTask('c3', { status: 'in_progress', dueDate: '2026-02-01' }),
  makeTask('c4', { status: 'todo', dueDate: '2026-01-02' }),
  makeTask('c5', { status: 'done', dueDate: '2026-03-05' }),
  makeTask('c6', { status: 'in_progress', dueDate: '2026-02-01' }),
]

test('C01: status uporablja vrstni red todo, in_progress, done', async ({ page }) => {
  await mount(page, statusRecords)
  await select(page, 'Primarni ključ', 'status')
  await expectIds(page, ['c2', 'c4', 'c3', 'c6', 'c1', 'c5'])
})

test('C02: dueDate razvršča veljavne datume kronološko', async ({ page }) => {
  await mount(page, statusRecords)
  await select(page, 'Primarni ključ', 'dueDate')
  await expectIds(page, ['c4', 'c2', 'c3', 'c6', 'c1', 'c5'])
})

const stabilityRecords = [
  makeTask('d1', { title: 'Beta' }),
  makeTask('d2', { title: 'Alpha' }),
  makeTask('d3', { title: 'Beta' }),
  makeTask('d4', { title: 'Alpha' }),
]

test('D01: desc obrne izid primerjave in ohrani izenačene', async ({ page }) => {
  await mount(page, stabilityRecords)
  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, ['d2', 'd4', 'd1', 'd3'])
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['d1', 'd3', 'd2', 'd4'])
})

test('E01: sekundarni ključ z neodvisno smerjo', async ({ page }) => {
  await mount(page, [
    makeTask('e1', { status: 'todo', dueDate: '2026-01-05' }),
    makeTask('e2', { status: 'todo', dueDate: '2026-01-01' }),
    makeTask('e3', { status: 'todo', dueDate: '2026-01-03' }),
    makeTask('e4', { status: 'done', dueDate: '2026-01-02' }),
    makeTask('e5', { status: 'done', dueDate: '2026-01-04' }),
  ])
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['e1', 'e3', 'e2', 'e5', 'e4'])
})

test('E02: sekundarni ključ se uporabi le ob enakem primarnem', async ({ page }) => {
  await mount(page, [
    makeTask('f1', { title: 'A', dueDate: '2026-02-02' }),
    makeTask('f2', { title: 'Z', dueDate: '2026-02-01' }),
    makeTask('f3', { title: 'B', dueDate: '2026-02-02' }),
  ])
  await select(page, 'Primarni ključ', 'dueDate')
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['f2', 'f3', 'f1'])
})

test('F01: original na primarnem ključu vrne izvorni vrstni red', async ({ page }) => {
  await mount(page)
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, webIds())
})

test('F02: enak primarni in sekundarni ključ ne doda obrata', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['web-07', 'web-04', 'web-05', 'web-01', 'web-08', 'web-02', 'web-03', 'web-06'])
})

test('G01: tabla ohrani stolpce in relativni vrstni red', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'dueDate')
  await board(page)
  await expect(page.locator('.board-column-heading h3')).toHaveText(['Pripravljeno', 'V delu', 'Končano'])
  await columnIds(page, 'Pripravljeno', ['web-07', 'web-02', 'web-04', 'web-08'])
  await columnIds(page, 'V delu', ['web-01', 'web-05'])
  await columnIds(page, 'Končano', ['web-03', 'web-06'])
})

test('H01: preklop pogleda in podrobnosti ohranita nastavitve', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await board(page)
  await columnIds(page, 'Končano', ['web-06', 'web-03'])
  await table(page)
  await expectIds(page, ['web-06', 'web-02', 'web-03', 'web-08', 'web-01', 'web-05', 'web-04', 'web-07'])
  await details(page, 'web-02')
  await expect(field(page, 'Primarni ključ')).toHaveValue('title')
  await expect(field(page, 'Primarna smer')).toHaveValue('desc')
  await expectIds(page, ['web-06', 'web-02', 'web-03', 'web-08', 'web-01', 'web-05', 'web-04', 'web-07'])
})

test('I01: menjava projekta ponastavi vse štiri nastavitve', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await project(page, 'launch')
  await expect(field(page, 'Primarni ključ')).toHaveValue('original')
  await expect(field(page, 'Primarna smer')).toHaveValue('asc')
  await expect(field(page, 'Sekundarni ključ')).toHaveValue('none')
  await expect(field(page, 'Sekundarna smer')).toHaveValue('asc')
  await project(page, 'web')
  await expect(field(page, 'Primarni ključ')).toHaveValue('original')
})

test('I02: osvežitev začne s privzetimi vrednostmi', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'assignee')
  await select(page, 'Sekundarna smer', 'desc')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Spletna prenova', exact: true })).toBeVisible()
  await expect(field(page, 'Primarni ključ')).toHaveValue('original')
  await expect(field(page, 'Sekundarna smer')).toHaveValue('asc')
  await expectIds(page, webIds())
})

test('J01: gumb Izvorni vrstni red ponastavi kontrole', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'assignee')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'status')
  await click(page, 'Izvorni vrstni red')
  await expect(field(page, 'Primarni ključ')).toHaveValue('original')
  await expect(field(page, 'Primarna smer')).toHaveValue('asc')
  await expect(field(page, 'Sekundarni ključ')).toHaveValue('none')
  await expectIds(page, webIds())
})

test('J02: prazen projekt deluje pri vseh ključih', async ({ page }) => {
  await mount(page, [], '#/projects/web')
  for (const key of ['title', 'assignee', 'status', 'dueDate']) {
    await select(page, 'Primarni ključ', key)
    await select(page, 'Primarna smer', 'desc')
  }
  await expect(page.getByText('V tem projektu še ni opravil')).toBeVisible()
  await expect(page.locator('[data-task-id]')).toHaveCount(0)
})

test('J03: projekt z enim opravilom deluje pri vseh smereh', async ({ page }) => {
  await mount(page, [makeTask('web-01')])
  for (const key of ['title', 'assignee', 'status', 'dueDate']) {
    await select(page, 'Primarni ključ', key)
    await select(page, 'Primarna smer', 'desc')
    await expectIds(page, ['web-01'])
  }
})

test('K01: razvrščanje ne spreminja podatkov in ne piše', async ({ page }) => {
  const writes = await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'status')
  await select(page, 'Sekundarna smer', 'desc')
  await board(page)
  await table(page)
  await expect(page.getByText('Pregled vsebine', { exact: true })).toHaveCount(2)
  await click(page, 'Izvorni vrstni red')
  await expectIds(page, webIds())
  await readonly(page, writes)
})

test('L01: vsi ID-ji enkrat in prave podrobnosti pri enakih naslovih', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  const all = await ids(page)
  expect(all.length).toBe(new Set(all).size)
  expect(new Set(all)).toEqual(new Set(webIds()))
  await details(page, 'web-03')
  await details(page, 'web-02')
})

test('L02: pri 390 pikah se stran ne razširi', async ({ page }) => {
  await mount(page)
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy()
  await select(page, 'Primarni ključ', 'dueDate')
  await board(page)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy()
})
