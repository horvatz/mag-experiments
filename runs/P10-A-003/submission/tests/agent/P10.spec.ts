import { expect, test, type Page } from '@playwright/test'
import { board, click, columnIds, expectIds, makeTask, mount, project, readonly, summary, table, type Task } from '../development/helpers.ts'
import { createTaskOrder, taskOrderReducer } from '../../src/taskOrder.ts'

async function history(page: Page, undo: number, redo: number) {
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText(`Razveljavitve: ${undo}. Ponovitve: ${redo}.`)
  await expect(page.getByRole('button', { name: 'Razveljavi premik', exact: true })).toBeEnabled({ enabled: undo > 0 })
  await expect(page.getByRole('button', { name: 'Ponovi premik', exact: true })).toBeEnabled({ enabled: redo > 0 })
}

async function ranks(page: Page, order: string[]) {
  for (const [index, id] of order.entries()) {
    await expect(page.getByLabel(`Mesto opravila ${id}`, { exact: true })).toHaveText(String(index + 1))
  }
}

const records: Task[] = [
  makeTask('z-9', { title: 'Enak naslov čšž <b> & "', status: 'todo' }),
  makeTask('a-2', { title: 'Enak naslov čšž <b> & "', status: 'in_progress', assignee: 'Živa Kovač', description: 'Drugačen opis\nUnicode: čšž, "citat".', dueDate: '2028-02-29' }),
  makeTask('k-7', { status: 'todo' }),
  makeTask('b-1', { status: 'done' }),
  makeTask('c-3', { status: 'in_progress' }),
  makeTask('other', { projectId: 'launch' }),
]
const initial = records.filter(task => task.projectId === 'web').map(task => task.id)

test('A01: arbitrary IDs, duplicate titles, exact fields and local keyboard moves', async ({ page }) => {
  const strangeId = 'č / "x"%'
  const data = [...records, makeTask(strangeId), ...Array.from({ length: 9 }, (_, index) => makeTask(`extra-${9 - index}`))]
  const writes = await mount(page, data)
  const original = data.filter(task => task.projectId === 'web').map(task => task.id)
  await expectIds(page, original)
  await ranks(page, original)
  await history(page, 0, 0)
  const fieldsBefore = await page.locator('tbody tr').evaluateAll(rows => Object.fromEntries(rows.map(row => [row.getAttribute('data-task-id'), [...row.querySelectorAll('td')].filter((_, i) => i !== 1).map(cell => cell.textContent)])))
  await page.getByRole('button', { name: 'Premakni a-2 dol', exact: true }).focus()
  await page.keyboard.press('Enter')
  const changed = [...original]
  ;[changed[1], changed[2]] = [changed[2], changed[1]]
  await expectIds(page, changed)
  await ranks(page, changed)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  const fieldsAfter = await page.locator('tbody tr').evaluateAll(rows => Object.fromEntries(rows.map(row => [row.getAttribute('data-task-id'), [...row.querySelectorAll('td')].filter((_, i) => i !== 1).map(cell => cell.textContent)])))
  expect(fieldsAfter).toEqual(fieldsBefore)
  await board(page)
  const strangeCard = page.locator('[data-task-id]').filter({ has: page.getByLabel(`Mesto opravila ${strangeId}`, { exact: true }) })
  await expect(strangeCard.getByRole('link')).toHaveAccessibleName(`Opravilo ${strangeId} ${strangeId}`)
  await strangeCard.getByRole('link').click()
  await expect(page.getByRole('dialog').getByRole('heading', { name: `Opravilo ${strangeId}`, exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await history(page, 1, 0)
  expect(await page.locator('a button').count()).toBe(0)
  await readonly(page, writes)
})

test('A02: full undo/redo stacks, boundary no-ops and reset branching', async ({ page }) => {
  const writes = await mount(page, records)
  await click(page, 'Premakni a-2 gor')
  const first = ['a-2', 'z-9', 'k-7', 'b-1', 'c-3']
  await click(page, 'Premakni c-3 gor')
  const second = ['a-2', 'z-9', 'k-7', 'c-3', 'b-1']
  await history(page, 2, 0)
  await click(page, 'Razveljavi premik')
  await expectIds(page, first)
  await click(page, 'Razveljavi premik')
  await expectIds(page, initial)
  await history(page, 0, 2)
  for (const name of ['Premakni z-9 gor', 'Premakni c-3 dol', 'Začetni vrstni red', 'Razveljavi premik']) {
    const button = page.getByRole('button', { name, exact: true })
    await expect(button).toBeDisabled()
    await button.evaluate((element: HTMLButtonElement) => { element.click(); element.click() })
  }
  await history(page, 0, 2)
  await click(page, 'Ponovi premik')
  await expectIds(page, first)
  await click(page, 'Ponovi premik')
  await expectIds(page, second)
  await click(page, 'Razveljavi premik')
  await click(page, 'Začetni vrstni red')
  await expectIds(page, initial)
  await history(page, 2, 0)
  await click(page, 'Razveljavi premik')
  await expectIds(page, first)
  await history(page, 1, 1)
  await click(page, 'Ponovi premik')
  await expectIds(page, initial)
  await click(page, 'Razveljavi premik')
  await click(page, 'Premakni k-7 dol')
  await expectIds(page, ['a-2', 'z-9', 'b-1', 'k-7', 'c-3'])
  await history(page, 2, 0)
  await readonly(page, writes)
})

test('A03: 25 distinct moves retain exactly the last 20 snapshots and redo all 20', async ({ page }) => {
  const data = Array.from({ length: 26 }, (_, index) => makeTask(`long-${index}`))
  const writes = await mount(page, data)
  const original = data.map(task => task.id)
  const snapshots = [original]
  // Independent expected order: remove the last task and insert it at its new position.
  for (let step = 1; step <= 25; step++) {
    const expected = original.slice(0, -1)
    expected.splice(25 - step, 0, 'long-25')
    snapshots.push(expected)
    await click(page, 'Premakni long-25 gor')
    await expectIds(page, expected)
    await history(page, Math.min(step, 20), 0)
  }
  for (let step = 1; step <= 20; step++) {
    await click(page, 'Razveljavi premik')
    await expectIds(page, snapshots[25 - step])
    await history(page, 20 - step, step)
  }
  await expectIds(page, snapshots[5])
  for (let step = 1; step <= 20; step++) {
    await click(page, 'Ponovi premik')
    await expectIds(page, snapshots[5 + step])
    await history(page, step, 20 - step)
  }
  await ranks(page, snapshots[25])
  await click(page, 'Začetni vrstni red')
  await expectIds(page, original)
  await history(page, 20, 0)
  await click(page, 'Razveljavi premik')
  await expectIds(page, snapshots[25])
  await readonly(page, writes)
})

test('A04: board uses global neighbors and preserves both histories across views and details at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page, records)
  await board(page)
  await click(page, 'Premakni k-7 gor')
  const moved = ['z-9', 'k-7', 'a-2', 'b-1', 'c-3']
  await ranks(page, moved)
  await columnIds(page, 'Pripravljeno', ['z-9', 'k-7'])
  await columnIds(page, 'V delu', ['a-2', 'c-3'])
  await columnIds(page, 'Končano', ['b-1'])
  await click(page, 'Premakni k-7 gor')
  await columnIds(page, 'Pripravljeno', ['k-7', 'z-9'])
  await click(page, 'Razveljavi premik')
  await history(page, 1, 1)
  await page.locator('[data-task-id="a-2"]').getByRole('link').click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByText('Živa Kovač', { exact: true })).toBeVisible()
  await expect(dialog.getByText('Drugačen opis\nUnicode: čšž, "citat".', { exact: true })).toBeVisible()
  await expect(dialog.locator('time')).toHaveAttribute('datetime', '2028-02-29')
  await expect(dialog.getByText('V delu', { exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await history(page, 1, 1)
  await table(page)
  await expectIds(page, moved)
  await history(page, 1, 1)
  await click(page, 'Ponovi premik')
  await expectIds(page, ['k-7', 'z-9', 'a-2', 'b-1', 'c-3'])
  await page.locator('[data-task-id="a-2"]').getByRole('link').click()
  await click(page, 'Zapri podrobnosti')
  await history(page, 2, 0)
  await summary(page, [2, 2, 1])
  await readonly(page, writes)
  await board(page)
  await summary(page, [2, 2, 1])
  await readonly(page, writes)
})

test('A05: project navigation and refresh reset both histories including browser back', async ({ page }) => {
  await mount(page, [...records, makeTask('other-2', { projectId: 'launch' })])
  await click(page, 'Premakni a-2 gor')
  await click(page, 'Premakni c-3 gor')
  await click(page, 'Razveljavi premik')
  await history(page, 1, 1)
  await project(page, 'launch')
  await expectIds(page, ['other', 'other-2'])
  await history(page, 0, 0)
  await click(page, 'Premakni other dol')
  await expectIds(page, ['other-2', 'other'])
  await page.goBack()
  await expectIds(page, initial)
  await history(page, 0, 0)
  await project(page, 'launch')
  await expectIds(page, ['other', 'other-2'])
  await history(page, 0, 0)
  await project(page, 'web')
  await click(page, 'Premakni a-2 gor')
  await click(page, 'Premakni c-3 gor')
  await click(page, 'Razveljavi premik')
  await board(page)
  await page.locator('[data-task-id="a-2"]').getByRole('link').click()
  await page.reload()
  await expect(page.getByRole('dialog').getByText('Živa Kovač', { exact: true })).toBeVisible()
  await click(page, 'Zapri podrobnosti')
  await ranks(page, initial)
  await history(page, 0, 0)
  await table(page)
  await expectIds(page, initial)
})

test('A06: empty projects and a single task remain usable in both views at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page, [])
  for (const id of ['web', 'launch'] as const) {
    await project(page, id)
    await history(page, 0, 0)
    await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
    await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
    await board(page)
    await expect(page.getByRole('region', { name: 'Tabla opravil', exact: true }).getByRole('region')).toHaveCount(3)
    await expect(page.getByRole('button', { name: /^Premakni / })).toHaveCount(0)
    await summary(page, [0, 0, 0])
    await readonly(page, writes)
    await table(page)
  }
  await page.unroute('**/api/**')
  const singleWrites = await mount(page, [makeTask('only', { title: 'Edino opravilo', status: 'done' })])
  for (const showBoard of [false, true]) {
    if (showBoard) await board(page)
    await history(page, 0, 0)
    await ranks(page, ['only'])
    await expect(page.getByRole('button', { name: 'Premakni only gor', exact: true })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Premakni only dol', exact: true })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
    await page.locator('[data-task-id="only"]').getByRole('link').click()
    await expect(page.getByRole('dialog').getByRole('heading', { name: 'Edino opravilo' })).toBeVisible()
    await click(page, 'Zapri podrobnosti')
    await summary(page, [0, 0, 1])
    await readonly(page, singleWrites)
  }
})

test('A07: rejected reducer actions preserve pending redo and input snapshots', () => {
  const input = Object.freeze(['a', 'b', 'c'])
  const original = createTaskOrder(input)
  Object.freeze(original.present)
  Object.freeze(original.initial)
  const moved = taskOrderReducer(original, { type: 'move', id: 'a', direction: 1 })
  const undone = taskOrderReducer(moved, { type: 'undo' })
  for (let repeat = 0; repeat < 3; repeat++) {
    expect(taskOrderReducer(undone, { type: 'move', id: 'a', direction: -1 })).toBe(undone)
    expect(taskOrderReducer(undone, { type: 'move', id: 'c', direction: 1 })).toBe(undone)
    expect(taskOrderReducer(undone, { type: 'move', id: 'missing', direction: 1 })).toBe(undone)
    expect(taskOrderReducer(undone, { type: 'reset' })).toBe(undone)
    expect(taskOrderReducer(undone, { type: 'undo' })).toBe(undone)
  }
  expect(taskOrderReducer(undone, { type: 'redo' })).toEqual(moved)
  expect(original.present).toEqual(input)
  expect(moved.present).toEqual(['b', 'a', 'c'])
  expect(taskOrderReducer(original, { type: 'redo' })).toBe(original)
})
