import { expect, test, mount, makeTask, ids, expectIds, select, click, board, table, columnIds, readonly, details, project, summary, webIds } from '../development/helpers.ts'

const unicode = [
  makeTask('u4', { title: 'Ábel', dueDate: '2026-01-04' }),
  makeTask('u2', { title: 'Cesta', dueDate: '2026-01-01' }),
  makeTask('u1', { title: 'čšž', dueDate: '2026-01-02' }),
  makeTask('u3', { title: 'cesta', dueDate: '2026-01-03' }),
]

test('A: R02/R04/R06 normalization, stability and original', async ({ page }) => {
  await mount(page, unicode)
  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, ['u4', 'u2', 'u3', 'u1'])
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['u1', 'u2', 'u3', 'u4'])
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Primarni ključ', 'original')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['u4', 'u2', 'u1', 'u3'])
  await click(page, 'Izvorni vrstni red')
  await expectIds(page, ['u4', 'u2', 'u1', 'u3'])
})

test('B: R03/R05 status ranks, dueDate chronology, same secondary key', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Sekundarni ključ', 'status')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['web-02', 'web-04', 'web-07', 'web-08', 'web-01', 'web-05', 'web-03', 'web-06'])
  await select(page, 'Primarni ključ', 'dueDate')
  await expectIds(page, ['web-03', 'web-01', 'web-07', 'web-06', 'web-02', 'web-04', 'web-05', 'web-08'])
})

test('C: R08 view switch and details keep settings and order', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'assignee')
  await select(page, 'Primarna smer', 'desc')
  await board(page)
  await expect(page.getByRole('combobox', { name: 'Primarni ključ', exact: true })).toHaveValue('assignee')
  await expect(page.getByRole('combobox', { name: 'Primarna smer', exact: true })).toHaveValue('desc')
  await columnIds(page, 'Pripravljeno', ['web-04', 'web-08', 'web-02', 'web-07'])
  await details(page, 'web-08')
  await expect(page.getByRole('combobox', { name: 'Primarni ključ', exact: true })).toHaveValue('assignee')
  await table(page)
  await expectIds(page, ['web-06', 'web-04', 'web-08', 'web-02', 'web-07', 'web-01', 'web-03', 'web-05'])
})

test('D: R09 project switch and reload reset settings, no storage or URL state', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await project(page, 'launch')
  await expect(page.getByRole('combobox', { name: 'Primarni ključ', exact: true })).toHaveValue('original')
  await expect(page.getByRole('combobox', { name: 'Sekundarni ključ', exact: true })).toHaveValue('none')
  await expectIds(page, ['launch-01', 'launch-02'])
  await project(page, 'web')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Spletna prenova', exact: true })).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Sekundarni ključ', exact: true })).toHaveValue('none')
  const state = await page.evaluate(() => ({ hash: location.hash, ls: localStorage.length, ss: sessionStorage.length }))
  expect(state).toEqual({ hash: '#/projects/web', ls: 0, ss: 0 })
})

test('E1: R10 empty project works at all keys and directions', async ({ page }) => {
  await mount(page, [makeTask('l1', { projectId: 'launch' })])
  await expect(page.getByText('V tem projektu še ni opravil')).toBeVisible()
  for (const key of ['original', 'title', 'assignee', 'status', 'dueDate']) {
    await select(page, 'Primarni ključ', key)
    await select(page, 'Primarna smer', 'desc')
    await select(page, 'Primarna smer', 'asc')
  }
  await click(page, 'Izvorni vrstni red')
})

test('E2: R10 single-task project works at all keys and directions', async ({ page }) => {
  await mount(page, [makeTask('solo', { title: 'Samo opravilo' })])
  for (const key of ['original', 'title', 'assignee', 'status', 'dueDate']) {
    await select(page, 'Primarni ključ', key)
    await select(page, 'Primarna smer', 'desc')
    await expectIds(page, ['solo'])
    await select(page, 'Primarna smer', 'asc')
  }
})

test('F: R01/R07/R11/R12 projection, board columns, counts, ids and 390 px', async ({ page }) => {
  const writes = await mount(page)
  await expectIds(page, webIds())
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await summary(page, [4, 2, 2])
  await board(page)
  await columnIds(page, 'Pripravljeno', ['web-07', 'web-02', 'web-04', 'web-08'])
  await columnIds(page, 'V delu', ['web-01', 'web-05'])
  await columnIds(page, 'Končano', ['web-03', 'web-06'])
  const shown = await ids(page)
  expect(new Set(shown).size).toBe(shown.length)
  await details(page, 'web-02')
  await table(page)
  const rows = await page.locator('[data-task-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-task-id')))
  expect(rows).toEqual(['web-07', 'web-02', 'web-04', 'web-08', 'web-01', 'web-05', 'web-03', 'web-06'])
  expect(new Set(rows).size).toBe(8)
  await expect(page.locator('[aria-label="Pregled stanj opravil"]')).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  await readonly(page, writes)
})
