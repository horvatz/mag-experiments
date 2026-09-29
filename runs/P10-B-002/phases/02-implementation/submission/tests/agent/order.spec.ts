import { type Page } from '@playwright/test'
import { test, expect, mount, makeTask, expectIds, click, board, table, project, summary, columnIds, readonly } from '../development/helpers.ts'

const undo = (page: Page) => click(page, 'Razveljavi premik')
const redo = (page: Page) => click(page, 'Ponovi premik')
const reset = (page: Page) => click(page, 'Začetni vrstni red')
const move = (page: Page, id: string, direction = 'gor') => click(page, `Premakni ${id} ${direction}`)
const row = (page: Page, id: string) => page.locator('[data-task-id]').filter({ has: page.getByRole('button', { name: `Premakni ${id} gor`, exact: true }) })

async function history(page: Page, u: number, r: number) {
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText(`Razveljavitve: ${u}. Ponovitve: ${r}.`)
  const undoButton = page.getByRole('button', { name: 'Razveljavi premik', exact: true })
  const redoButton = page.getByRole('button', { name: 'Ponovi premik', exact: true })
  if (u === 0) await expect(undoButton).toBeDisabled()
  else await expect(undoButton).toBeEnabled()
  if (r === 0) await expect(redoButton).toBeDisabled()
  else await expect(redoButton).toBeEnabled()
}

async function ranks(page: Page, ids: string[]) {
  for (const [index, id] of ids.entries()) await expect(page.getByLabel(`Mesto opravila ${id}`, { exact: true })).toHaveText(String(index + 1))
}

test('S1: arbitrary IDs, duplicate Unicode titles, >10 tasks and unchanged details', async ({ page }) => {
  const ids = ['č /?#" β', 'z-last', ...Array.from({ length: 11 }, (_, i) => `opaque-${31 - i}`)]
  const records = ids.map((id, i) => makeTask(id, { title: 'Enak naslov čšž, "citat"', description: `Opis ${i}\nDruga vrstica <b>besedilo</b>`, assignee: `Oseba ${i}`, dueDate: '2028-02-29', status: i % 2 ? 'done' : 'todo' }))
  const writes = await mount(page, records)
  await expectIds(page, ids)
  await ranks(page, ids)
  await move(page, ids[1])
  const changed = [ids[1], ids[0], ...ids.slice(2)]
  await expectIds(page, changed)
  await ranks(page, changed)
  await summary(page, [7, 0, 6])
  await board(page)
  await ranks(page, changed)
  await row(page, ids[0]).getByRole('link').click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: records[0].title, exact: true })).toBeVisible()
  await expect(dialog.getByText(records[0].description, { exact: true })).toHaveText(records[0].description)
  await expect(dialog.getByText(records[0].assignee, { exact: true })).toBeVisible()
  await expect(dialog.locator('time')).toHaveAttribute('datetime', '2028-02-29')
  await expect(dialog.getByText('Pripravljeno', { exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await history(page, 1, 0)
  await readonly(page, writes)
})

test('S2: multiple undo/redo, boundary no-op, branching and undoable reset', async ({ page }) => {
  await mount(page, ['a', 'b', 'c', 'd'].map(id => makeTask(id)))
  const states = [['a', 'b', 'c', 'd'], ['b', 'a', 'c', 'd'], ['b', 'c', 'a', 'd'], ['b', 'c', 'd', 'a']]
  await move(page, 'b'); await move(page, 'c'); await move(page, 'd')
  await expectIds(page, states[3]); await history(page, 3, 0)
  for (let i = 2; i >= 0; i--) { await undo(page); await expectIds(page, states[i]); await history(page, i, 3 - i) }
  for (const name of ['Premakni a gor', 'Premakni d dol', 'Začetni vrstni red']) {
    const button = page.getByRole('button', { name, exact: true })
    await expect(button).toBeDisabled()
    await button.evaluate((element: HTMLButtonElement) => { element.click(); element.click() })
  }
  await history(page, 0, 3); await expectIds(page, states[0])
  for (let i = 1; i <= 3; i++) { await redo(page); await expectIds(page, states[i]); await history(page, i, 3 - i) }
  await undo(page); await undo(page)
  await move(page, 'd')
  await expectIds(page, ['b', 'a', 'd', 'c']); await history(page, 2, 0)
  await undo(page)
  await reset(page); await history(page, 2, 0); await expectIds(page, states[0])
  await undo(page); await expectIds(page, states[1]); await history(page, 1, 1)
  await redo(page); await expectIds(page, states[0]); await history(page, 2, 0)
})

test('S3: 21 moves retain exactly 20 snapshots, including reset at capacity', async ({ page }) => {
  test.setTimeout(90_000)
  const initial = Array.from({ length: 24 }, (_, i) => `id-${i}`)
  await mount(page, initial.map(id => makeTask(id)))
  const states = [initial]
  for (let i = 1; i <= 21; i++) {
    await move(page, 'id-0', 'dol')
    const expected = [...initial.slice(1, i + 1), 'id-0', ...initial.slice(i + 1)]
    states.push(expected)
    await expectIds(page, expected); await history(page, Math.min(i, 20), 0)
  }
  for (let i = 20; i >= 1; i--) { await undo(page); await expectIds(page, states[i]); await history(page, i - 1, 21 - i) }
  for (let i = 2; i <= 21; i++) { await redo(page); await expectIds(page, states[i]); await history(page, i - 1, 21 - i) }
  await reset(page); await expectIds(page, initial); await history(page, 20, 0)
  for (let i = 0; i < 20; i++) await undo(page)
  await expectIds(page, states[2]); await history(page, 0, 20)
  for (let i = 0; i < 20; i++) await redo(page)
  await expectIds(page, initial); await history(page, 20, 0)
})

test('S4: board uses global neighbors and keeps column membership at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const records = [makeTask('a', { title: 'Dolgo'.repeat(40) }), makeTask('b', { status: 'done' }), makeTask('c')]
  const writes = await mount(page, records)
  await board(page)
  await move(page, 'c')
  await ranks(page, ['a', 'c', 'b'])
  await columnIds(page, 'Pripravljeno', ['a', 'c']); await columnIds(page, 'Končano', ['b'])
  await expect(page.getByRole('dialog')).toHaveCount(0)
  const up = page.getByRole('button', { name: 'Premakni c gor', exact: true })
  await up.focus()
  await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab')
  await expect(up).toBeFocused()
  expect(await up.evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none')
  await page.keyboard.press('Enter')
  await ranks(page, ['c', 'a', 'b'])
  await columnIds(page, 'Pripravljeno', ['c', 'a'])
  await summary(page, [2, 0, 1])
  expect(await page.locator('[data-task-id] a button').count()).toBe(0)
  await readonly(page, writes)
  await page.screenshot({ path: 'docs/agent/mobile-board.png', fullPage: true })
  await table(page); await expectIds(page, ['c', 'a', 'b']); await ranks(page, ['c', 'a', 'b'])
  await readonly(page, writes)
  await page.screenshot({ path: 'docs/agent/mobile-table.png', fullPage: true })
})

test('S5: views and details preserve both stacks; projects and refresh reset them', async ({ page }) => {
  const records = ['a', 'b', 'c'].map(id => makeTask(id)).concat(['x', 'y'].map(id => makeTask(id, { projectId: 'launch' })))
  const writes = await mount(page, records)
  await move(page, 'b'); await move(page, 'c'); await undo(page)
  await history(page, 1, 1)
  await board(page)
  for (const closeWithEscape of [false, true]) {
    await row(page, 'b').getByRole('link').click()
    await expect(page.getByRole('dialog').getByRole('heading', { name: 'Opravilo b', exact: true })).toBeVisible()
    if (closeWithEscape) await page.keyboard.press('Escape')
    else await click(page, 'Zapri podrobnosti')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await history(page, 1, 1)
  }
  await table(page); await expectIds(page, ['b', 'a', 'c']); await history(page, 1, 1)
  await redo(page); await expectIds(page, ['b', 'c', 'a'])
  await undo(page); await undo(page); await expectIds(page, ['a', 'b', 'c']); await history(page, 0, 2)
  await project(page, 'launch'); await history(page, 0, 0); await expectIds(page, ['x', 'y'])
  await move(page, 'y'); await project(page, 'web'); await history(page, 0, 0); await expectIds(page, ['a', 'b', 'c'])
  await project(page, 'launch'); await expectIds(page, ['x', 'y']); await history(page, 0, 0)
  await move(page, 'y'); await page.reload(); await expectIds(page, ['x', 'y']); await history(page, 0, 0)
  await readonly(page, writes)
})

for (const size of [0, 1]) {
  test(`S6: both projects with ${size} tasks remain usable in both views`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const records = size ? [makeTask('only-web'), makeTask('only-launch', { projectId: 'launch' })] : []
    const writes = await mount(page, records)
    for (const id of ['web', 'launch', 'web'] as const) {
      await project(page, id)
      for (const show of [table, board]) {
        await show(page); await history(page, 0, 0)
        await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
        await expect(page.locator('[data-task-id]')).toHaveCount(size)
        if (size) {
          await ranks(page, [`only-${id}`])
          for (const direction of ['gor', 'dol']) await expect(page.getByRole('button', { name: `Premakni only-${id} ${direction}`, exact: true })).toBeDisabled()
        }
        await readonly(page, writes)
      }
    }
  })
}
