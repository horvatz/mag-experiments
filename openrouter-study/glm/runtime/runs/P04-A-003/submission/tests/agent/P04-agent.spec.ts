import { board, click, columnIds, details, expectIds, makeTask, mount, project, readonly, select, summary, table, type Task } from '../development/helpers.ts'
import { expect, test } from '../development/helpers.ts'

const records: Task[] = [
  makeTask('a-1', { title: 'Alfa 10', assignee: 'Črt', status: 'done', dueDate: '2026-03-04' }),
  makeTask('a-2', { title: 'alfa 2', assignee: 'žaba', status: 'todo', dueDate: '2026-03-02' }),
  makeTask('a-3', { title: 'Žaba', assignee: 'Zaba', status: 'in_progress', dueDate: '2026-03-03' }),
  makeTask('a-4', { title: 'Žaba', assignee: 'Ana', status: 'done', dueDate: '2026-03-01' }),
  makeTask('a-5', { title: 'Čebula', assignee: 'ana', status: 'todo', dueDate: '2026-03-05' }),
  makeTask('a-6', { title: 'čebula', assignee: 'Maja', status: 'in_progress', dueDate: '2026-03-01' }),
  makeTask('a-7', { title: '=SUM(A1)', assignee: 'Luka', status: 'todo', dueDate: '2026-03-01' }),
  makeTask('a-8', { title: '=SUM(A1)', assignee: 'Luka', status: 'done', dueDate: '2026-03-02' }),
]

const selectedValues = (page: Parameters<typeof mount>[0]) => Promise.all([
  page.locator('#primary-sort-key').inputValue(),
  page.locator('#primary-sort-direction').inputValue(),
  page.locator('#secondary-sort-key').inputValue(),
  page.locator('#secondary-sort-direction').inputValue(),
])

test('A01: normalization, key order, directions, stable ties and reset are pure', async ({ page }) => {
  const writes = await mount(page, records)
  await summary(page, [3, 2, 3])
  await expect(selectedValues(page)).resolves.toEqual(['original', 'asc', 'none', 'asc'])
  await expectIds(page, ['a-1', 'a-2', 'a-3', 'a-4', 'a-5', 'a-6', 'a-7', 'a-8'])

  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, ['a-7', 'a-8', 'a-1', 'a-2', 'a-5', 'a-6', 'a-3', 'a-4'])
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['a-3', 'a-4', 'a-5', 'a-6', 'a-2', 'a-1', 'a-7', 'a-8'])

  await select(page, 'Primarni ključ', 'assignee')
  await select(page, 'Primarna smer', 'asc')
  await expectIds(page, ['a-4', 'a-5', 'a-1', 'a-7', 'a-8', 'a-6', 'a-2', 'a-3'])

  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['a-5', 'a-2', 'a-7', 'a-3', 'a-6', 'a-4', 'a-1', 'a-8'])

  await select(page, 'Primarni ključ', 'dueDate')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'none')
  await expectIds(page, ['a-5', 'a-1', 'a-3', 'a-2', 'a-8', 'a-4', 'a-6', 'a-7'])
  await select(page, 'Primarna smer', 'asc')
  await expectIds(page, ['a-4', 'a-6', 'a-7', 'a-2', 'a-8', 'a-3', 'a-1', 'a-5'])

  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'asc')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['a-8', 'a-7', 'a-1', 'a-2', 'a-5', 'a-6', 'a-3', 'a-4'])

  await select(page, 'Primarni ključ', 'original')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['a-1', 'a-2', 'a-3', 'a-4', 'a-5', 'a-6', 'a-7', 'a-8'])

  await click(page, 'Izvorni vrstni red')
  await expect(selectedValues(page)).resolves.toEqual(['original', 'asc', 'none', 'asc'])
  await expectIds(page, ['a-1', 'a-2', 'a-3', 'a-4', 'a-5', 'a-6', 'a-7', 'a-8'])
  await summary(page, [3, 2, 3])
  await readonly(page, writes)
})

test('A02: board and details preserve one sorted order', async ({ page }) => {
  await mount(page, records)
  await select(page, 'Primarni ključ', 'dueDate')
  await select(page, 'Primarna smer', 'desc')
  await board(page)
  await columnIds(page, 'Pripravljeno', ['a-5', 'a-2', 'a-7'])
  await columnIds(page, 'V delu', ['a-3', 'a-6'])
  await columnIds(page, 'Končano', ['a-1', 'a-8', 'a-4'])
  await expect(selectedValues(page)).resolves.toEqual(['dueDate', 'desc', 'none', 'asc'])

  await table(page)
  await expectIds(page, ['a-5', 'a-1', 'a-3', 'a-2', 'a-8', 'a-4', 'a-6', 'a-7'])
  await expect(selectedValues(page)).resolves.toEqual(['dueDate', 'desc', 'none', 'asc'])

  await details(page, 'a-4')
  await expectIds(page, ['a-5', 'a-1', 'a-3', 'a-2', 'a-8', 'a-4', 'a-6', 'a-7'])
  await expect(selectedValues(page)).resolves.toEqual(['dueDate', 'desc', 'none', 'asc'])
})

test('A03: project switch and refresh start from defaults', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await project(page, 'launch')
  await expect(selectedValues(page)).resolves.toEqual(['original', 'asc', 'none', 'asc'])

  await project(page, 'web')
  await expect(selectedValues(page)).resolves.toEqual(['original', 'asc', 'none', 'asc'])
  await select(page, 'Primarni ključ', 'dueDate')
  await select(page, 'Primarna smer', 'desc')
  await page.reload()
  await expect(selectedValues(page)).resolves.toEqual(['original', 'asc', 'none', 'asc'])
  expect(page.url()).not.toContain('sort')
  expect(await page.evaluate(() => Object.keys(window.localStorage))).toEqual([])
})

test('A04: an empty project works in both views and stays read-only', async ({ page }) => {
  const writes = await mount(page, [])
  await expectIds(page, [])
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'status')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, [])
  await board(page)
  await columnIds(page, 'Pripravljeno', [])
  await columnIds(page, 'V delu', [])
  await columnIds(page, 'Končano', [])
  await click(page, 'Izvorni vrstni red')
  await expect(selectedValues(page)).resolves.toEqual(['original', 'asc', 'none', 'asc'])
  await readonly(page, writes)
})

test('A05: one task works with every control path', async ({ page }) => {
  const single = [makeTask('only', { title: 'Eno opravilo', status: 'in_progress', dueDate: '2026-04-01' })]
  await mount(page, single)
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['only'])
  await click(page, 'Izvorni vrstni red')
  await expectIds(page, ['only'])
})

test('A06: duplicate titles remain identified by ID', async ({ page }) => {
  const duplicateTitle = [
    makeTask('first', { title: 'Enako ime', dueDate: '2026-04-01' }),
    makeTask('second', { title: 'Enako ime', status: 'done', dueDate: '2026-04-02' }),
  ]
  await mount(page, duplicateTitle)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['second', 'first'])
  expect(await page.locator('[data-task-id]').count()).toBe(2)
  await details(page, 'second')
  await details(page, 'first')
})
