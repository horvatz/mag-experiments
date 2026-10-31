import { board, columnIds, details, expect, expectIds, makeTask, mount, project, readonly, select, test } from '../development/helpers.ts'

const records = [
  makeTask('sort-01', { title: 'Čž', assignee: 'Ana', dueDate: '2026-01-02' }),
  makeTask('sort-02', { title: 'ča', assignee: 'Žana', status: 'in_progress', dueDate: '2026-01-01' }),
  makeTask('sort-03', { title: 'Ča', assignee: 'Ana', status: 'done', dueDate: '2026-01-03' }),
  makeTask('sort-04', { title: 'A', assignee: 'Ana', dueDate: '2026-01-04' }),
  makeTask('sort-05', { title: 'A', assignee: 'Maja', status: 'in_progress', dueDate: '2026-01-05' }),
]

test('A01: normalized keys, directions and stable tie-breaking', async ({ page }) => {
  const writes = await mount(page, records)
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('original')
  await expect(page.getByRole('combobox', { name: 'Primarna smer' })).toHaveValue('asc')
  await expect(page.getByRole('combobox', { name: 'Sekundarni ključ' })).toHaveValue('none')
  await expect(page.getByRole('combobox', { name: 'Sekundarna smer' })).toHaveValue('asc')
  await expectIds(page, records.map(task => task.id))

  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Sekundarni ključ', 'assignee')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['sort-05', 'sort-04', 'sort-02', 'sort-03', 'sort-01'])

  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['sort-01', 'sort-02', 'sort-03', 'sort-05', 'sort-04'])

  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Primarna smer', 'asc')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['sort-04', 'sort-01', 'sort-05', 'sort-02', 'sort-03'])

  await select(page, 'Primarni ključ', 'original')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, records.map(task => task.id))
  await readonly(page, writes)
})

test('A02: board order, details and narrow viewport', async ({ page }) => {
  const writes = await mount(page, records)
  await select(page, 'Primarni ključ', 'dueDate')
  await board(page)
  await columnIds(page, 'Pripravljeno', ['sort-01', 'sort-04'])
  await columnIds(page, 'V delu', ['sort-02', 'sort-05'])
  await columnIds(page, 'Končano', ['sort-03'])
  await details(page, 'sort-05')
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('dueDate')
  await expect(page.getByRole('region', { name: 'Tabla opravil' })).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  await readonly(page, writes)
})

test('A03: project change and reload reset sorting settings', async ({ page }) => {
  const writes = await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await project(page, 'launch')
  await expectIds(page, ['launch-01', 'launch-02'])
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('original')
  await expect(page.getByRole('combobox', { name: 'Primarna smer' })).toHaveValue('asc')
  await expect(page.getByRole('combobox', { name: 'Sekundarni ključ' })).toHaveValue('none')
  await expect(page.getByRole('combobox', { name: 'Sekundarna smer' })).toHaveValue('asc')
  await page.reload()
  await expectIds(page, ['launch-01', 'launch-02'])
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('original')
  await expect(await page.evaluate(() => localStorage.length)).toBe(0)
  await expect(await page.evaluate(() => window.location.hash)).not.toContain('sort')
  await readonly(page, writes)
})

test('A04: empty project accepts sorting settings and reset', async ({ page }) => {
  const writes = await mount(page, [])
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await page.getByRole('button', { name: 'Izvorni vrstni red' }).click()
  await expect(page.locator('[data-task-id]')).toHaveCount(0)
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('original')
  await readonly(page, writes)
})

test('A05: single-task project accepts every key and direction', async ({ page }) => {
  const writes = await mount(page, [makeTask('single-01', { title: 'Eno opravilo', assignee: 'Maja', dueDate: '2026-02-02' })])
  for (const key of ['original', 'title', 'assignee', 'status', 'dueDate']) {
    await select(page, 'Primarni ključ', key)
    await expectIds(page, ['single-01'])
  }
  for (const direction of ['asc', 'desc']) {
    await select(page, 'Primarna smer', direction)
    await select(page, 'Sekundarna smer', direction)
    await expectIds(page, ['single-01'])
  }
  await readonly(page, writes)
})
