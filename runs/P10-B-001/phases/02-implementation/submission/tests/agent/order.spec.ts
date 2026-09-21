import { test, expect, type Page } from '@playwright/test'
import { initialOrder, orderReducer, type OrderState } from '../../src/taskOrder.ts'
import { board, click, columnIds, expectIds, makeTask, mount, project, readonly, summary, table } from '../development/helpers.ts'

async function history(page: Page, undo: number, redo: number) {
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText(`Razveljavitve: ${undo}. Ponovitve: ${redo}.`)
  await expect(page.getByRole('button', { name: 'Razveljavi premik', exact: true })).toBeEnabled({ enabled: undo > 0 })
  await expect(page.getByRole('button', { name: 'Ponovi premik', exact: true })).toBeEnabled({ enabled: redo > 0 })
}

const records = [
  makeTask('ž / "9"', { title: 'Enak naslov', status: 'todo', description: 'Prva vrstica\nDruga; <besedilo>', assignee: 'Živa Črt' }),
  makeTask('β:2', { title: 'Enak naslov', status: 'in_progress' }),
  makeTask('a-20', { title: 'Enak naslov', status: 'todo' }),
  makeTask('z-1', { status: 'done' }),
  makeTask('drugi', { projectId: 'launch' }),
]
const original = records.slice(0, 4).map(task => task.id)

test('S03: invalid commands preserve both stacks and immutable snapshots', () => {
  const initial = initialOrder(['a', 'b', 'c'])
  const moved = orderReducer(initial, { type: 'move', id: 'b', direction: -1 })
  const undone = orderReducer(moved, { type: 'undo' })
  Object.freeze(undone.present)
  Object.freeze(undone.redo[0])
  for (let repeat = 0; repeat < 3; repeat++) {
    expect(orderReducer(undone, { type: 'move', id: 'a', direction: -1 })).toBe(undone)
    expect(orderReducer(undone, { type: 'move', id: 'c', direction: 1 })).toBe(undone)
    expect(orderReducer(undone, { type: 'move', id: 'missing', direction: 1 })).toBe(undone)
    expect(orderReducer(undone, { type: 'reset' })).toBe(undone)
  }
  expect(orderReducer(undone, { type: 'move', id: 'c', direction: -1 }).redo).toEqual([])
  expect(initial.present).toEqual(['a', 'b', 'c'])
  expect(moved.present).toEqual(['b', 'a', 'c'])
})

test('S04: 21 distinct moves retain exactly 20 steps, including reset at capacity', () => {
  const ids = Array.from({ length: 23 }, (_, i) => `id-${i}`)
  let state = initialOrder(ids)
  const snapshots: OrderState[] = [state]
  for (let count = 1; count <= 21; count++) {
    state = orderReducer(state, { type: 'move', id: ids[22], direction: -1 })
    snapshots.push(state)
    expect(state.undo).toHaveLength(Math.min(count, 20))
    expect([...state.present].sort()).toEqual([...ids].sort())
  }
  const last = state
  for (let step = 20; step >= 1; step--) {
    state = orderReducer(state, { type: 'undo' })
    expect(state.present).toEqual(snapshots[step].present)
    expect(state.redo).toHaveLength(21 - step)
  }
  expect(orderReducer(state, { type: 'undo' })).toBe(state)
  for (let step = 2; step <= 21; step++) {
    state = orderReducer(state, { type: 'redo' })
    expect(state.present).toEqual(snapshots[step].present)
  }
  expect(state.present).toEqual(last.present)
  expect(state.redo).toHaveLength(0)
  state = orderReducer(state, { type: 'reset' })
  expect(state.present).toEqual(ids)
  expect(state.undo).toHaveLength(20)
  expect(orderReducer(state, { type: 'undo' }).present).toEqual(last.present)
})

test('S01/S02/S05: arbitrary IDs, full history sequence and undoable reset', async ({ page }) => {
  const writes = await mount(page, records)
  await expectIds(page, original)
  for (const [i, id] of original.entries()) await expect(page.getByLabel(`Mesto opravila ${id}`, { exact: true })).toHaveText(String(i + 1))
  await history(page, 0, 0)
  const sequences = [
    [original[0], original[2], original[1], original[3]],
    [original[0], original[2], original[3], original[1]],
    [original[2], original[0], original[3], original[1]],
  ]
  for (const [i, command] of [`Premakni ${original[2]} gor`, `Premakni ${original[3]} gor`, `Premakni ${original[0]} dol`].entries()) {
    await click(page, command)
    await expectIds(page, sequences[i])
    await history(page, i + 1, 0)
  }
  for (let i = 2; i >= 0; i--) {
    await click(page, 'Razveljavi premik')
    await expectIds(page, i === 0 ? original : sequences[i - 1])
    await history(page, i, 3 - i)
  }
  await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
  for (let i = 0; i < 3; i++) {
    await click(page, 'Ponovi premik')
    await expectIds(page, sequences[i])
    await history(page, i + 1, 2 - i)
  }
  await click(page, 'Razveljavi premik')
  await click(page, 'Začetni vrstni red')
  await expectIds(page, original)
  await history(page, 3, 0)
  await click(page, 'Razveljavi premik')
  await expectIds(page, sequences[1])
  await click(page, 'Ponovi premik')
  await expectIds(page, original)
  await click(page, 'Razveljavi premik')
  await click(page, `Premakni ${original[0]} dol`)
  await history(page, 3, 0)
  await summary(page, [2, 1, 1])
  await readonly(page, writes)
})

test('S06/S08: board global neighbors, details, both stacks, navigation and refresh', async ({ page }) => {
  const writes = await mount(page, records)
  await click(page, `Premakni ${original[1]} gor`)
  await click(page, `Premakni ${original[3]} gor`)
  await click(page, 'Razveljavi premik')
  await history(page, 1, 1)
  await board(page)
  await history(page, 1, 1)
  await columnIds(page, 'Pripravljeno', [original[0], original[2]])
  const link = page.getByRole('link', { name: `Enak naslov ${original[0]}`, exact: true })
  await link.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByText('Živa Črt', { exact: true })).toBeVisible()
  await expect(dialog.locator('.description p')).toHaveText(records[0].description)
  await expect(dialog.locator('time')).toHaveAttribute('datetime', records[0].dueDate)
  await page.keyboard.press('Escape')
  await expect(link).toBeFocused()
  await history(page, 1, 1)
  await click(page, `Premakni ${original[0]} gor`)
  await columnIds(page, 'Pripravljeno', [original[0], original[2]])
  await expect(page.getByLabel(`Mesto opravila ${original[0]}`, { exact: true })).toHaveText('1')
  await history(page, 2, 0)
  await click(page, `Premakni ${original[2]} gor`)
  await click(page, `Premakni ${original[2]} gor`)
  await columnIds(page, 'Pripravljeno', [original[2], original[0]])
  await table(page)
  await expectIds(page, [original[2], original[0], original[1], original[3]])
  await summary(page, [2, 1, 1])
  await project(page, 'launch')
  await history(page, 0, 0)
  await project(page, 'web')
  await expectIds(page, original)
  await history(page, 0, 0)
  await click(page, `Premakni ${original[1]} gor`)
  await board(page)
  await link.click()
  await page.reload()
  await expect(page.getByRole('dialog').getByText('Živa Črt', { exact: true })).toBeVisible()
  await click(page, 'Zapri podrobnosti')
  await history(page, 0, 0)
  await expect(page.getByLabel(`Mesto opravila ${original[0]}`, { exact: true })).toHaveText('1')
  await readonly(page, writes)
})

for (const count of [0, 1]) {
  test(`S07: both projects with ${count} tasks stay usable in both views`, async ({ page }) => {
    const data = count === 0 ? [] : [makeTask('solo-web'), makeTask('solo-launch', { projectId: 'launch' })]
    await mount(page, data)
    for (const id of ['web', 'launch'] as const) {
      await project(page, id)
      for (const view of [table, board]) {
        await view(page)
        await history(page, 0, 0)
        await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
        await expect(page.locator('[data-task-id]')).toHaveCount(count)
        if (count) {
          await expect(page.getByLabel(`Mesto opravila solo-${id}`, { exact: true })).toHaveText('1')
          await expect(page.getByRole('button', { name: `Premakni solo-${id} gor`, exact: true })).toBeDisabled()
          await expect(page.getByRole('button', { name: `Premakni solo-${id} dol`, exact: true })).toBeDisabled()
        }
      }
      await expect(page.getByRole('region', { name: 'Tabla opravil', exact: true }).getByRole('region')).toHaveCount(3)
    }
  })
}

test('S04/S08: 23 tasks, history counters at capacity, keyboard and 390px containment', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const data = Array.from({ length: 23 }, (_, i) => makeTask(`t-${i}`))
  const writes = await mount(page, data)
  const firstMove = page.getByRole('button', { name: 'Premakni t-22 gor', exact: true })
  await firstMove.focus()
  await expect(firstMove).toBeFocused()
  expect(await firstMove.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe('none')
  await page.keyboard.press('Enter')
  for (let i = 1; i < 21; i++) await click(page, 'Premakni t-22 gor')
  await history(page, 20, 0)
  await expect(page.getByLabel('Mesto opravila t-22', { exact: true })).toHaveText('2')
  for (let i = 0; i < 20; i++) await click(page, 'Razveljavi premik')
  await history(page, 0, 20)
  await expect(page.getByLabel('Mesto opravila t-22', { exact: true })).toHaveText('22')
  for (let i = 0; i < 20; i++) await click(page, 'Ponovi premik')
  await history(page, 20, 0)
  await readonly(page, writes)
  expect(await page.locator('a button').count()).toBe(0)
  await board(page)
  await expect(page.getByLabel('Mesto opravila t-22', { exact: true })).toHaveText('2')
  await readonly(page, writes)
  expect(await page.locator('a button').count()).toBe(0)
})
