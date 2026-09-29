import { type Page } from '@playwright/test'
import {
  test, expect, mount, makeTask, examples, webIds, expectIds, click,
  board, table, project, columnIds, summary, readonly, type Task,
} from '../development/helpers.ts'
import { createTaskOrder, taskOrderReducer, type TaskOrderState } from '../../src/taskOrder.ts'

const history = (page: Page) => page.getByRole('status', { name: 'Zgodovina vrstnega reda' })
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true })
const row = (page: Page, id: string) => page.locator('[data-task-id]').filter({ has: page.getByLabel(`Mesto opravila ${id}`, { exact: true }) })

async function expectHistory(page: Page, undo: number, redo: number) {
  await expect(history(page)).toHaveText(`Razveljavitve: ${undo}. Ponovitve: ${redo}.`)
  await expect(button(page, 'Razveljavi premik')).toBeEnabled({ enabled: undo > 0 })
  await expect(button(page, 'Ponovi premik')).toBeEnabled({ enabled: redo > 0 })
}

async function expectRanks(page: Page, ids: string[]) {
  for (const [index, id] of ids.entries()) {
    await expect(page.getByLabel(`Mesto opravila ${id}`, { exact: true })).toHaveText(String(index + 1))
  }
  if (ids.length) {
    await expect(button(page, `Premakni ${ids[0]} gor`)).toBeDisabled()
    await expect(button(page, `Premakni ${ids.at(-1)} dol`)).toBeDisabled()
  }
}

function assertPermutation(state: TaskOrderState, ids: string[]) {
  expect(state.undo.length).toBeLessThanOrEqual(20)
  for (const order of [state.initial, state.current, ...state.undo, ...state.redo]) {
    expect([...order].sort()).toEqual([...ids].sort())
    expect(new Set(order).size).toBe(ids.length)
  }
}

test('A01: arbitrary IDs, duplicate text and 13 tasks preserve fields and rank by ID', async ({ page }) => {
  const ids = ['č-17', 'id / 4', 'quote"9', 'Ω-2', 't-90', 't-1', 't-11', 't-3', 't-27', 't-6', 't-19', 't-0', 'end-42']
  const records = ids.map((id, index) => makeTask(id, {
    title: 'Enak naslov — <b>Čšž</b>', description: `Opis ${index}: "citat"\nDruga vrstica; Živa & Co.`,
    status: (['todo', 'in_progress', 'done'] as const)[index % 3],
    assignee: `Oseba ${index}`, dueDate: '2028-02-29',
  }))
  const writes = await mount(page, records)
  await expectIds(page, ids)
  await expectRanks(page, ids)
  await expectHistory(page, 0, 0)
  await expect(button(page, 'Začetni vrstni red')).toBeDisabled()
  await click(page, 'Premakni id / 4 gor')
  const moved = [ids[1], ids[0], ...ids.slice(2)]
  await expectIds(page, moved)
  await expectRanks(page, moved)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await board(page)
  const selected = records[1]
  await row(page, selected.id).getByRole('link', { name: `${selected.title} ${selected.id}`, exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: selected.title, exact: true })).toBeVisible()
  await expect(dialog.getByText(selected.description, { exact: true })).toBeVisible()
  await expect(dialog.getByText(selected.assignee, { exact: true })).toBeVisible()
  await expect(dialog.getByText('V delu', { exact: true })).toBeVisible()
  await expect(dialog.locator('time')).toHaveAttribute('datetime', selected.dueDate)
  await page.keyboard.press('Escape')
  await expectRanks(page, moved)
  await expectHistory(page, 1, 0)
  await summary(page, [5, 4, 4])
  await readonly(page, writes)
})

test('A02: invalid and repeated boundary actions preserve the entire state and redo', () => {
  const initial = createTaskOrder(Object.freeze(['a', 'b', 'c']))
  for (const action of [
    { type: 'move', id: 'a', direction: -1 }, { type: 'move', id: 'c', direction: 1 },
    { type: 'move', id: 'missing', direction: 1 }, { type: 'undo' }, { type: 'redo' }, { type: 'reset' },
  ] as const) expect(taskOrderReducer(initial, action)).toBe(initial)
  const moved = taskOrderReducer(initial, { type: 'move', id: 'b', direction: -1 })
  expect(taskOrderReducer(moved, { type: 'move', id: 'b', direction: -1 })).toBe(moved)
  const undone = taskOrderReducer(moved, { type: 'undo' })
  for (let attempt = 0; attempt < 3; attempt++) {
    expect(taskOrderReducer(undone, { type: 'move', id: 'a', direction: -1 })).toBe(undone)
    expect(taskOrderReducer(undone, { type: 'move', id: 'c', direction: 1 })).toBe(undone)
    expect(taskOrderReducer(undone, { type: 'reset' })).toBe(undone)
  }
  expect(taskOrderReducer(undone, { type: 'redo' }).current).toEqual(['b', 'a', 'c'])
  expect(initial).toEqual({ initial: ['a', 'b', 'c'], current: ['a', 'b', 'c'], undo: [], redo: [] })
  expect(taskOrderReducer(undone, { type: 'move', id: 'b', direction: 1 }).redo).toEqual([])
})

test('A03: multiple undo and redo restore complete permutations; a new branch clears redo', async ({ page }) => {
  const records = ['a', 'b', 'c', 'd'].map(id => makeTask(id))
  await mount(page, records)
  const expected = [
    ['a', 'b', 'c', 'd'], ['b', 'a', 'c', 'd'], ['b', 'c', 'a', 'd'], ['b', 'c', 'd', 'a'],
  ]
  for (const [index, name] of ['Premakni b gor', 'Premakni a dol', 'Premakni d gor'].entries()) {
    await click(page, name)
    await expectIds(page, expected[index + 1])
    await expectHistory(page, index + 1, 0)
  }
  for (let index = 2; index >= 0; index--) {
    await click(page, 'Razveljavi premik')
    await expectIds(page, expected[index])
    await expectHistory(page, index, 3 - index)
  }
  await expectRanks(page, expected[0])
  // Native disabled buttons ignore programmatic clicks, preserving all three redo steps.
  await button(page, 'Premakni a gor').evaluate((element: HTMLButtonElement) => element.click())
  await button(page, 'Premakni d dol').evaluate((element: HTMLButtonElement) => element.click())
  await expectHistory(page, 0, 3)
  for (let index = 1; index <= 3; index++) {
    await click(page, 'Ponovi premik')
    await expectIds(page, expected[index])
    await expectHistory(page, index, 3 - index)
  }
  await click(page, 'Razveljavi premik')
  await click(page, 'Razveljavi premik')
  await click(page, 'Premakni c dol')
  await expectIds(page, ['b', 'a', 'd', 'c'])
  await expectHistory(page, 2, 0)
})

test('A04: 21 distinct moves retain only the latest 20 undo steps and all redo steps', async ({ page }) => {
  const ids = Array.from({ length: 22 }, (_, index) => `item-${index}`)
  await mount(page, ids.map(id => makeTask(id)))
  for (let count = 0; count < 21; count++) await click(page, 'Premakni item-0 dol')
  await expectIds(page, [...ids.slice(1), ids[0]])
  await expectHistory(page, 20, 0)
  for (let count = 0; count < 20; count++) await click(page, 'Razveljavi premik')
  await expectIds(page, [ids[1], ids[0], ...ids.slice(2)])
  await expectHistory(page, 0, 20)
  for (let count = 0; count < 20; count++) await click(page, 'Ponovi premik')
  await expectIds(page, [...ids.slice(1), ids[0]])
  await expectHistory(page, 20, 0)
})

test('A05: reset is one undoable action, clears redo, and is inert at the initial order', async ({ page }) => {
  await mount(page, ['a', 'b', 'c'].map(id => makeTask(id)))
  await click(page, 'Premakni b gor')
  await click(page, 'Premakni c gor')
  await click(page, 'Razveljavi premik')
  await expectHistory(page, 1, 1)
  await click(page, 'Začetni vrstni red')
  await expectIds(page, ['a', 'b', 'c'])
  await expectHistory(page, 2, 0)
  await expect(button(page, 'Začetni vrstni red')).toBeDisabled()
  await click(page, 'Razveljavi premik')
  await expectIds(page, ['b', 'a', 'c'])
  await expectHistory(page, 1, 1)
  await click(page, 'Ponovi premik')
  await expectIds(page, ['a', 'b', 'c'])
  await expectHistory(page, 2, 0)
  await click(page, 'Razveljavi premik')
  await click(page, 'Razveljavi premik')
  await expectHistory(page, 0, 2)
  await button(page, 'Začetni vrstni red').evaluate((element: HTMLButtonElement) => element.click())
  await expectHistory(page, 0, 2)
  await click(page, 'Ponovi premik')
  await expectIds(page, ['b', 'a', 'c'])
})

test('A06: board uses global neighbors, fixed status columns and relative order at 390 px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const records: Task[] = [makeTask('a'), makeTask('b', { status: 'done' }), makeTask('c'), makeTask('d', { status: 'in_progress' })]
  const writes = await mount(page, records)
  const before = await (await page.request.get('/__test/state')).json()
  await board(page)
  await expect(button(page, 'Premakni c gor')).toBeEnabled()
  await click(page, 'Premakni c gor')
  await expectRanks(page, ['a', 'c', 'b', 'd'])
  await columnIds(page, 'Pripravljeno', ['a', 'c'])
  await columnIds(page, 'Končano', ['b'])
  await click(page, 'Premakni c gor')
  await columnIds(page, 'Pripravljeno', ['c', 'a'])
  await expectRanks(page, ['c', 'a', 'b', 'd'])
  await columnIds(page, 'V delu', ['d'])
  await expect(page.locator('.board-column h3')).toHaveText(['Pripravljeno', 'V delu', 'Končano'])
  await expect(page.locator('[data-task-id] a button')).toHaveCount(0)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await summary(page, [2, 1, 1])
  await readonly(page, writes)
  await table(page)
  await expectIds(page, ['c', 'a', 'b', 'd'])
  await expectRanks(page, ['c', 'a', 'b', 'd'])
  await summary(page, [2, 1, 1])
  await readonly(page, writes)
  expect(await (await page.request.get('/__test/state')).json()).toEqual(before)
})

test('A07: views and details retain both histories; project changes and reload reset them', async ({ page }) => {
  const writes = await mount(page)
  await click(page, 'Premakni web-02 gor')
  await click(page, 'Premakni web-03 gor')
  await click(page, 'Razveljavi premik')
  const order = ['web-02', 'web-01', ...webIds().slice(2)]
  await board(page)
  await expectHistory(page, 1, 1)
  await row(page, 'web-02').getByRole('link').click()
  await expect(page.getByRole('dialog').getByText('Luka Kovač', { exact: true })).toBeVisible()
  await click(page, 'Zapri podrobnosti')
  await expectRanks(page, order)
  await expectHistory(page, 1, 1)
  await table(page)
  await row(page, 'web-03').getByRole('link').click()
  await expect(page.getByRole('dialog').getByText('Končano', { exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expectIds(page, order)
  await expectHistory(page, 1, 1)
  await project(page, 'launch')
  await expectIds(page, ['launch-01', 'launch-02'])
  await expectHistory(page, 0, 0)
  await click(page, 'Premakni launch-01 dol')
  await project(page, 'web')
  await expectIds(page, webIds())
  await expectHistory(page, 0, 0)
  await project(page, 'launch')
  await expectIds(page, ['launch-01', 'launch-02'])
  await expectHistory(page, 0, 0)
  await click(page, 'Premakni launch-02 gor')
  await board(page)
  await row(page, 'launch-02').getByRole('link').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.reload()
  await expect(page.getByRole('dialog').getByText('Luka Kovač', { exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expectHistory(page, 0, 0)
  await expectRanks(page, ['launch-01', 'launch-02'])
  await readonly(page, writes)
})

test('A08: both projects empty and a single task remain usable in both views', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mount(page, [])
  for (const id of ['web', 'launch'] as const) {
    await project(page, id)
    await expectHistory(page, 0, 0)
    await expect(button(page, 'Začetni vrstni red')).toBeDisabled()
    await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
    await board(page)
    await expect(page.getByRole('region', { name: 'Tabla opravil' }).getByRole('region')).toHaveCount(3)
    await expect(page.getByRole('button', { name: /^Premakni / })).toHaveCount(0)
    await table(page)
  }
  const writes = await mount(page, [makeTask('only')])
  for (const change of [table, board]) {
    await change(page)
    await expectRanks(page, ['only'])
    await expectHistory(page, 0, 0)
    await expect(button(page, 'Začetni vrstni red')).toBeDisabled()
    await row(page, 'only').getByRole('link').click()
    await expect(page.getByRole('dialog').getByRole('heading', { name: 'Opravilo only', exact: true })).toBeVisible()
    await page.keyboard.press('Escape')
    await readonly(page, writes)
  }
})

test('A09: mixed reducer actions preserve immutable snapshots and the ID set', () => {
  const ids = webIds(examples)
  let state = createTaskOrder(ids)
  const saved: { state: TaskOrderState; serialized: string }[] = []
  let seed = 910
  for (let step = 0; step < 500; step++) {
    saved.push({ state, serialized: JSON.stringify(state) })
    seed = (seed * 1664525 + 1013904223) >>> 0
    const choice = seed % 8
    const action = choice < 5
      ? { type: 'move' as const, id: ids[(seed >>> 8) % ids.length], direction: (seed & 256 ? 1 : -1) as -1 | 1 }
      : { type: (['undo', 'redo', 'reset'] as const)[choice - 5] }
    state = taskOrderReducer(state, action)
    assertPermutation(state, ids)
  }
  for (const entry of saved) expect(JSON.stringify(entry.state)).toBe(entry.serialized)
})
