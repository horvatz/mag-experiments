import { test, expect, mount, makeTask, ids, expectIds, select, click, board, table, project, details, columnIds, readonly } from '../development/helpers.ts'
import type { Task } from '../development/helpers.ts'

const controls = {
  primary: (page: Parameters<typeof select>[0]) => page.getByRole('combobox', { name: 'Primarni ključ', exact: true }),
  primaryDirection: (page: Parameters<typeof select>[0]) => page.getByRole('combobox', { name: 'Primarna smer', exact: true }),
  secondary: (page: Parameters<typeof select>[0]) => page.getByRole('combobox', { name: 'Sekundarni ključ', exact: true }),
  secondaryDirection: (page: Parameters<typeof select>[0]) => page.getByRole('combobox', { name: 'Sekundarna smer', exact: true }),
}

async function expectControls(page: Parameters<typeof select>[0], values: string[]) {
  await expect(controls.primary(page)).toHaveValue(values[0])
  await expect(controls.primaryDirection(page)).toHaveValue(values[1])
  await expect(controls.secondary(page)).toHaveValue(values[2])
  await expect(controls.secondaryDirection(page)).toHaveValue(values[3])
}

const normalization: Task[] = [
  makeTask('n-01', { title: 'Čas' }),
  makeTask('n-02', { title: 'Cesnja' }),
  makeTask('n-03', { title: 'Alfa 10' }),
  makeTask('n-04', { title: 'alfa 2' }),
  makeTask('n-05', { title: 'Ärger' }),
  makeTask('n-06', { title: 'Žoga' }),
  makeTask('n-07', { title: 'cas' }),
]

const ties: Task[] = [
  makeTask('t-01', { title: 'Beta', assignee: 'Ana', status: 'todo', dueDate: '2026-05-03' }),
  makeTask('t-02', { title: 'alfa', assignee: 'Ana', status: 'done', dueDate: '2026-05-01' }),
  makeTask('t-03', { title: 'Gama', assignee: 'Ana', status: 'in_progress', dueDate: '2026-05-02' }),
  makeTask('t-04', { title: 'Delta', assignee: 'Bojan', status: 'todo', dueDate: '2026-05-04' }),
]

test('R01: default controls and option values', async ({ page }) => {
  await mount(page, normalization)
  await expectControls(page, ['original', 'asc', 'none', 'asc'])
  const optionValues = (name: string) => page.getByRole('combobox', { name, exact: true }).locator('option').evaluateAll((nodes) => nodes.map((node) => (node as HTMLOptionElement).value))
  expect(await optionValues('Primarni ključ')).toEqual(['original', 'title', 'assignee', 'status', 'dueDate'])
  expect(await optionValues('Primarna smer')).toEqual(['asc', 'desc'])
  expect(await optionValues('Sekundarni ključ')).toEqual(['none', 'title', 'assignee', 'status', 'dueDate'])
  expect(await optionValues('Sekundarna smer')).toEqual(['asc', 'desc'])
  await expectIds(page, ['n-01', 'n-02', 'n-03', 'n-04', 'n-05', 'n-06', 'n-07'])
})

test('R02: NFD normalization, case folding and UTF-16 order', async ({ page }) => {
  await mount(page, normalization)
  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, ['n-03', 'n-04', 'n-05', 'n-01', 'n-07', 'n-02', 'n-06'])
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['n-06', 'n-02', 'n-01', 'n-07', 'n-05', 'n-04', 'n-03'])
})

test('R03: status rank and chronological dueDate', async ({ page }) => {
  await mount(page, ties)
  await select(page, 'Primarni ključ', 'status')
  await expectIds(page, ['t-01', 't-04', 't-03', 't-02'])
  await select(page, 'Primarni ključ', 'dueDate')
  await expectIds(page, ['t-02', 't-03', 't-01', 't-04'])
})

test('R04: desc reverses only the comparison, ties keep source order', async ({ page }) => {
  await mount(page, ties)
  await select(page, 'Primarni ključ', 'assignee')
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['t-04', 't-01', 't-02', 't-03'])
})

test('R05: secondary key only on primary tie, independent direction', async ({ page }) => {
  await mount(page, ties)
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['t-04', 't-01', 't-03', 't-02'])
})

test('R06: equal keys, source tiebreak and original always wins', async ({ page }) => {
  await mount(page, ties)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['t-02', 't-01', 't-04', 't-03'])
  await select(page, 'Primarni ključ', 'original')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['t-01', 't-02', 't-03', 't-04'])
})

test('R07: board keeps fixed columns and relative sorted order', async ({ page }) => {
  await mount(page, ties)
  await select(page, 'Primarni ključ', 'title')
  await board(page)
  await columnIds(page, 'Pripravljeno', ['t-01', 't-04'])
  await columnIds(page, 'V delu', ['t-03'])
  await columnIds(page, 'Končano', ['t-02'])
  const headings = await page.locator('.board-column h3').allTextContents()
  expect(headings).toEqual(['Pripravljeno', 'V delu', 'Končano'])
})

test('R08: view switch and details keep all four settings', async ({ page }) => {
  await mount(page, ties)
  await select(page, 'Primarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await board(page)
  await expectControls(page, ['dueDate', 'asc', 'none', 'desc'])
  await table(page)
  await expectControls(page, ['dueDate', 'asc', 'none', 'desc'])
  await details(page, 't-03')
  await expectControls(page, ['dueDate', 'asc', 'none', 'desc'])
  await expectIds(page, ['t-02', 't-03', 't-01', 't-04'])
})

test('R09: project change and reload reset; no sorting state in URL', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Sekundarni ključ', 'status')
  await project(page, 'launch')
  await expectControls(page, ['original', 'asc', 'none', 'asc'])
  await select(page, 'Primarna smer', 'desc')
  await page.reload()
  await expectControls(page, ['original', 'asc', 'none', 'asc'])
  expect(page.url()).not.toContain('sort')
})

test('R10: reset button restores defaults', async ({ page }) => {
  await mount(page, ties)
  await select(page, 'Primarni ključ', 'assignee')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await click(page, 'Izvorni vrstni red')
  await expectControls(page, ['original', 'asc', 'none', 'asc'])
  await expectIds(page, ['t-01', 't-02', 't-03', 't-04'])
})

test('R10: empty and single-task projects work for every key and direction', async ({ page }) => {
  await mount(page, [])
  for (const key of ['original', 'title', 'assignee', 'status', 'dueDate']) {
    await select(page, 'Primarni ključ', key)
    for (const direction of ['asc', 'desc']) await select(page, 'Primarna smer', direction)
    for (const secondary of ['title', 'dueDate']) await select(page, 'Sekundarni ključ', secondary)
    await expectIds(page, [])
  }
})

test('R10: a single-task project works for every key and direction', async ({ page }) => {
  await mount(page, [makeTask('solo-1', { title: 'Samo eno', dueDate: '2026-07-07' })])
  for (const key of ['original', 'title', 'assignee', 'status', 'dueDate']) {
    await select(page, 'Primarni ključ', key)
    await select(page, 'Primarna smer', 'desc')
    await expectIds(page, ['solo-1'])
  }
})

test('R11: sorting is a read-only projection', async ({ page }) => {
  const writes = await mount(page, ties)
  await select(page, 'Primarni ključ', 'assignee')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'status')
  await expectIds(page, ['t-04', 't-01', 't-03', 't-02'])
  await expect(page.locator('[aria-label="Pregled stanj opravil"] strong')).toHaveText(['2', '1', '1'])
  await expect(page.locator('[data-task-id="t-01"] .task-link')).toContainText('Beta')
  await readonly(page, writes)
})

test('R12: each id once, duplicate titles open the right details, 390px fits', async ({ page }) => {
  await mount(page)
  const all = await ids(page)
  expect(all.length).toBe(new Set(all).size)
  await select(page, 'Primarni ključ', 'title')
  await details(page, 'web-03')
  await expect(page.locator('[data-task-id="web-02"]').getByRole('link')).toBeVisible()
  await expect(page.locator('[data-task-id="web-03"]').getByRole('link')).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  await expectControls(page, ['title', 'asc', 'none', 'asc'])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
