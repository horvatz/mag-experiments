import { type Page } from '@playwright/test'
import { test, expect, mount, makeTask, expectIds, click, board, table, project, columnIds, summary, readonly } from '../development/helpers.ts'

const records = [
  makeTask('a', { title: 'Enak naslov', status: 'todo' }),
  makeTask('b', { title: 'Enak naslov', status: 'done' }),
  makeTask('c', { status: 'todo' }),
  makeTask('d', { status: 'in_progress' }),
  makeTask('z', { projectId: 'launch' }),
]

async function history(page: Page, undo: number, redo: number) {
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText(`Razveljavitve: ${undo}. Ponovitve: ${redo}.`)
  for (const [name, count] of [['Razveljavi premik', undo], ['Ponovi premik', redo]] as const) {
    if (count === 0) await expect(page.getByRole('button', { name, exact: true })).toBeDisabled()
    else await expect(page.getByRole('button', { name, exact: true })).toBeEnabled()
  }
}

async function ranks(page: Page, ids: string[]) {
  for (const [index, id] of ids.entries()) {
    await expect(page.getByLabel(`Mesto opravila ${id}`, { exact: true })).toHaveText(String(index + 1))
  }
}

test('A01: arbitrary IDs, duplicate titles and 13 tasks keep input order and fields', async ({ page }) => {
  const ids = ['Ž 2/#?[]"', 'item-10', 'item-2', ...Array.from({ length: 10 }, (_, i) => `other-${20 - i}`)]
  const tasks = ids.map((id, i) => makeTask(id, { title: 'Enak naslov – čšž, "citat"', status: i % 2 ? 'done' : 'todo', assignee: `Oseba ${i}`, description: `Opis ${id}\nDruga vrstica.` }))
  const writes = await mount(page, tasks)
  await expectIds(page, ids)
  await ranks(page, ids)
  const fields = () => page.locator('tbody tr').evaluateAll(rows => rows.map(row => ({ id: row.getAttribute('data-task-id'), fields: [...row.querySelectorAll('td')].slice(1).map(cell => cell.textContent) })).sort((a, b) => a.id!.localeCompare(b.id!)))
  const before = await fields()
  await click(page, 'Premakni item-10 gor')
  await click(page, `Premakni ${ids[0]} dol`)
  const expected = [ids[1], ids[2], ids[0], ...ids.slice(3)]
  await expectIds(page, expected)
  await ranks(page, expected)
  expect(await fields()).toEqual(before)
  await board(page)
  await page.getByRole('link', { name: `${tasks[0].title} ${ids[0]}`, exact: true }).click()
  await expect(page.getByRole('dialog').getByText(tasks[0].description, { exact: true })).toBeVisible()
  await expect(page.getByRole('dialog').getByText('Oseba 0', { exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await ranks(page, expected)
  await history(page, 2, 0)
  await readonly(page, writes)
})

test('A02: 21 moves retain 20 snapshots, all undo/redo steps and bounded reset', async ({ page }) => {
  const writes = await mount(page, records)
  const snapshots = [['a', 'b', 'c', 'd']]
  for (let step = 0; step < 21; step++) {
    const next = [...snapshots.at(-1)!]
    const index = step % 3
    await click(page, `Premakni ${next[index]} dol`)
    ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
    snapshots.push(next)
    await expectIds(page, next)
    await history(page, Math.min(step + 1, 20), 0)
  }
  for (let step = 1; step <= 20; step++) {
    await click(page, 'Razveljavi premik')
    await expectIds(page, snapshots[21 - step])
    await history(page, 20 - step, step)
  }
  for (let step = 1; step <= 20; step++) {
    await click(page, 'Ponovi premik')
    await expectIds(page, snapshots[1 + step])
    await history(page, step, 20 - step)
  }
  await click(page, 'Začetni vrstni red')
  await expectIds(page, snapshots[0])
  await history(page, 20, 0)
  await click(page, 'Razveljavi premik')
  await expectIds(page, snapshots[21])
  await history(page, 19, 1)
  await readonly(page, writes)
})

test('A03: reset is one undoable step; only valid new actions discard redo', async ({ page }) => {
  await mount(page, records)
  await click(page, 'Premakni b gor')
  await click(page, 'Premakni d gor')
  await click(page, 'Razveljavi premik')
  await history(page, 1, 1)
  await click(page, 'Začetni vrstni red')
  await expectIds(page, ['a', 'b', 'c', 'd'])
  await history(page, 2, 0)
  await click(page, 'Razveljavi premik')
  await expectIds(page, ['b', 'a', 'c', 'd'])
  await history(page, 1, 1)
  await click(page, 'Ponovi premik')
  await expectIds(page, ['a', 'b', 'c', 'd'])
  await history(page, 2, 0)
  await click(page, 'Razveljavi premik')
  await click(page, 'Razveljavi premik')
  await history(page, 0, 2)
  for (const name of ['Premakni a gor', 'Premakni d dol', 'Začetni vrstni red']) {
    const button = page.getByRole('button', { name, exact: true })
    await expect(button).toBeDisabled()
    await button.evaluate((element: HTMLButtonElement) => { element.click(); element.click() })
  }
  await expectIds(page, ['a', 'b', 'c', 'd'])
  await history(page, 0, 2)
  await click(page, 'Premakni c gor')
  await expectIds(page, ['a', 'c', 'b', 'd'])
  await history(page, 1, 0)
})

test('A04: mobile board uses global neighbors, preserves statuses and supports keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page, records)
  await board(page)
  await summary(page, [2, 1, 1])
  const move = page.getByRole('button', { name: 'Premakni b gor', exact: true })
  await move.focus()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Shift+Tab')
  await expect(move).toBeFocused()
  expect(await move.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe('none')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await ranks(page, ['b', 'a', 'c', 'd'])
  await click(page, 'Premakni c gor')
  await ranks(page, ['b', 'c', 'a', 'd'])
  await columnIds(page, 'Pripravljeno', ['c', 'a'])
  await columnIds(page, 'V delu', ['d'])
  await columnIds(page, 'Končano', ['b'])
  await summary(page, [2, 1, 1])
  expect(await page.getByRole('button', { name: 'Premakni c gor', exact: true }).evaluate(element => element.closest('a') === null)).toBe(true)
  await readonly(page, writes)
  await table(page)
  await expectIds(page, ['b', 'c', 'a', 'd'])
  await readonly(page, writes)
})

test('A05: view and details keep both histories; project changes and reload reset them', async ({ page }) => {
  const writes = await mount(page, records)
  await click(page, 'Premakni b gor')
  await click(page, 'Premakni d gor')
  await click(page, 'Razveljavi premik')
  await history(page, 1, 1)
  await board(page)
  for (const close of ['Escape', 'button']) {
    await page.getByRole('link', { name: 'Enak naslov b', exact: true }).click()
    await expect(page.getByRole('dialog').getByText('Končano', { exact: true })).toBeVisible()
    if (close === 'Escape') await page.keyboard.press('Escape')
    else await click(page, 'Zapri podrobnosti')
    await history(page, 1, 1)
    await ranks(page, ['b', 'a', 'c', 'd'])
  }
  await table(page)
  await click(page, 'Ponovi premik')
  await expectIds(page, ['b', 'a', 'd', 'c'])
  await history(page, 2, 0)
  await project(page, 'launch')
  await expectIds(page, ['z'])
  await history(page, 0, 0)
  await project(page, 'web')
  await expectIds(page, ['a', 'b', 'c', 'd'])
  await history(page, 0, 0)
  for (const view of ['table', 'board']) {
    if (view === 'board') await board(page)
    await click(page, 'Premakni b gor')
    await page.reload()
    await ranks(page, ['a', 'b', 'c', 'd'])
    await history(page, 0, 0)
  }
  await readonly(page, writes)
})

for (const size of [0, 1]) {
  test(`A06-${size}: empty and singleton projects have no permitted move in either view`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const writes = await mount(page, records.slice(0, size))
    for (const view of ['table', 'board']) {
      if (view === 'board') await board(page)
      await history(page, 0, 0)
      await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
      await expect(page.locator('[data-task-id]')).toHaveCount(size)
      if (size) {
        await ranks(page, ['a'])
        await expect(page.getByRole('button', { name: 'Premakni a gor', exact: true })).toBeDisabled()
        await expect(page.getByRole('button', { name: 'Premakni a dol', exact: true })).toBeDisabled()
      }
      await readonly(page, writes)
    }
    await project(page, 'launch')
    await expect(page.locator('[data-task-id]')).toHaveCount(0)
    await history(page, 0, 0)
    await table(page)
    await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
    await project(page, 'web')
    await expect(page.locator('[data-task-id]')).toHaveCount(size)
    await history(page, 0, 0)
  })
}
