import { test, expect, mount, expectIds, ids, select, board, table, columnIds, click, readonly, project, type Task, makeTask } from '../development/helpers.ts'

const base: Task[] = [
  makeTask('t-01', { title: 'Alfa', assignee: 'Ana', status: 'in_progress', dueDate: '2026-09-18' }),
  makeTask('t-02', { title: 'beta', assignee: 'ana', status: 'todo', dueDate: '2026-09-22' }),
  makeTask('t-03', { title: 'Gama', assignee: 'Ana', status: 'done', dueDate: '2026-09-16' }),
  makeTask('t-04', { title: 'delta', assignee: 'Maja', status: 'todo', dueDate: '2026-09-28' }),
  makeTask('t-05', { title: 'Epsilon', assignee: 'Maja', status: 'in_progress', dueDate: '2026-09-29' }),
  makeTask('t-06', { title: 'Zeta', assignee: 'Živa', status: 'done', dueDate: '2026-09-21' }),
]

const value = (page: Parameters<typeof ids>[0], name: string) => page.getByRole('combobox', { name, exact: true })

test('R01/R06/R11: defaults, original ignores other controls, no writes', async ({ page }) => {
  const writes = await mount(page)
  await expectIds(page, ['t-01', 't-02', 't-03', 't-04', 't-05', 't-06'])
  await expect(value(page, 'Primarni ključ')).toHaveValue('original')
  await expect(value(page, 'Primarna smer')).toHaveValue('asc')
  await expect(value(page, 'Sekundarni ključ')).toHaveValue('none')
  await expect(value(page, 'Sekundarna smer')).toHaveValue('asc')
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['t-01', 't-02', 't-03', 't-04', 't-05', 't-06'])
  await readonly(page, writes)
})

test('R02: title and assignee use NFD-stripped lowercase UTF-16 order', async ({ page }) => {
  const unicode: Task[] = [
    makeTask('u-01', { title: 'Žaba', assignee: 'Živa' }),
    makeTask('u-02', { title: 'človek', assignee: 'Črt' }),
    makeTask('u-03', { title: 'Ces', assignee: 'ana' }),
    makeTask('u-04', { title: 'cesta', assignee: 'Bojan' }),
    makeTask('u-05', { title: 'Drevo', assignee: 'cvetka' }),
  ]
  await mount(page, unicode)
  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, ['u-03', 'u-04', 'u-02', 'u-05', 'u-01'])
  await select(page, 'Primarni ključ', 'assignee')
  await expectIds(page, ['u-03', 'u-04', 'u-05', 'u-02', 'u-01'])
})

test('R03: status ranks and dueDate chronology, both directions', async ({ page }) => {
  await mount(page, base)
  await select(page, 'Primarni ključ', 'status')
  await expectIds(page, ['t-02', 't-04', 't-01', 't-05', 't-03', 't-06'])
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['t-03', 't-06', 't-01', 't-05', 't-02', 't-04'])
  await select(page, 'Primarni ključ', 'dueDate')
  await select(page, 'Primarna smer', 'asc')
  await expectIds(page, ['t-03', 't-01', 't-06', 't-02', 't-04', 't-05'])
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['t-05', 't-04', 't-02', 't-06', 't-01', 't-03'])
})

test('R04/R06: desc reverses only the key and ties keep source order', async ({ page }) => {
  const ties: Task[] = [
    makeTask('s-01', { title: 'Isto', assignee: 'Ana', dueDate: '2026-01-02' }),
    makeTask('s-02', { title: 'isto', assignee: 'ana', dueDate: '2026-01-02' }),
    makeTask('s-03', { title: 'Isto', assignee: 'Ana', dueDate: '2026-01-02' }),
    makeTask('s-04', { title: 'Drugo', assignee: 'Bojan', dueDate: '2026-01-01' }),
  ]
  await mount(page, ties)
  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, ['s-04', 's-01', 's-02', 's-03'])
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['s-01', 's-02', 's-03', 's-04'])
  await select(page, 'Primarni ključ', 'dueDate')
  await expectIds(page, ['s-01', 's-02', 's-03', 's-04'])
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['s-01', 's-02', 's-03', 's-04'])
})

test('R05: secondary applies on primary ties with independent direction', async ({ page }) => {
  await mount(page, base)
  await select(page, 'Primarni ključ', 'assignee')
  await select(page, 'Sekundarni ključ', 'title')
  await expectIds(page, ['t-01', 't-02', 't-04', 't-05', 't-06'])
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['t-02', 't-01', 't-05', 't-04', 't-06'])
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['t-06', 't-05', 't-04', 't-02', 't-01'])
})

test('R07: board columns keep constant order and the sorted relative order', async ({ page }) => {
  await mount(page, base)
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await board(page)
  await expect(page.getByRole('region', { name: 'Tabla opravil' }).getByRole('region')).toHaveCount(3)
  await columnIds(page, 'Pripravljeno', ['t-04', 't-02'])
  await columnIds(page, 'V delu', ['t-05', 't-01'])
  await columnIds(page, 'Končano', ['t-06', 't-03'])
})

test('R08: view switch and details keep all four settings', async ({ page }) => {
  await mount(page, base)
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await board(page)
  await expect(value(page, 'Primarni ključ')).toHaveValue('status')
  await expect(value(page, 'Sekundarni ključ')).toHaveValue('dueDate')
  await expect(value(page, 'Sekundarna smer')).toHaveValue('desc')
  await columnIds(page, 'Končano', ['t-06', 't-03'])
  await page.locator('[data-task-id="t-06"]').getByRole('link').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(value(page, 'Primarni ključ')).toHaveValue('status')
  await columnIds(page, 'Končano', ['t-06', 't-03'])
  await table(page)
  await expectIds(page, ['t-04', 't-02', 't-05', 't-01', 't-06', 't-03'])
})

test('R09: project change and refresh reset settings; nothing persisted', async ({ page }) => {
  await mount(page, base)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarni smer', 'desc')
  await select(page, 'Sekundarni ključ', 'status')
  await select(page, 'Sekundarna smer', 'desc')
  await project(page, 'launch')
  const defaults = { 'Primarni ključ': 'original', 'Primarna smer': 'asc', 'Sekundarni ključ': 'none', 'Sekundarna smer': 'asc' }
  for (const [name, expected] of Object.entries(defaults)) await expect(value(page, name)).toHaveValue(expected)
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Spletna prenova', exact: true }).click()
  await expect(value(page, 'Primarni ključ')).toHaveValue('original')
  await select(page, 'Primarni ključ', 'assignee')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await page.reload()
  await expect(value(page, 'Primarni ključ')).toHaveValue('original')
  await expect(value(page, 'Sekundarni ključ')).toHaveValue('none')
  expect(page.url()).not.toContain('sort')
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0])
})

test('R10: reset button restores all four controls', async ({ page }) => {
  await mount(page, base)
  await select(page, 'Primarni ključ', 'assignee')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await click(page, 'Izvorni vrstni red')
  await expect(value(page, 'Primarni ključ')).toHaveValue('original')
  await expect(value(page, 'Primarna smer')).toHaveValue('asc')
  await expect(value(page, 'Sekundarni ključ')).toHaveValue('none')
  await expect(value(page, 'Sekundarna smer')).toHaveValue('asc')
  await expectIds(page, ['t-01', 't-02', 't-03', 't-04', 't-05', 't-06'])
})

test('R10: empty and single-task projects work for every key and direction', async ({ page }) => {
  await mount(page, [])
  await expect(value(page, 'Primarni ključ')).toBeVisible()
  for (const key of ['original', 'title', 'assignee', 'status', 'dueDate']) {
    for (const direction of ['asc', 'desc']) {
      await select(page, 'Primarni ključ', key)
      await select(page, 'Primarna smer', direction)
      await select(page, 'Sekundarni ključ', key === 'original' ? 'none' : key)
      await select(page, 'Sekundarna smer', direction)
      await expect(value(page, 'Primarni ključ')).toHaveValue(key)
    }
  }
  await board(page)
  await expect(page.getByRole('region', { name: 'Tabla opravil' }).getByRole('region')).toHaveCount(3)
  await table(page)
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()

  await mount(page, [makeTask('one-01', { title: 'Edino opravilo' })])
  for (const key of ['original', 'title', 'assignee', 'status', 'dueDate']) {
    for (const direction of ['asc', 'desc']) {
      await select(page, 'Primarni ključ', key)
      await select(page, 'Primarna smer', direction)
      await select(page, 'Sekundarni ključ', key === 'original' ? 'none' : key)
      await expectIds(page, ['one-01'])
    }
  }
  await board(page)
  await expect(page.getByRole('region', { name: 'Pripravljeno' }).locator('[data-task-id]')).toHaveCount(1)
})

test('R12: equal titles stay unique and open the right details by ID', async ({ page }) => {
  const duplicates: Task[] = [
    makeTask('d-01', { title: 'Enak naslov', assignee: 'Ana Novak' }),
    makeTask('d-02', { title: 'Enak naslov', assignee: 'Luka Kovač' }),
  ]
  const writes = await mount(page, duplicates)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  expect(await ids(page)).toEqual(['d-01', 'd-02'])
  expect(new Set(await ids(page)).size).toBe(2)
  await page.locator('[data-task-id="d-02"]').getByRole('link').click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: 'Enak naslov' })).toBeVisible()
  await expect(dialog.getByText('Luka Kovač', { exact: true })).toBeVisible()
  await expect(dialog.getByText('d-02', { exact: true }).first()).toBeVisible()
  await page.keyboard.press('Escape')
  await readonly(page, writes)
})
