import { test, expect, mount, makeTask, expectIds, select, board, columnIds, click, project, details, readonly } from '../development/helpers.ts'

const records = [
  makeTask('a', { title: 'Alfa 10', assignee: 'Črt' }),
  makeTask('b', { title: 'alfa 2', assignee: 'Ana' }),
  makeTask('c', { title: 'Čas', assignee: 'Živa' }),
  makeTask('d', { title: 'cas', assignee: 'Božena' }),
  makeTask('e', { title: 'Zapis', assignee: 'Maja' }),
]

test('R01, R02, R04 and R06: deterministic text order, direction and stable ties', async ({ page }) => {
  await mount(page, records)
  await expectIds(page, ['a', 'b', 'c', 'd', 'e'])
  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, ['a', 'b', 'c', 'd', 'e'])
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['e', 'c', 'd', 'b', 'a'])
  await select(page, 'Primarni ključ', 'original')
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['a', 'b', 'c', 'd', 'e'])
})

test('R03 and R05: status, chronological dates and independent secondary direction', async ({ page }) => {
  const statusRecords = [
    makeTask('todo-2', { title: 'B', status: 'todo', dueDate: '2026-10-02' }),
    makeTask('todo-1', { title: 'A', status: 'todo', dueDate: '2026-10-01' }),
    makeTask('work', { title: 'C', status: 'in_progress', dueDate: '2026-09-30' }),
    makeTask('done', { title: 'D', status: 'done', dueDate: '2026-10-03' }),
  ]
  await mount(page, statusRecords)
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await expectIds(page, ['todo-1', 'todo-2', 'work', 'done'])
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['todo-2', 'todo-1', 'work', 'done'])
  await select(page, 'Primarni ključ', 'dueDate')
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['done', 'todo-2', 'todo-1', 'work'])
})

test('R07 and R08: board order and preservation across view and details', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'dueDate')
  await board(page)
  await columnIds(page, 'Pripravljeno', ['web-07', 'web-02', 'web-04', 'web-08'])
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await page.getByRole('button', { name: 'Preglednica', exact: true }).click()
  await details(page, 'web-01')
  await expect(page.getByRole('combobox', { name: 'Primarni ključ', exact: true })).toHaveValue('dueDate')
  await expect(page.getByRole('combobox', { name: 'Sekundarna smer', exact: true })).toHaveValue('desc')
})

test('R09 and R10: reset, project reset, refresh reset and boundary projects', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await click(page, 'Izvorni vrstni red')
  await expect(page.getByRole('combobox', { name: 'Primarni ključ', exact: true })).toHaveValue('original')
  await project(page, 'launch')
  await expectIds(page, ['launch-01', 'launch-02'])
  await select(page, 'Primarni ključ', 'title')
  await page.reload()
  await expect(page.getByRole('combobox', { name: 'Primarni ključ', exact: true })).toHaveValue('original')
  await expect(await page.evaluate(() => localStorage.length)).toBe(0)
  await expect(page.url()).not.toContain('primary')
  await mount(page, [], '#/projects/web')
  const primaryKeys = ['original', 'title', 'assignee', 'status', 'dueDate']
  const secondaryKeys = ['none', 'title', 'assignee', 'status', 'dueDate']
  const directions = ['asc', 'desc']
  for (const primary of primaryKeys) {
    for (const primaryDirection of directions) {
      for (const secondary of secondaryKeys) {
        for (const secondaryDirection of directions) {
          await select(page, 'Primarni ključ', primary)
          await select(page, 'Primarna smer', primaryDirection)
          await select(page, 'Sekundarni ključ', secondary)
          await select(page, 'Sekundarna smer', secondaryDirection)
          await expect(page.locator('[data-task-id]')).toHaveCount(0)
        }
      }
    }
  }
  await mount(page, [makeTask('only', { projectId: 'launch' })], '#/projects/launch')
  for (const primary of primaryKeys) {
    for (const primaryDirection of directions) {
      for (const secondary of secondaryKeys) {
        for (const secondaryDirection of directions) {
          await select(page, 'Primarni ključ', primary)
          await select(page, 'Primarna smer', primaryDirection)
          await select(page, 'Sekundarni ključ', secondary)
          await select(page, 'Sekundarna smer', secondaryDirection)
          await expectIds(page, ['only'])
        }
      }
    }
  }
})

test('R11 and R12: read-only projection, unique IDs, correct details and narrow layout', async ({ page }) => {
  const duplicateRecords = [
    makeTask('first', { title: 'Enak naslov', assignee: 'Ana', dueDate: '2026-10-01' }),
    makeTask('second', { title: 'Enak naslov', assignee: 'Božena', dueDate: '2026-10-02' }),
  ]
  const writes = await mount(page, duplicateRecords)
  await select(page, 'Primarni ključ', 'assignee')
  await expect(page.locator('[data-task-id]')).toHaveCount(2)
  await details(page, 'first')
  await details(page, 'second')
  await readonly(page, writes)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.reload()
  await expect(page.locator('[data-task-id]')).toHaveCount(2)
  await readonly(page, writes)
})
