import { type Page } from '@playwright/test'
import { test, expect, mount, makeTask, click, board, table, project, expectIds, columnIds, summary, readonly } from '../development/helpers.ts'
import { createOrder, orderReducer, type OrderState } from '../../src/taskOrder.ts'

function frozen(state: OrderState) {
  for (const list of [state.initial, state.order, ...state.past, ...state.future]) Object.freeze(list)
  Object.freeze(state.past)
  Object.freeze(state.future)
  return Object.freeze(state)
}

async function history(page: Page, undo: number, redo: number) {
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText(`Razveljavitve: ${undo}. Ponovitve: ${redo}.`)
  const undoButton = page.getByRole('button', { name: 'Razveljavi premik', exact: true })
  const redoButton = page.getByRole('button', { name: 'Ponovi premik', exact: true })
  if (undo === 0) await expect(undoButton).toBeDisabled(); else await expect(undoButton).toBeEnabled()
  if (redo === 0) await expect(redoButton).toBeDisabled(); else await expect(redoButton).toBeEnabled()
}

async function ranks(page: Page, ids: string[]) {
  for (const [index, id] of ids.entries()) await expect(page.getByLabel(`Mesto opravila ${id}`, { exact: true })).toHaveText(String(index + 1))
}

const records = [
  makeTask('ž:alpha', { title: 'Enak naslov, čšž', description: 'Prvo opravilo — podatki ostanejo.', status: 'todo' }),
  makeTask('other/22', { title: 'Enak naslov, čšž', description: 'Drugo opravilo, druga identiteta.', status: 'done' }),
  makeTask('x-900', { status: 'todo' }),
  makeTask('last-4', { status: 'in_progress' }),
  makeTask('campaign-only', { projectId: 'launch' }),
]
const initial = records.slice(0, 4).map(task => task.id)

test('A01: immutable history, repeated invalid moves and branching', () => {
  const original = frozen(createOrder(['a', 'b', 'c', 'd']))
  let state = orderReducer(original, { type: 'move', id: 'c', direction: -1 })
  expect(state.order).toEqual(['a', 'c', 'b', 'd'])
  state = orderReducer(frozen(state), { type: 'move', id: 'd', direction: -1 })
  expect(state.order).toEqual(['a', 'c', 'd', 'b'])
  state = orderReducer(frozen(state), { type: 'undo' })
  expect(state.order).toEqual(['a', 'c', 'b', 'd'])
  const before = frozen(state)
  for (let i = 0; i < 3; i++) {
    state = orderReducer(state, { type: 'move', id: 'a', direction: -1 })
    state = orderReducer(state, { type: 'move', id: 'd', direction: 1 })
    state = orderReducer(state, { type: 'move', id: 'missing', direction: 1 })
  }
  expect(state).toBe(before)
  state = orderReducer(state, { type: 'undo' })
  expect(state.order).toEqual(['a', 'b', 'c', 'd'])
  state = orderReducer(frozen(state), { type: 'redo' })
  expect(state.order).toEqual(['a', 'c', 'b', 'd'])
  state = orderReducer(frozen(state), { type: 'redo' })
  expect(state.order).toEqual(['a', 'c', 'd', 'b'])
  state = orderReducer(state, { type: 'undo' })
  state = orderReducer(state, { type: 'move', id: 'c', direction: -1 })
  expect(state.order).toEqual(['c', 'a', 'b', 'd'])
  expect(state.future).toEqual([])
  expect(original).toEqual(createOrder(['a', 'b', 'c', 'd']))
})

test('A02: 21 moves retain exactly 20 undo and all redo steps', () => {
  const ids = Array.from({ length: 23 }, (_, i) => `item-${i}`)
  const expectedAt = (index: number) => [...ids.slice(0, index), 'item-22', ...ids.slice(index, 22)]
  let state = createOrder(ids)
  for (let i = 1; i <= 21; i++) {
    state = orderReducer(frozen(state), { type: 'move', id: 'item-22', direction: -1 })
    expect(state.order).toEqual(expectedAt(22 - i))
    expect(state.past).toHaveLength(Math.min(i, 20))
  }
  for (let i = 1; i <= 20; i++) {
    state = orderReducer(frozen(state), { type: 'undo' })
    expect(state.order).toEqual(expectedAt(1 + i))
  }
  expect(orderReducer(state, { type: 'undo' })).toBe(state)
  expect(state.order).not.toEqual(ids)
  for (let i = 1; i <= 20; i++) {
    state = orderReducer(frozen(state), { type: 'redo' })
    expect(state.order).toEqual(expectedAt(21 - i))
    expect(new Set(state.order).size).toBe(ids.length)
  }
  expect(state.future).toHaveLength(0)
})

test('A03: reset is undoable and no-op reset preserves redo', () => {
  let state = createOrder(['a', 'b', 'c'])
  state = orderReducer(state, { type: 'move', id: 'b', direction: -1 })
  state = orderReducer(state, { type: 'move', id: 'c', direction: -1 })
  state = orderReducer(state, { type: 'undo' })
  state = orderReducer(frozen(state), { type: 'reset' })
  expect(state.order).toEqual(['a', 'b', 'c'])
  expect(state.past).toHaveLength(2)
  expect(state.future).toHaveLength(0)
  state = orderReducer(state, { type: 'undo' })
  expect(state.order).toEqual(['b', 'a', 'c'])
  state = orderReducer(state, { type: 'redo' })
  expect(state.order).toEqual(['a', 'b', 'c'])
  state = orderReducer(state, { type: 'undo' })
  state = orderReducer(state, { type: 'undo' })
  expect(state.order).toEqual(['a', 'b', 'c'])
  expect(state.future).toHaveLength(2)
  expect(orderReducer(frozen(state), { type: 'reset' })).toBe(state)
})

test('A04: arbitrary input order, duplicate titles, ranks and unchanged details', async ({ page }) => {
  const many = [...records.slice(0, 4), ...Array.from({ length: 9 }, (_, i) => makeTask(`extra-${100 - i}`, { title: 'Enak naslov, čšž' }))]
  const ids = many.map(task => task.id)
  const writes = await mount(page, many)
  await expectIds(page, ids)
  await ranks(page, ids)
  await history(page, 0, 0)
  await expect(page.getByRole('button', { name: `Premakni ${ids[0]} gor`, exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: `Premakni ${ids.at(-1)} dol`, exact: true })).toBeDisabled()
  await click(page, 'Premakni other/22 gor')
  const moved = [ids[1], ids[0], ...ids.slice(2)]
  await expectIds(page, moved)
  await ranks(page, moved)
  await history(page, 1, 0)
  await summary(page, [11, 1, 1])
  await page.locator('[data-task-id="other/22"]').getByRole('link').click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: 'Enak naslov, čšž', exact: true })).toBeVisible()
  await expect(dialog.getByText('Drugo opravilo, druga identiteta.', { exact: true })).toBeVisible()
  await expect(dialog.getByText('Končano', { exact: true })).toBeVisible()
  await expect(dialog.getByText('Ana Novak', { exact: true })).toBeVisible()
  await expect(dialog.locator('time')).toHaveAttribute('dateTime', '2026-09-21')
  await click(page, 'Zapri podrobnosti')
  await history(page, 1, 0)
  await expect(page.locator('a button')).toHaveCount(0)
  await readonly(page, writes)
})

test('A05: global board neighbors, both histories survive views and details, project/reload reset', async ({ page }) => {
  const writes = await mount(page, records)
  await board(page)
  await click(page, 'Premakni x-900 gor')
  await ranks(page, ['ž:alpha', 'x-900', 'other/22', 'last-4'])
  await columnIds(page, 'Pripravljeno', ['ž:alpha', 'x-900'])
  await columnIds(page, 'Končano', ['other/22'])
  await click(page, 'Premakni x-900 gor')
  await columnIds(page, 'Pripravljeno', ['x-900', 'ž:alpha'])
  await click(page, 'Razveljavi premik')
  await history(page, 1, 1)
  await table(page)
  await expectIds(page, ['ž:alpha', 'x-900', 'other/22', 'last-4'])
  await page.locator('[data-task-id="ž:alpha"]').getByRole('link').click()
  await expect(page.getByRole('dialog').getByText('Prvo opravilo — podatki ostanejo.', { exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await history(page, 1, 1)
  await board(page)
  await history(page, 1, 1)
  await click(page, 'Ponovi premik')
  await ranks(page, ['x-900', 'ž:alpha', 'other/22', 'last-4'])
  await summary(page, [2, 1, 1])
  await project(page, 'launch')
  await history(page, 0, 0)
  await project(page, 'web')
  await ranks(page, initial)
  await history(page, 0, 0)
  await click(page, 'Premakni x-900 gor')
  await page.reload()
  await ranks(page, initial)
  await history(page, 0, 0)
  await readonly(page, writes)
})

test('A06: UI reset, no-op controls and redo branching', async ({ page }) => {
  const writes = await mount(page, records)
  await click(page, 'Premakni other/22 gor')
  await click(page, 'Premakni x-900 gor')
  await click(page, 'Razveljavi premik')
  await history(page, 1, 1)
  await click(page, 'Začetni vrstni red')
  await expectIds(page, initial)
  await history(page, 2, 0)
  await click(page, 'Razveljavi premik')
  await expectIds(page, ['other/22', 'ž:alpha', 'x-900', 'last-4'])
  await click(page, 'Ponovi premik')
  await expectIds(page, initial)
  await click(page, 'Razveljavi premik')
  await click(page, 'Razveljavi premik')
  await history(page, 0, 2)
  for (const name of ['Začetni vrstni red', 'Premakni ž:alpha gor', 'Premakni last-4 dol']) {
    const button = page.getByRole('button', { name, exact: true })
    await expect(button).toBeDisabled()
    await button.evaluate((element: HTMLButtonElement) => { element.click(); element.click() })
  }
  await history(page, 0, 2)
  await click(page, 'Premakni x-900 dol')
  await expectIds(page, ['ž:alpha', 'other/22', 'last-4', 'x-900'])
  await history(page, 1, 0)
  await readonly(page, writes)
})

for (const count of [0, 1]) {
  test(`A07: ${count} task project remains usable in both views`, async ({ page }) => {
    const writes = await mount(page, count ? [makeTask('single')] : [])
    await history(page, 0, 0)
    await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
    if (count) {
      await ranks(page, ['single'])
      await expect(page.getByRole('button', { name: 'Premakni single gor', exact: true })).toBeDisabled()
      await expect(page.getByRole('button', { name: 'Premakni single dol', exact: true })).toBeDisabled()
    } else await expect(page.getByText('V tem projektu še ni opravil', { exact: true })).toBeVisible()
    await board(page)
    await history(page, 0, 0)
    for (const name of ['Pripravljeno', 'V delu', 'Končano']) await expect(page.getByRole('region', { name, exact: true })).toBeVisible()
    await project(page, 'launch')
    await history(page, 0, 0)
    await expectIds(page, [])
    await table(page)
    await readonly(page, writes)
  })
}

test('A08: Folio at 390px, keyboard controls and screenshots', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page, records)
  await expectIds(page, initial)
  const up = page.getByRole('button', { name: 'Premakni other/22 gor', exact: true })
  await up.focus()
  await expect(up).toBeFocused()
  await expect(up).toHaveCSS('outline-style', 'solid')
  await page.keyboard.press('Enter')
  await ranks(page, ['other/22', 'ž:alpha', 'x-900', 'last-4'])
  await readonly(page, writes)
  await page.screenshot({ path: 'docs/agent/P10/mobile-table.png', fullPage: true })
  await board(page)
  await click(page, 'Premakni other/22 dol')
  await ranks(page, initial)
  await readonly(page, writes)
  await page.locator('.board-scroll').evaluate(element => { element.scrollLeft = 0 })
  await page.screenshot({ path: 'docs/agent/P10/mobile-board.png', fullPage: true })
  await page.setViewportSize({ width: 1440, height: 960 })
  await page.screenshot({ path: 'docs/agent/P10/desktop-board.png', fullPage: true })
})
