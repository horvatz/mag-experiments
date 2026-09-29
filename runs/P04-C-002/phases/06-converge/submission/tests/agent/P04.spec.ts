import { expect, test, type Page } from '@playwright/test'
import type { Task } from '../../shared/types.ts'
import { defaultSortSettings, sortTasks, type SortKey, type SortSettings } from '../../src/taskSorting.ts'
import { mount, makeTask, select, expectIds, board, table, columnIds, project, summary, readonly as assertReadonly } from '../development/helpers.ts'

const keys: SortKey[] = ['title', 'assignee', 'status', 'dueDate']
const directions = ['asc', 'desc'] as const
const orderedIds = (tasks: Task[]) => tasks.map(task => task.id)

for (const key of ['title', 'assignee'] as const) {
  test(`A01 ${key}: exact normalization, UTF-16 and stable descending ties`, () => {
    const values = ['Žoga', 'a\u0301', 'A', 'Alfa 2', 'Alfa 10', '=SUM(A1)', '😀', '\uffff', 'a\u1ab0']
    const records = values.map((value, index) => makeTask(String(index), { [key]: value }))
    for (const secondary of [false, true]) {
      const settings: SortSettings = secondary
        ? { ...defaultSortSettings, primary: 'status', secondary: key }
        : { ...defaultSortSettings, primary: key }
      expect(orderedIds(sortTasks(records, settings))).toEqual(['5', '1', '2', '4', '3', '8', '0', '6', '7'])
      const descending = secondary ? { ...settings, secondaryDirection: 'desc' as const } : { ...settings, primaryDirection: 'desc' as const }
      expect(orderedIds(sortTasks(records, descending))).toEqual(['7', '6', '0', '8', '3', '4', '1', '2', '5'])
    }
  })
}

test('A02 status and valid dates across years preserve ties in both directions', () => {
  const records = [
    makeTask('a', { status: 'done', dueDate: '2027-01-01' }),
    makeTask('b', { status: 'todo', dueDate: '2024-02-29' }),
    makeTask('c', { status: 'in_progress', dueDate: '2026-12-31' }),
    makeTask('d', { status: 'todo', dueDate: '2024-02-29' }),
  ]
  for (const primary of ['status', 'dueDate'] as const) {
    expect(orderedIds(sortTasks(records, { ...defaultSortSettings, primary }))).toEqual(['b', 'd', 'c', 'a'])
    expect(orderedIds(sortTasks(records, { ...defaultSortSettings, primary, primaryDirection: 'desc' }))).toEqual(['a', 'c', 'b', 'd'])
  }
})

for (const secondary of keys) {
  test(`A03 ${secondary}: independent directions and secondary only within primary ties`, () => {
    const primary = secondary === 'status' ? 'title' : 'status'
    const groups = primary === 'title' ? ['A', 'B'] : ['todo', 'done']
    const values = secondary === 'status' ? ['todo', 'done'] : secondary === 'dueDate' ? ['2024-02-29', '2027-01-01'] : ['á', 'Z']
    const record = (id: string, group: number, value: number) => makeTask(id, { [primary]: groups[group], [secondary]: values[value] })
    const records = [record('a', 0, 1), record('b', 1, 0), record('c', 0, 0), record('d', 0, 0), record('e', 1, 1)]
    const expected = [ ['c', 'd', 'a', 'b', 'e'], ['a', 'c', 'd', 'e', 'b'], ['b', 'e', 'c', 'd', 'a'], ['e', 'b', 'a', 'c', 'd'] ]
    let index = 0
    for (const primaryDirection of directions) for (const secondaryDirection of directions) {
      expect(orderedIds(sortTasks(records, { primary, primaryDirection, secondary, secondaryDirection }))).toEqual(expected[index++])
    }
    expect(orderedIds(sortTasks(records, { ...defaultSortSettings, primary }))).toEqual(['a', 'c', 'd', 'b', 'e'])
  })
}

test('A04 same key never reverses ties; frozen input and all original/empty/singleton combinations', () => {
  const records = Object.freeze([
    Object.freeze(makeTask('z', { title: 'Z', assignee: 'Z', status: 'done', dueDate: '2027-01-01' })),
    Object.freeze(makeTask('a', { title: 'Á', assignee: 'Á', dueDate: '2024-02-29' })),
    Object.freeze(makeTask('b', { title: 'a', assignee: 'a', dueDate: '2024-02-29' })),
  ])
  const snapshot = JSON.stringify(records)
  for (const primary of keys) for (const primaryDirection of directions) for (const secondaryDirection of directions) {
    const expected = primaryDirection === 'asc' ? ['a', 'b', 'z'] : ['z', 'a', 'b']
    expect(orderedIds(sortTasks(records, { primary, primaryDirection, secondary: primary, secondaryDirection }))).toEqual(expected)
  }
  for (const primary of ['original', ...keys] as const) for (const primaryDirection of directions) {
    for (const secondary of ['none', ...keys] as const) for (const secondaryDirection of directions) {
      const settings = { primary, primaryDirection, secondary, secondaryDirection }
      expect(sortTasks([], settings)).toEqual([])
      expect(sortTasks([records[0]], settings)).toEqual([records[0]])
      const result = sortTasks(records, settings)
      expect(new Set(orderedIds(result)).size).toBe(3)
      for (const entry of result) expect(entry).toBe(records.find(task => task.id === entry.id))
      if (primary === 'original') expect(orderedIds(result)).toEqual(['z', 'a', 'b'])
    }
  }
  expect(JSON.stringify(records)).toBe(snapshot)
})

const controlNames = ['Primarni ključ', 'Primarna smer', 'Sekundarni ključ', 'Sekundarna smer']
async function controls(page: Page, values = ['original', 'asc', 'none', 'asc']) {
  for (let index = 0; index < controlNames.length; index++) {
    await expect(page.getByRole('combobox', { name: controlNames[index], exact: true })).toHaveValue(values[index])
  }
}
async function chooseSorting(page: Page) {
  for (const [index, value] of ['dueDate', 'desc', 'title', 'desc'].entries()) await select(page, controlNames[index], value)
}
const manyTasks = Array.from({ length: 12 }, (_, index) => makeTask(`custom-λ-${index}`, {
  title: 'Enak naslov čšž', description: `Celoten opis ${index}: Unicode, "ločila" in vsebina.`,
  status: (['todo', 'in_progress', 'done'] as const)[index % 3],
  dueDate: `2026-10-0${1 + index % 4}`,
}))
const idsAt = (indices: number[]) => indices.map(index => manyTasks[index].id)

test('A05 shared projection, duplicate details, four controls and all reset transitions', async ({ page }) => {
  const writes = await mount(page, manyTasks)
  const initialStorage = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }))
  await controls(page)
  await expectIds(page, manyTasks.map(task => task.id))
  await chooseSorting(page)
  const sorted = idsAt([3, 7, 11, 2, 6, 10, 1, 5, 9, 0, 4, 8])
  await expectIds(page, sorted)
  await summary(page, [4, 4, 4])
  expect(new URL(page.url()).hash).toBe('#/projects/web')
  await board(page)
  await controls(page, ['dueDate', 'desc', 'title', 'desc'])
  await expect(page.locator('.board-column-heading h3')).toHaveText(['Pripravljeno', 'V delu', 'Končano'])
  await columnIds(page, 'Pripravljeno', idsAt([3, 6, 9, 0]))
  await columnIds(page, 'V delu', idsAt([7, 10, 1, 4]))
  await columnIds(page, 'Končano', idsAt([11, 2, 5, 8]))
  await expectIds(page, manyTasks.map(task => task.id), false)
  for (const index of [3, 7]) {
    await page.locator(`[data-task-id="${manyTasks[index].id}"]`).getByRole('link').click()
    await expect(page.getByRole('dialog').getByText(manyTasks[index].description, { exact: true })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await controls(page, ['dueDate', 'desc', 'title', 'desc'])
  }
  await table(page)
  await expectIds(page, sorted)
  await select(page, 'Primarni ključ', 'original')
  await controls(page, ['original', 'desc', 'title', 'desc'])
  await expectIds(page, manyTasks.map(task => task.id))
  await page.getByRole('button', { name: 'Izvorni vrstni red', exact: true }).click()
  await controls(page)
  await chooseSorting(page)
  await project(page, 'launch')
  await controls(page)
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
  await project(page, 'web')
  await controls(page)
  await chooseSorting(page)
  await page.reload()
  await controls(page)
  await expectIds(page, manyTasks.map(task => task.id))
  await summary(page, [4, 4, 4])
  expect(await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }))).toEqual(initialStorage)
  await assertReadonly(page, writes)
})

for (const records of [[], [makeTask('one-unusual-id')]]) {
  test(`A06 ${records.length} tasks: every control combination in the browser`, async ({ page }) => {
    test.setTimeout(60_000)
    const writes = await mount(page, records)
    for (const primary of ['original', ...keys]) for (const primaryDirection of directions) {
      await select(page, 'Primarni ključ', primary)
      await select(page, 'Primarna smer', primaryDirection)
      for (const secondary of ['none', ...keys]) for (const secondaryDirection of directions) {
        await select(page, 'Sekundarni ključ', secondary)
        await select(page, 'Sekundarna smer', secondaryDirection)
        await expectIds(page, records.map(task => task.id))
      }
    }
    await board(page)
    await expectIds(page, records.map(task => task.id))
    await page.getByRole('button', { name: 'Izvorni vrstni red', exact: true }).click()
    await controls(page)
    await assertReadonly(page, writes)
  })
}

for (const width of [1440, 390]) {
  test(`A07 Folio layout and focus at ${width}px in both views`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 })
    await mount(page)
    await chooseSorting(page)
    for (const view of ['table', 'board']) {
      if (view === 'board') await board(page)
      await controls(page, ['dueDate', 'desc', 'title', 'desc'])
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
      const first = page.getByRole('combobox', { name: 'Primarni ključ', exact: true })
      await first.focus()
      await expect(first).toBeFocused()
      expect(await first.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe('none')
      await page.screenshot({ path: `docs/agent/P04/folio-${width}-${view}.png`, fullPage: true })
    }
  })
}
