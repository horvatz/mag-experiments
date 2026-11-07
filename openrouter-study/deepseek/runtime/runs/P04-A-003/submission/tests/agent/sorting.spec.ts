import { expect, test, mount, makeTask, select, click, ids, expectIds, board, table, columnIds, readonly, details, project, type Task } from '../development/helpers.ts'

const combobox = (page: Parameters<typeof ids>[0], name: string) => page.getByRole('combobox', { name, exact: true })
const reset = (page: Parameters<typeof ids>[0]) => click(page, 'Izvorni vrstni red')
const storageKeys = (page: Parameters<typeof ids>[0]) => page.evaluate(() => [...Object.keys(localStorage), ...Object.keys(sessionStorage)])
const noOverflow = (page: Parameters<typeof ids>[0]) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)

test('A01: normalizirani nizi in leksikografska primerjava po UTF-16', async ({ page }) => {
  const records: Task[] = [
    makeTask('tx-01', { title: 'Čas za pregled', assignee: 'Živa Kovač' }),
    makeTask('tx-02', { title: 'Alfa 10', assignee: 'ana' }),
    makeTask('tx-03', { title: 'alfa 2', assignee: 'Črt' }),
    makeTask('tx-04', { title: 'cesta', assignee: 'Zvon' }),
    makeTask('tx-05', { title: 'Aha', assignee: 'Boris' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, ['tx-05', 'tx-02', 'tx-03', 'tx-01', 'tx-04'])
  await select(page, 'Primarni ključ', 'assignee')
  await expectIds(page, ['tx-02', 'tx-05', 'tx-03', 'tx-01', 'tx-04'])
})

test('A02: sekundarni ključ le ob enakosti, neodvisna smer, enak ključ', async ({ page }) => {
  const records: Task[] = [
    makeTask('tie-01', { title: 'B', status: 'todo', dueDate: '2026-01-02' }),
    makeTask('tie-02', { title: 'B', status: 'done', dueDate: '2026-01-01' }),
    makeTask('tie-03', { title: 'B', status: 'todo', dueDate: '2026-01-01' }),
    makeTask('tie-04', { title: 'A', status: 'done', dueDate: '2026-01-03' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, ['tie-04', 'tie-01', 'tie-02', 'tie-03'])
  await select(page, 'Sekundarni ključ', 'status')
  await expectIds(page, ['tie-04', 'tie-01', 'tie-03', 'tie-02'])
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['tie-04', 'tie-02', 'tie-01', 'tie-03'])
  await select(page, 'Sekundarna smer', 'asc')
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['tie-01', 'tie-03', 'tie-02', 'tie-04'])
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Primarna smer', 'asc')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'asc')
  await expectIds(page, ['tie-03', 'tie-01', 'tie-02', 'tie-04'])
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['tie-04', 'tie-01', 'tie-02', 'tie-03'])
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarna smer', 'asc')
  await expectIds(page, ['tie-01', 'tie-02', 'tie-03', 'tie-04'])
})

test('A03: desc ne obrne izenačenih elementov (stabilnost)', async ({ page }) => {
  const records: Task[] = [
    makeTask('st-01', { title: 'Isto', status: 'todo' }),
    makeTask('st-02', { title: 'isto', status: 'todo' }),
    makeTask('st-03', { title: 'ISTO', status: 'todo' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, ['st-01', 'st-02', 'st-03'])
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['st-01', 'st-02', 'st-03'])
  await select(page, 'Sekundarni ključ', 'status')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['st-01', 'st-02', 'st-03'])
})

test('A04: original vedno vrne izvorni vrstni red ne glede na druge kontrole', async ({ page }) => {
  const records: Task[] = [
    makeTask('or-01', { title: 'B', status: 'done', dueDate: '2026-01-02' }),
    makeTask('or-02', { title: 'A', status: 'todo', dueDate: '2026-01-01' }),
    makeTask('or-03', { title: 'C', status: 'in_progress', dueDate: '2026-01-03' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['or-03', 'or-01', 'or-02'])
  await select(page, 'Primarni ključ', 'original')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['or-01', 'or-02', 'or-03'])
  await reset(page)
  await expectIds(page, ['or-01', 'or-02', 'or-03'])
})

test('A05: tabla ohrani stalne stolpce in relativni vrstni red', async ({ page }) => {
  const records: Task[] = [
    makeTask('bd-01', { title: 'B', status: 'todo', dueDate: '2026-03-03' }),
    makeTask('bd-02', { title: 'A', status: 'done', dueDate: '2026-03-02' }),
    makeTask('bd-03', { title: 'C', status: 'in_progress', dueDate: '2026-03-01' }),
    makeTask('bd-04', { title: 'A', status: 'todo', dueDate: '2026-03-04' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, ['bd-02', 'bd-04', 'bd-01', 'bd-03'])
  await board(page)
  await expect(page.locator('.task-board .board-column h3')).toHaveText(['Pripravljeno', 'V delu', 'Končano'])
  await columnIds(page, 'Pripravljeno', ['bd-04', 'bd-01'])
  await columnIds(page, 'V delu', ['bd-03'])
  await columnIds(page, 'Končano', ['bd-02'])
  await table(page)
  await expectIds(page, ['bd-02', 'bd-04', 'bd-01', 'bd-03'])
})

test('A06: pogled in podrobnosti ohranita nastavitve, projekt in osvežitev ju ponastavita', async ({ page }) => {
  const records: Task[] = [
    makeTask('ps-01', { title: 'Prvo', assignee: 'Ana', status: 'todo', dueDate: '2026-02-02' }),
    makeTask('ps-02', { title: 'Drugo', assignee: 'Bor', status: 'in_progress', dueDate: '2026-02-01' }),
    makeTask('ps-03', { title: 'Tretje', assignee: 'Cilka', status: 'done', dueDate: '2026-02-03' }),
    makeTask('lp-01', { projectId: 'launch', title: 'Launch', assignee: 'Ana', status: 'todo', dueDate: '2026-02-04' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'assignee')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await expectIds(page, ['ps-03', 'ps-02', 'ps-01'])
  await board(page)
  await columnIds(page, 'Končano', ['ps-03'])
  await expect(combobox(page, 'Primarni ključ')).toHaveValue('assignee')
  await expect(combobox(page, 'Primarna smer')).toHaveValue('desc')
  await table(page)
  await expectIds(page, ['ps-03', 'ps-02', 'ps-01'])
  await details(page, 'ps-02')
  await expectIds(page, ['ps-03', 'ps-02', 'ps-01'])
  await expect(combobox(page, 'Sekundarni ključ')).toHaveValue('dueDate')
  expect(await storageKeys(page)).toEqual([])
  expect(page.url()).not.toContain('sort')
  await project(page, 'launch')
  await expect(combobox(page, 'Primarni ključ')).toHaveValue('original')
  await expect(combobox(page, 'Primarna smer')).toHaveValue('asc')
  await expect(combobox(page, 'Sekundarni ključ')).toHaveValue('none')
  await expect(combobox(page, 'Sekundarna smer')).toHaveValue('asc')
  await expectIds(page, ['lp-01'])
  await project(page, 'web')
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await page.reload()
  await expect(combobox(page, 'Primarni ključ')).toHaveValue('original')
  await expectIds(page, ['ps-01', 'ps-02', 'ps-03'])
})

test('A07: gumb Izvorni vrstni red ponastavi vse štiri kontrole', async ({ page }) => {
  await mount(page, [makeTask('rs-01'), makeTask('rs-02')])
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await reset(page)
  await expect(combobox(page, 'Primarni ključ')).toHaveValue('original')
  await expect(combobox(page, 'Primarna smer')).toHaveValue('asc')
  await expect(combobox(page, 'Sekundarni ključ')).toHaveValue('none')
  await expect(combobox(page, 'Sekundarna smer')).toHaveValue('asc')
  await expectIds(page, ['rs-01', 'rs-02'])
})

test('A11: prazen projekt deluje pri vseh ključih in smereh', async ({ page }) => {
  await mount(page, [])
  await expect(page.getByRole('group', { name: 'Razvrščanje opravil' })).toBeVisible()
  for (const key of ['title', 'assignee', 'status', 'dueDate']) {
    for (const direction of ['asc', 'desc']) {
      await select(page, 'Primarni ključ', key)
      await select(page, 'Primarna smer', direction)
      await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
      expect(await noOverflow(page)).toBe(true)
    }
  }
  expect(await ids(page)).toEqual([])
})

test('A12: projekt z enim opravilom deluje pri vseh ključih in smereh', async ({ page }) => {
  await mount(page, [makeTask('one-01')])
  for (const key of ['title', 'assignee', 'status', 'dueDate']) {
    await select(page, 'Primarni ključ', key)
    await expectIds(page, ['one-01'])
  }
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'title')
  await expectIds(page, ['one-01'])
})

test('A08: razvrščanje je projekcija brez zapisov in sprememb števcev', async ({ page }) => {
  const records: Task[] = [
    makeTask('pr-01', { title: 'Prvo', status: 'todo', dueDate: '2026-05-02' }),
    makeTask('pr-02', { title: 'Prvo', status: 'in_progress', dueDate: '2026-05-01' }),
    makeTask('pr-03', { title: 'Tretje', status: 'done', dueDate: '2026-05-03' }),
  ]
  const writes = await mount(page, records)
  await expect(page.locator('[aria-label="Pregled stanj opravil"] strong')).toHaveText(['1', '1', '1'])
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await expectIds(page, ['pr-03', 'pr-02', 'pr-01'])
  await expect(page.locator('[data-task-id="pr-01"] .task-link')).toContainText('Prvo')
  await expect(page.locator('[data-task-id="pr-02"]')).toContainText('V delu')
  await expect(page.locator('[aria-label="Pregled stanj opravil"] strong')).toHaveText(['1', '1', '1'])
  await reset(page)
  await expectIds(page, ['pr-01', 'pr-02', 'pr-03'])
  await readonly(page, writes)
})

test('A09: enaki naslovi odpirajo prave podrobnosti, vsak ID natanko enkrat', async ({ page }) => {
  const records: Task[] = [
    makeTask('du-01', { title: 'Enak naslov', assignee: 'Ana Novak' }),
    makeTask('du-02', { title: 'Enak naslov', assignee: 'Bor Kovač' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, ['du-01', 'du-02'])
  for (const id of ['du-01', 'du-02']) await expect(page.locator(`[data-task-id="${id}"]`)).toHaveCount(1)
  await details(page, 'du-02')
  await details(page, 'du-01')
  await board(page)
  await expect(page.getByRole('region', { name: 'Tabla opravil' })).toBeVisible()
  for (const id of ['du-01', 'du-02']) await expect(page.locator(`[data-task-id="${id}"]`)).toHaveCount(1)
  await page.locator('[data-task-id="du-02"]').getByRole('link').click()
  await expect(page.getByRole('dialog').getByText('Bor Kovač', { exact: true })).toBeVisible()
  await expect(page.getByRole('dialog').getByText('du-02', { exact: true }).first()).toBeVisible()
  await page.keyboard.press('Escape')
})

test('A10: pri 390 piks se stran ne preliva, kontrole so dostopne', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mount(page, [makeTask('mb-01'), makeTask('mb-02'), makeTask('mb-03')])
  await expect(page.getByRole('group', { name: 'Razvrščanje opravil' })).toBeVisible()
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  expect(await noOverflow(page)).toBe(true)
  const box = await page.getByRole('group', { name: 'Razvrščanje opravil' }).boundingBox()
  expect(box!.x).toBeGreaterThanOrEqual(0)
  expect(box!.x + box!.width).toBeLessThanOrEqual(390)
  await board(page)
  expect(await noOverflow(page)).toBe(true)
  await select(page, 'Sekundarni ključ', 'status')
  expect(await noOverflow(page)).toBe(true)
})
