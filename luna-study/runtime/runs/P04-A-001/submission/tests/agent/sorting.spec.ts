import { expect, test } from '../development/helpers.ts'
import { details, makeTask, mount, select, table, board, columnIds, ids, project, readonly, summary } from '../development/helpers.ts'

test('P04: normalized UTF-16 sorting, numeric text, stable ties and independent directions', async ({ page }) => {
  const records = [
    makeTask('x1', { title: 'Élan', assignee: 'Živa' }),
    makeTask('x2', { title: 'a2', assignee: 'Ana' }),
    makeTask('x3', { title: 'A10', assignee: 'Črt' }),
    makeTask('x4', { title: 'elan', assignee: 'ana' }),
    makeTask('x5', { title: 'ÉLAN', assignee: 'Ziva' }),
    makeTask('x6', { title: 'Čaj', assignee: 'Črt' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await expect.poll(() => ids(page)).toEqual(['x3', 'x2', 'x6', 'x1', 'x4', 'x5'])
  await select(page, 'Primarna smer', 'desc')
  await expect.poll(() => ids(page)).toEqual(['x1', 'x4', 'x5', 'x6', 'x2', 'x3'])
  await select(page, 'Primarni ključ', 'assignee')
  await select(page, 'Primarna smer', 'asc')
  await expect.poll(() => ids(page)).toEqual(['x2', 'x4', 'x3', 'x6', 'x1', 'x5'])

  const ties = [
    makeTask('t1', { title: 'Skupina', assignee: 'Ana', status: 'todo', dueDate: '2026-09-22' }),
    makeTask('t2', { title: 'Skupina', assignee: 'Zoe', status: 'todo', dueDate: '2026-09-20' }),
    makeTask('t3', { title: 'Drugo', assignee: 'Maja', status: 'done', dueDate: '2026-09-21' }),
    makeTask('t4', { title: 'Skupina', assignee: 'Ana', status: 'todo', dueDate: '2026-09-18' }),
  ]
  await mount(page, ties)
  await page.reload()
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await expect.poll(() => ids(page)).toEqual(['t3', 't1', 't2', 't4'])
  await select(page, 'Sekundarni ključ', 'assignee')
  await select(page, 'Sekundarna smer', 'desc')
  await expect.poll(() => ids(page)).toEqual(['t3', 't2', 't1', 't4'])
  await select(page, 'Primarni ključ', 'original')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await expect.poll(() => ids(page)).toEqual(['t1', 't2', 't3', 't4'])
})

test('P04: status and date sort, board columns keep their fixed order and sorted relative order', async ({ page }) => {
  const records = [
    makeTask('a', { status: 'done', dueDate: '2026-09-30' }),
    makeTask('b', { status: 'todo', dueDate: '2026-09-22' }),
    makeTask('c', { status: 'in_progress', dueDate: '2026-09-18' }),
    makeTask('d', { status: 'todo', dueDate: '2026-09-19' }),
    makeTask('e', { status: 'in_progress', dueDate: '2026-10-01' }),
  ]
  await mount(page, records)
  await summary(page, [2, 2, 1])
  await select(page, 'Primarni ključ', 'status')
  await expect.poll(() => ids(page)).toEqual(['b', 'd', 'c', 'e', 'a'])
  await summary(page, [2, 2, 1])
  await select(page, 'Primarni ključ', 'dueDate')
  await select(page, 'Primarna smer', 'desc')
  await expect.poll(() => ids(page)).toEqual(['e', 'a', 'b', 'd', 'c'])
  await board(page)
  await expect(page.locator('.board-column')).toHaveCount(3)
  await expect(page.locator('.board-column h3')).toHaveText(['Pripravljeno', 'V delu', 'Končano'])
  await columnIds(page, 'Pripravljeno', ['b', 'd'])
  await columnIds(page, 'V delu', ['e', 'c'])
  await columnIds(page, 'Končano', ['a'])
  await table(page)
  await expect.poll(() => ids(page)).toEqual(['e', 'a', 'b', 'd', 'c'])
})

test('P04: reset, empty and single task, navigation persistence, project reset and refresh', async ({ page }) => {
  const writes = await mount(page, [
    makeTask('same-1', { title: 'Enak naslov', dueDate: '2026-09-20' }),
    makeTask('same-2', { title: 'Enak naslov', dueDate: '2026-09-21' }),
  ])
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await board(page)
  await details(page, 'same-1')
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('title')
  await expect(page.getByRole('combobox', { name: 'Primarna smer' })).toHaveValue('desc')
  await expect(page.getByRole('combobox', { name: 'Sekundarni ključ' })).toHaveValue('dueDate')
  await expect(page.getByRole('combobox', { name: 'Sekundarna smer' })).toHaveValue('desc')
  await table(page)
  await expect.poll(() => ids(page)).toEqual(['same-2', 'same-1'])

  await select(page, 'Primarni ključ', 'assignee')
  await select(page, 'Primarna smer', 'desc')
  await page.getByRole('button', { name: 'Izvorni vrstni red', exact: true }).click()
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('original')
  await expect(page.getByRole('combobox', { name: 'Primarna smer' })).toHaveValue('asc')
  await expect(page.getByRole('combobox', { name: 'Sekundarni ključ' })).toHaveValue('none')
  await expect(page.getByRole('combobox', { name: 'Sekundarna smer' })).toHaveValue('asc')
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await project(page, 'launch')
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('original')
  await expect(page.getByRole('combobox', { name: 'Primarna smer' })).toHaveValue('asc')
  await expect(page.getByRole('combobox', { name: 'Sekundarni ključ' })).toHaveValue('none')
  await expect(page.getByRole('combobox', { name: 'Sekundarna smer' })).toHaveValue('asc')
  await select(page, 'Primarni ključ', 'dueDate')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'assignee')
  await select(page, 'Sekundarna smer', 'desc')
  await page.reload()
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('original')
  await expect(page.getByRole('combobox', { name: 'Primarna smer' })).toHaveValue('asc')
  await expect(page.getByRole('combobox', { name: 'Sekundarni ključ' })).toHaveValue('none')
  await expect(page.getByRole('combobox', { name: 'Sekundarna smer' })).toHaveValue('asc')
  await readonly(page, writes)

  await mount(page, [])
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Primarna smer', 'desc')
  await expect(page.getByText('V tem projektu še ni opravil')).toBeVisible()
  await mount(page, [makeTask('only')])
  await page.reload()
  await select(page, 'Primarni ključ', 'dueDate')
  await select(page, 'Primarna smer', 'desc')
  await expect.poll(() => ids(page)).toEqual(['only'])
})

test('P04: duplicate titles keep unique task links and narrow layout does not widen the page', async ({ page }) => {
  const records = [
    makeTask('dup-1', { title: 'Isti naslov' }),
    makeTask('dup-2', { title: 'Isti naslov' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await expect.poll(() => ids(page)).toEqual(['dup-1', 'dup-2'])
  await details(page, 'dup-2')
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
