import { test, expect, mount, ids, expectIds, webIds, select, click, board, table, columnIds, project, details, readonly, makeTask } from '../development/helpers.ts'

const stringIds = async (page: import('@playwright/test').Page) =>
  (await ids(page)).filter((value): value is string => value !== null)

const selectValue = (page: import('@playwright/test').Page, name: string, value: string) =>
  expect(page.getByRole('combobox', { name, exact: true })).toHaveValue(value)

const defaults = async (page: import('@playwright/test').Page) => {
  await selectValue(page, 'Primarni ključ', 'original')
  await selectValue(page, 'Primarna smer', 'asc')
  await selectValue(page, 'Sekundarni ključ', 'none')
  await selectValue(page, 'Sekundarna smer', 'asc')
}

test('A01: privzete vrednosti, izvorni vrstni red, brez zapisa v URL', async ({ page }) => {
  await mount(page)
  await defaults(page)
  await expectIds(page, webIds())
  expect(new URL(page.url()).hash).not.toContain('sort')
  const shown = await ids(page)
  expect(new Set(shown).size).toBe(shown.length)
})

test('A02: original kot primarni ključ vedno vrne izvorni vrstni red', async ({ page }) => {
  await mount(page)
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, webIds())
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await expectIds(page, webIds())
})

test('A03: normalizacija NFD, odstranitev združenih znakov in male črke', async ({ page }) => {
  const records = [
    makeTask('n1', { title: 'Čas', assignee: 'Živa' }),
    makeTask('n2', { title: 'cesta', assignee: 'ziva' }),
    makeTask('n3', { title: 'cas', assignee: 'Ana' }),
    makeTask('n4', { title: 'C\u030cas', assignee: 'ana' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, ['n1', 'n3', 'n4', 'n2'])
  await select(page, 'Primarni ključ', 'assignee')
  await expectIds(page, ['n3', 'n4', 'n1', 'n2'])
})

test('A04: primerjava UTF-16 brez jezikovnega in številskega prilagajanja', async ({ page }) => {
  const records = [
    makeTask('u1', { title: 'Zebra' }),
    makeTask('u2', { title: 'alfa 2' }),
    makeTask('u3', { title: 'Alfa 10' }),
    makeTask('u4', { title: '=SUM(A1)' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, ['u4', 'u3', 'u2', 'u1'])
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['u1', 'u2', 'u3', 'u4'])
})

test('A05: status po rangu, dueDate kronološko', async ({ page }) => {
  const records = [
    makeTask('d1', { status: 'done', dueDate: '2026-09-09' }),
    makeTask('d2', { status: 'todo', dueDate: '2026-10-01' }),
    makeTask('d3', { status: 'in_progress', dueDate: '2026-09-10' }),
    makeTask('d4', { status: 'todo', dueDate: '2026-09-09' }),
    makeTask('d5', { status: 'done', dueDate: '2026-09-09' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'status')
  await expectIds(page, ['d2', 'd4', 'd3', 'd1', 'd5'])
  await select(page, 'Primarni ključ', 'dueDate')
  await expectIds(page, ['d1', 'd4', 'd5', 'd3', 'd2'])
})

test('A06: desc ne obrne izenačenih elementov', async ({ page }) => {
  const records = [
    makeTask('t1', { status: 'todo' }),
    makeTask('t2', { status: 'todo' }),
    makeTask('t3', { status: 'todo' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['t1', 't2', 't3'])
})

test('A07: desc obrne samo izid primerjave izbranega ključa', async ({ page }) => {
  const records = [
    makeTask('r1', { title: 'Beta' }),
    makeTask('r2', { title: 'Alfa' }),
    makeTask('r3', { title: 'Gama' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, ['r2', 'r1', 'r3'])
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['r3', 'r1', 'r2'])
})

test('A08: sekundarni ključ z neodvisno smerjo', async ({ page }) => {
  const records = [
    makeTask('s1', { status: 'todo', title: 'Beta' }),
    makeTask('s2', { status: 'todo', title: 'Alfa' }),
    makeTask('s3', { status: 'done', title: 'Gama' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Sekundarni ključ', 'title')
  await expectIds(page, ['s2', 's1', 's3'])
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['s1', 's2', 's3'])
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['s3', 's1', 's2'])
})

test('A09: enak sekundarni in primarni ključ ne doda obrata', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  const withoutSecondary = await stringIds(page)
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, withoutSecondary)
})

test('A10: tabla ohrani stolpce in relativni vrstni red', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'dueDate')
  const sorted = await stringIds(page)
  await board(page)
  const headings = page.locator('.board-column-heading h3')
  await expect(headings).toHaveText(['Pripravljeno', 'V delu', 'Končano'])
  const statuses: Record<string, string> = {
    'web-01': 'in_progress', 'web-02': 'todo', 'web-03': 'done', 'web-04': 'todo',
    'web-05': 'in_progress', 'web-06': 'done', 'web-07': 'todo', 'web-08': 'todo',
  }
  for (const [name, status] of [['Pripravljeno', 'todo'], ['V delu', 'in_progress'], ['Končano', 'done']] as const) {
    await columnIds(page, name, sorted.filter((id) => statuses[id] === status))
  }
  await table(page)
  await expectIds(page, sorted)
})

test('A11: preklop pogleda in podrobnosti ohranita nastavitve', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Sekundarni ključ', 'assignee')
  await select(page, 'Sekundarna smer', 'desc')
  const sorted = await stringIds(page)
  await board(page)
  await table(page)
  await expectIds(page, sorted)
  await selectValue(page, 'Primarni ključ', 'title')
  await selectValue(page, 'Sekundarni ključ', 'assignee')
  await selectValue(page, 'Sekundarna smer', 'desc')
  await details(page, sorted[0])
  await expectIds(page, sorted)
  await selectValue(page, 'Primarni ključ', 'title')
  await selectValue(page, 'Sekundarna smer', 'desc')
})

test('A12: menjava projekta in osvežitev ponastavita nastavitve', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarni ključ', 'assignee')
  await project(page, 'launch')
  await defaults(page)
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Sekundarni ključ', 'title')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Jesenska kampanja', exact: true })).toBeVisible()
  await defaults(page)
  expect(new URL(page.url()).hash).not.toContain('sort')
})

test('A13: gumb Izvorni vrstni red ponastavi vse štiri kontrole', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'assignee')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await click(page, 'Izvorni vrstni red')
  await defaults(page)
  await expectIds(page, webIds())
})

test('A14: prazni projekt deluje pri vseh ključih', async ({ page }) => {
  await mount(page, [])
  await expect(page.getByRole('group', { name: 'Razvrščanje opravil' })).toBeVisible()
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await expect(page.locator('[data-task-id]')).toHaveCount(0)
  await expect(page.locator('[aria-label="Pregled stanj opravil"] strong')).toHaveText(['0', '0', '0'])
  await click(page, 'Izvorni vrstni red')
  await defaults(page)
})

test('A14b: projekt z enim opravilom deluje pri vseh ključih in smereh', async ({ page }) => {
  const single = [makeTask('only-1', { title: 'Edino' })]
  await mount(page, single)
  for (const key of ['title', 'assignee', 'status', 'dueDate']) {
    await select(page, 'Primarni ključ', key)
    for (const direction of ['asc', 'desc']) {
      await select(page, 'Primarna smer', direction)
      await expectIds(page, ['only-1'])
    }
  }
  await expectIds(page, ['only-1'])
})

test('A15: razvrščanje ne piše in ne spreminja podatkov', async ({ page }) => {
  const writes = await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  const row = page.locator('[data-task-id="web-01"]')
  await expect(row).toContainText('Ana Novak')
  await expect(row.locator('time')).toHaveAttribute('datetime', '2026-09-18')
  await details(page, 'web-01')
  await readonly(page, writes)
})

test('A16: enaki naslovi odpirajo prave podrobnosti', async ({ page }) => {
  const records = [
    makeTask('e1', { title: 'Enak naslov', assignee: 'Ana Novak' }),
    makeTask('e2', { title: 'Enak naslov', assignee: 'Luka Kovač' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await page.locator('[data-task-id="e1"]').getByRole('link').click()
  await expect(page.getByRole('dialog').getByText('e1', { exact: true }).first()).toBeVisible()
  await expect(page.getByRole('dialog').getByText('Ana Novak', { exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await page.locator('[data-task-id="e2"]').getByRole('link').click()
  await expect(page.getByRole('dialog').getByText('e2', { exact: true }).first()).toBeVisible()
  await expect(page.getByRole('dialog').getByText('Luka Kovač', { exact: true })).toBeVisible()
})

test('A17: pri 390 piks se stran ne razširi (preglednica in tabla)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await expect(page.getByRole('group', { name: 'Razvrščanje opravil' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await board(page)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await expect(page.getByRole('button', { name: 'Izvorni vrstni red', exact: true })).toBeVisible()
})
