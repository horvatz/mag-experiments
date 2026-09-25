import { test, expect } from '@playwright/test'
import { createTaskOrder, taskOrderReducer } from '../../src/taskOrder.ts'

// Explicit expected sequences are independent of the reducer's transition code.
test('A01: whole permutations, boundaries, branching and reset', () => {
  const input = Object.freeze(['č-3', 'same-2', 'x/1', 'z'])
  const initial = createTaskOrder(input)
  expect(initial.current).toEqual(input)
  expect(taskOrderReducer(initial, { type: 'move', id: 'č-3', direction: -1 })).toBe(initial)
  expect(taskOrderReducer(initial, { type: 'move', id: 'missing', direction: 1 })).toBe(initial)
  let state = taskOrderReducer(initial, { type: 'move', id: 'x/1', direction: -1 })
  expect(state.current).toEqual(['č-3', 'x/1', 'same-2', 'z'])
  state = taskOrderReducer(state, { type: 'move', id: 'č-3', direction: 1 })
  expect(state.current).toEqual(['x/1', 'č-3', 'same-2', 'z'])
  state = taskOrderReducer(state, { type: 'undo' })
  expect(state.current).toEqual(['č-3', 'x/1', 'same-2', 'z'])
  const boundary = taskOrderReducer(state, { type: 'move', id: 'z', direction: 1 })
  expect(boundary).toBe(state)
  expect(taskOrderReducer(boundary, { type: 'move', id: 'z', direction: 1 })).toBe(state)
  state = taskOrderReducer(state, { type: 'undo' })
  expect(state.current).toEqual(input)
  expect(taskOrderReducer(state, { type: 'reset' })).toBe(state)
  state = taskOrderReducer(state, { type: 'redo' })
  expect(state.current).toEqual(['č-3', 'x/1', 'same-2', 'z'])
  state = taskOrderReducer(state, { type: 'redo' })
  expect(state.current).toEqual(['x/1', 'č-3', 'same-2', 'z'])
  state = taskOrderReducer(state, { type: 'undo' })
  state = taskOrderReducer(state, { type: 'move', id: 'z', direction: -1 })
  expect(state.current).toEqual(['č-3', 'x/1', 'z', 'same-2'])
  expect(state.future).toEqual([])
  state = taskOrderReducer(state, { type: 'undo' })
  const beforeReset = state.current
  state = taskOrderReducer(state, { type: 'reset' })
  expect(state.current).toEqual(input)
  expect(state.future).toEqual([])
  expect(taskOrderReducer(state, { type: 'reset' })).toBe(state)
  state = taskOrderReducer(state, { type: 'undo' })
  expect(state.current).toEqual(beforeReset)
  state = taskOrderReducer(state, { type: 'redo' })
  expect(state.current).toEqual(input)
  expect(input).toEqual(['č-3', 'same-2', 'x/1', 'z'])
  expect(initial.past).toEqual([])
})

test('A02: last 20 snapshots and every available redo', () => {
  const ids = Array.from({ length: 25 }, (_, i) => `id-${i}`)
  let state = createTaskOrder(ids)
  const snapshots = [state.current]
  for (let i = 0; i < 24; i++) {
    state = taskOrderReducer(state, { type: 'move', id: 'id-0', direction: 1 })
    expect(state.current.indexOf('id-0')).toBe(i + 1)
    expect([...state.current].sort()).toEqual([...ids].sort())
    expect(state.past).toHaveLength(Math.min(i + 1, 20))
    snapshots.push(state.current)
  }
  for (let i = 23; i >= 4; i--) {
    state = taskOrderReducer(state, { type: 'undo' })
    expect(state.current).toEqual(snapshots[i])
  }
  expect(state.past).toHaveLength(0)
  expect(state.future).toHaveLength(20)
  expect(taskOrderReducer(state, { type: 'undo' })).toBe(state)
  for (let i = 5; i <= 24; i++) {
    state = taskOrderReducer(state, { type: 'redo' })
    expect(state.current).toEqual(snapshots[i])
  }
  expect(state.past).toHaveLength(20)
  expect(state.future).toHaveLength(0)
  expect(taskOrderReducer(state, { type: 'redo' })).toBe(state)
})

import type { Page } from '@playwright/test'
import { mount, makeTask, expectIds, click, board, table, project, summary, columnIds, readonly } from '../development/helpers.ts'

async function history(page: Page, undo: number, redo: number) {
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText(`Razveljavitve: ${undo}. Ponovitve: ${redo}.`)
  const undoButton = page.getByRole('button', { name: 'Razveljavi premik', exact: true })
  const redoButton = page.getByRole('button', { name: 'Ponovi premik', exact: true })
  if (undo === 0) await expect(undoButton).toBeDisabled()
  else await expect(undoButton).toBeEnabled()
  if (redo === 0) await expect(redoButton).toBeDisabled()
  else await expect(redoButton).toBeEnabled()
}

const records = [
  makeTask('č-9', { title: 'Enak naslov <čšž>', status: 'todo', description: 'Prvi opis, "citat"' }),
  makeTask('β/2', { title: 'Enak naslov <čšž>', status: 'done', description: 'Drugi opis — λ' }),
  makeTask('k-7', { status: 'todo' }),
  makeTask('m-1', { status: 'in_progress' }),
  makeTask('other', { projectId: 'launch' }),
]

test('A03: arbitrary IDs, 13 tasks, ranks and unchanged data', async ({ page }) => {
  const many = Array.from({ length: 13 }, (_, i) => makeTask(`č/${20-i}`, { title: 'Isti naslov, λ', status: i % 2 ? 'done' : 'todo' }))
  const writes = await mount(page, many)
  const ids = many.map(t => t.id)
  await expectIds(page, ids)
  for (const [i, id] of ids.entries()) await expect(page.getByLabel(`Mesto opravila ${id}`, { exact: true })).toHaveText(String(i + 1))
  await click(page, `Premakni ${ids[12]} gor`)
  await expectIds(page, [...ids.slice(0, 11), ids[12], ids[11]])
  await click(page, `Premakni ${ids[12]} dol`)
  await expectIds(page, ids)
  await history(page, 2, 0)
  await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
  await summary(page, [7, 0, 6])
  await page.locator('[data-task-id]').nth(12).getByRole('link').click()
  await expect(page.getByRole('dialog').getByRole('heading', { level: 2 })).toHaveText(many[12].title)
  await expect(page.getByRole('dialog').locator('.description p')).toHaveText(many[12].description)
  await expect(page.getByRole('dialog').locator('time')).toHaveAttribute('datetime', many[12].dueDate)
  await page.keyboard.press('Escape')
  await readonly(page, writes)
})

test('A04: global neighbors on board and history across navigation', async ({ page }) => {
  const writes = await mount(page, records)
  await click(page, 'Premakni β/2 gor')
  await click(page, 'Premakni k-7 gor')
  await click(page, 'Razveljavi premik')
  await history(page, 1, 1)
  await board(page)
  await history(page, 1, 1)
  await columnIds(page, 'Pripravljeno', ['č-9', 'k-7'])
  await columnIds(page, 'Končano', ['β/2'])
  await expect(page.getByLabel('Mesto opravila β/2', { exact: true })).toHaveText('1')
  await expect(page.getByRole('button', { name: 'Premakni β/2 gor', exact: true })).toBeDisabled()
  await page.locator('[data-task-id="β/2"]').getByRole('link').click()
  await expect(page.getByRole('dialog').locator('.description p')).toHaveText('Drugi opis — λ')
  await page.getByRole('button', { name: 'Zapri podrobnosti', exact: true }).click()
  await history(page, 1, 1)
  await click(page, 'Ponovi premik')
  await columnIds(page, 'Pripravljeno', ['k-7', 'č-9'])
  await click(page, 'Premakni m-1 gor')
  await expect(page.getByLabel('Mesto opravila m-1', { exact: true })).toHaveText('3')
  await columnIds(page, 'V delu', ['m-1'])
  await summary(page, [2, 1, 1])
  await table(page)
  await expectIds(page, ['β/2', 'k-7', 'm-1', 'č-9'])
  await history(page, 3, 0)
  await project(page, 'launch')
  await history(page, 0, 0)
  await project(page, 'web')
  await expectIds(page, ['č-9', 'β/2', 'k-7', 'm-1'])
  await history(page, 0, 0)
  await click(page, 'Premakni č-9 dol')
  await page.reload()
  await expectIds(page, ['č-9', 'β/2', 'k-7', 'm-1'])
  await history(page, 0, 0)
  await readonly(page, writes)
})

test('A05: reset is undoable and branching updates exact counters', async ({ page }) => {
  const writes = await mount(page, records)
  await click(page, 'Premakni β/2 gor')
  await click(page, 'Premakni k-7 gor')
  await click(page, 'Razveljavi premik')
  await history(page, 1, 1)
  // Native disabled clicks, including repeats, must leave redo available.
  const boundary = page.getByRole('button', { name: 'Premakni β/2 gor', exact: true })
  await expect(boundary).toBeDisabled()
  await boundary.evaluate((button: HTMLButtonElement) => { button.click(); button.click() })
  await history(page, 1, 1)
  await click(page, 'Začetni vrstni red')
  await expectIds(page, ['č-9', 'β/2', 'k-7', 'm-1'])
  await history(page, 2, 0)
  await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
  await click(page, 'Razveljavi premik')
  await expectIds(page, ['β/2', 'č-9', 'k-7', 'm-1'])
  await history(page, 1, 1)
  await click(page, 'Ponovi premik')
  await expectIds(page, ['č-9', 'β/2', 'k-7', 'm-1'])
  await click(page, 'Razveljavi premik')
  await click(page, 'Premakni m-1 gor')
  await expectIds(page, ['β/2', 'č-9', 'm-1', 'k-7'])
  await history(page, 2, 0)
  await readonly(page, writes)
})

for (const count of [0, 1]) {
  test(`A06: ${count} tasks remain usable in both views and projects`, async ({ page }) => {
    const writes = await mount(page, count ? [makeTask('only-λ')] : [])
    await history(page, 0, 0)
    await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
    for (const view of ['table', 'board']) {
      if (view === 'board') await board(page)
      await expect(page.locator('[data-task-id]')).toHaveCount(count)
      if (count) {
        await expect(page.getByLabel('Mesto opravila only-λ', { exact: true })).toHaveText('1')
        await expect(page.getByRole('button', { name: 'Premakni only-λ gor', exact: true })).toBeDisabled()
        await expect(page.getByRole('button', { name: 'Premakni only-λ dol', exact: true })).toBeDisabled()
      }
      await history(page, 0, 0)
    }
    await project(page, 'launch')
    await expect(page.locator('[data-task-id]')).toHaveCount(0)
    await history(page, 0, 0)
    await readonly(page, writes)
  })
}

test('A07: Folio desktop and 390px, keyboard and separate controls', async ({ page }) => {
  const writes = await mount(page, records)
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 960 })
    await table(page)
    const down = page.getByRole('button', { name: 'Premakni č-9 dol', exact: true })
    await down.focus()
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab')
    await expect(down).toBeFocused()
    expect(await down.evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await click(page, 'Začetni vrstni red')
    for (const view of ['table', 'board']) {
      if (view === 'board') await board(page)
      expect(await page.locator('[data-task-id] button').evaluateAll(buttons => buttons.every(b => !b.closest('a')))).toBe(true)
      await readonly(page, writes)
      await page.screenshot({ path: `docs/agent/P10/folio-${width}-${view}.png`, fullPage: true })
    }
  }
})
