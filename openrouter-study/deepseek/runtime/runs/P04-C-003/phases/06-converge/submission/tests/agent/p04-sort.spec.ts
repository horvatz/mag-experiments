import { test, expect, mount, expectIds, webIds, select, board, table, click, readonly, ids, summary, columnIds, project, details, makeTask } from '../development/helpers.ts'

const titleOrder = ['web-07', 'web-04', 'web-05', 'web-01', 'web-08', 'web-02', 'web-03', 'web-06']
const combobox = (page: Parameters<typeof mount>[0], name: string) => page.getByRole('combobox', { name, exact: true })

test('R01 privzeti četverec in izvorni vrstni red', async ({ page }) => {
  await mount(page)
  await expect(combobox(page, 'Primarni ključ')).toHaveValue('original')
  await expect(combobox(page, 'Primarna smer')).toHaveValue('asc')
  await expect(combobox(page, 'Sekundarni ključ')).toHaveValue('none')
  await expect(combobox(page, 'Sekundarna smer')).toHaveValue('asc')
  await expectIds(page, webIds())
})

test('R02 normalizirani nizi brez jezikovnih prilagoditev', async ({ page }) => {
  const records = [
    makeTask('n-01', { title: 'Žaba' }),
    makeTask('n-02', { title: 'čebela' }),
    makeTask('n-03', { title: 'Ábel' }),
    makeTask('n-04', { title: 'a b' }),
    makeTask('n-05', { title: 'drevo' }),
    makeTask('n-06', { title: 'alfa 2' }),
    makeTask('n-07', { title: 'Alfa 10' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, ['n-04', 'n-03', 'n-07', 'n-06', 'n-02', 'n-05', 'n-01'])
})

test('R03 stanje in datumi', async ({ page }) => {
  const records = [
    makeTask('s-01', { status: 'done', dueDate: '2026-01-05' }),
    makeTask('s-02', { status: 'todo', dueDate: '2026-02-01' }),
    makeTask('s-03', { status: 'in_progress', dueDate: '2025-12-31' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'status')
  await expectIds(page, ['s-02', 's-03', 's-01'])
  await select(page, 'Primarni ključ', 'dueDate')
  await expectIds(page, ['s-03', 's-01', 's-02'])
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['s-02', 's-01', 's-03'])
})

test('R04 smer obrne le izbrani ključ', async ({ page }) => {
  const records = [
    makeTask('d-01', { title: 'Ista', assignee: 'Berta' }),
    makeTask('d-02', { title: 'Ista', assignee: 'Ana' }),
    makeTask('d-03', { title: 'Druga', assignee: 'Cilka' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, ['d-03', 'd-01', 'd-02'])
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['d-01', 'd-02', 'd-03'])
})

test('R05 sekundarni ključ ob enakosti z neodvisno smerjo', async ({ page }) => {
  const records = [
    makeTask('x-01', { title: 'Ena', assignee: 'Ana' }),
    makeTask('x-02', { title: 'Ena', assignee: 'Berta' }),
    makeTask('x-03', { title: 'Dva', assignee: 'Cilka' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, ['x-03', 'x-01', 'x-02'])
  await select(page, 'Sekundarni ključ', 'assignee')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['x-03', 'x-02', 'x-01'])
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['x-02', 'x-01', 'x-03'])
  await select(page, 'Sekundarna smer', 'asc')
  await expectIds(page, ['x-01', 'x-02', 'x-03'])
})

test('R06 stabilnost in original', async ({ page }) => {
  const records = [
    makeTask('e-01', { title: 'Ena', assignee: 'Ana' }),
    makeTask('e-02', { title: 'Ena', assignee: 'Ana' }),
    makeTask('e-03', { title: 'Dva', assignee: 'Berta' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Sekundarni ključ', 'title')
  await expectIds(page, ['e-03', 'e-01', 'e-02'])
  await select(page, 'Primarni ključ', 'original')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['e-01', 'e-02', 'e-03'])
})

test('R07 tabla ohrani relativni vrstni red', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'dueDate')
  await board(page)
  await expect(page.locator('.board-column h3')).toHaveText(['Pripravljeno', 'V delu', 'Končano'])
  await columnIds(page, 'Pripravljeno', ['web-07', 'web-02', 'web-04', 'web-08'])
  await columnIds(page, 'V delu', ['web-01', 'web-05'])
  await columnIds(page, 'Končano', ['web-03', 'web-06'])
})

test('R08 preklop pogleda in podrobnosti ohranita vrstni red', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await board(page)
  await expect(combobox(page, 'Primarni ključ')).toHaveValue('title')
  await table(page)
  await expectIds(page, titleOrder)
  await details(page, 'web-07')
  await expectIds(page, titleOrder)
})

test('R09 menjava projekta in osvežitev ponastavita', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Primarna smer', 'desc')
  await project(page, 'launch')
  await expect(combobox(page, 'Primarni ključ')).toHaveValue('original')
  await expect(combobox(page, 'Primarna smer')).toHaveValue('asc')
  await project(page, 'web')
  await expectIds(page, webIds())
  await select(page, 'Primarni ključ', 'title')
  await page.reload()
  await expect(combobox(page, 'Primarni ključ')).toHaveValue('original')
  await expectIds(page, webIds())
  const url = new URL(page.url())
  expect(url.search).toBe('')
  expect(url.hash).not.toContain('primary')
  expect(await page.evaluate(() => [Object.keys(localStorage).length, Object.keys(sessionStorage).length])).toEqual([0, 0])
})

test('R10 gumb Izvorni vrstni red ponastavi vse kontrole', async ({ page }) => {
  const writes = await mount(page)
  await select(page, 'Primarni ključ', 'assignee')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await click(page, 'Izvorni vrstni red')
  await expect(combobox(page, 'Primarni ključ')).toHaveValue('original')
  await expect(combobox(page, 'Primarna smer')).toHaveValue('asc')
  await expect(combobox(page, 'Sekundarni ključ')).toHaveValue('none')
  await expect(combobox(page, 'Sekundarna smer')).toHaveValue('asc')
  await expectIds(page, webIds())
  await readonly(page, writes)
})

test('R10 prazen projekt deluje pri vseh ključih in smereh', async ({ page }) => {
  await mount(page, [])
  await expect(page.getByText('V tem projektu še ni opravil')).toBeVisible()
  for (const key of ['original', 'title', 'assignee', 'status', 'dueDate']) {
    for (const direction of ['asc', 'desc']) {
      await select(page, 'Primarni ključ', key)
      await select(page, 'Primarna smer', direction)
      await select(page, 'Sekundarni ključ', 'dueDate')
      await select(page, 'Sekundarna smer', direction)
      await expect(page.locator('[data-task-id]')).toHaveCount(0)
    }
  }
})

test('R10 eno opravilo deluje pri vseh ključih in smereh', async ({ page }) => {
  await mount(page, [makeTask('one-01')])
  for (const key of ['original', 'title', 'assignee', 'status', 'dueDate']) {
    await select(page, 'Primarni ključ', key)
    await select(page, 'Primarna smer', 'desc')
    await expectIds(page, ['one-01'])
  }
})

test('R11 razvrščanje je projekcija brez zapisov', async ({ page }) => {
  const writes = await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await summary(page, [4, 2, 2])
  await readonly(page, writes)
  const row = page.locator('tr', { hasText: 'web-02' })
  await expect(row.getByText('Pregled vsebine')).toBeVisible()
  await expect(row.getByText('Luka Kovač')).toBeVisible()
  await expect(row.locator('time')).toHaveAttribute('datetime', '2026-09-22')
})

test('R12 ID-ji in podrobnosti ob enakih naslovih', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'title')
  const seen = await ids(page)
  expect(seen.length).toBe(8)
  expect(new Set(seen).size).toBe(8)
  await page.locator('tr', { hasText: 'web-03' }).getByRole('link').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Pregled vsebine' })).toBeVisible()
  await expect(page.getByRole('dialog').getByText('web-03', { exact: true }).first()).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await board(page)
  const onBoard = await ids(page)
  expect(new Set(onBoard).size).toBe(8)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
