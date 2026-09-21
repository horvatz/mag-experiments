import type { Page } from '@playwright/test'
import { test, expect, mount, makeTask, expectIds, click, board, table, project, summary, readonly, columnIds, type Task } from '../development/helpers.ts'

const records: Task[] = Array.from({ length: 13 }, (_, index) => makeTask(`naloga-č-${13 - index}`, {
  title: index < 2 ? 'Enak naslov: čšž, "da"' : `Naslov ${index}`,
  description: `Opis ${index}\nDruga vrstica; čšž`,
  assignee: index % 2 ? 'Živa Novak' : 'Črt Kovač',
  status: (['todo', 'in_progress', 'done'] as const)[index % 3],
  dueDate: '2026-10-02',
})).concat(makeTask('drugi-projekt', { projectId: 'launch', title: 'Drugi projekt' }))
const original = records.filter(task => task.projectId === 'web').map(task => task.id)
const history = async (page: Page, undo: number, redo: number) => {
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText(`Razveljavitve: ${undo}. Ponovitve: ${redo}.`)
  await expect(page.getByRole('button', { name: 'Razveljavi premik', exact: true })).toBeEnabled({ enabled: undo > 0 })
  await expect(page.getByRole('button', { name: 'Ponovi premik', exact: true })).toBeEnabled({ enabled: redo > 0 })
}
async function ranks(page: Page, order: string[]) {
  for (const [index, id] of order.entries()) await expect(page.getByLabel(`Mesto opravila ${id}`, { exact: true })).toHaveText(String(index + 1))
}
async function assertColumns(page: Page, order: string[]) {
  for (const [status, label] of [['todo', 'Pripravljeno'], ['in_progress', 'V delu'], ['done', 'Končano']]) {
    await columnIds(page, label, order.filter(id => records.find(task => task.id === id)!.status === status))
  }
}

test('A01: arbitrary IDs, duplicate titles, global neighbors and unchanged fields', async ({ page }) => {
  const writes = await mount(page, records)
  await expectIds(page, original)
  await ranks(page, original)
  await history(page, 0, 0)
  await summary(page, [5, 4, 4])
  const before = await page.locator('tbody tr').evaluateAll(rows => Object.fromEntries(rows.map(row => [row.getAttribute('data-task-id'), [...row.querySelectorAll('td')].filter((_, index) => index !== 1).map(cell => cell.textContent)])))
  await click(page, `Premakni ${original[1]} gor`)
  const moved = [original[1], original[0], ...original.slice(2)]
  await expectIds(page, moved)
  await ranks(page, moved)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('button', { name: `Premakni ${original[1]} gor`, exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: `Premakni ${original.at(-1)} dol`, exact: true })).toBeDisabled()
  const after = await page.locator('tbody tr').evaluateAll(rows => Object.fromEntries(rows.map(row => [row.getAttribute('data-task-id'), [...row.querySelectorAll('td')].filter((_, index) => index !== 1).map(cell => cell.textContent)])))
  expect(after).toEqual(before)
  await board(page)
  await ranks(page, moved)
  await assertColumns(page, moved)
  await click(page, `Premakni ${original[1]} dol`)
  await ranks(page, original)
  await assertColumns(page, original)
  await history(page, 2, 0)
  await summary(page, [5, 4, 4])
  expect(await page.locator('[data-task-id] button').evaluateAll(buttons => buttons.every(button => !button.closest('a')))).toBe(true)
  await readonly(page, writes)
})

test('A02: undo redo branch, disabled edges and undoable reset', async ({ page }) => {
  const writes = await mount(page, records)
  await click(page, `Premakni ${original[1]} gor`)
  await click(page, `Premakni ${original[2]} gor`)
  await history(page, 2, 0)
  await click(page, 'Razveljavi premik')
  await click(page, 'Razveljavi premik')
  await expectIds(page, original)
  await history(page, 0, 2)
  await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
  await page.getByRole('button', { name: `Premakni ${original[0]} gor`, exact: true }).evaluate((button: HTMLButtonElement) => { button.click(); button.click() })
  await history(page, 0, 2)
  await click(page, 'Ponovi premik')
  const first = [original[1], original[0], ...original.slice(2)]
  await expectIds(page, first)
  await history(page, 1, 1)
  await click(page, `Premakni ${original[3]} gor`)
  const branched = [original[1], original[0], original[3], original[2], ...original.slice(4)]
  await expectIds(page, branched)
  await history(page, 2, 0)
  await click(page, 'Razveljavi premik')
  await history(page, 1, 1)
  await click(page, 'Začetni vrstni red')
  await expectIds(page, original)
  await history(page, 2, 0)
  await click(page, 'Razveljavi premik')
  await expectIds(page, first)
  await click(page, 'Ponovi premik')
  await expectIds(page, original)
  await history(page, 2, 0)
  await readonly(page, writes)
})

test('A03: UI retains 20 undo steps after 21 moves and replays all', async ({ page }) => {
  await mount(page, records)
  for (let i = 0; i < 21; i++) await click(page, `Premakni ${original[0]} ${i % 2 ? 'gor' : 'dol'}`)
  await history(page, 20, 0)
  for (let i = 0; i < 20; i++) await click(page, 'Razveljavi premik')
  await expectIds(page, [original[1], original[0], ...original.slice(2)])
  await history(page, 0, 20)
  for (let i = 0; i < 20; i++) await click(page, 'Ponovi premik')
  await expectIds(page, [original[1], original[0], ...original.slice(2)])
  await history(page, 20, 0)
})

test('A04: view and details preserve both histories; project and refresh reset', async ({ page }) => {
  const writes = await mount(page, records)
  await click(page, `Premakni ${original[1]} gor`)
  await click(page, `Premakni ${original[2]} gor`)
  await click(page, 'Razveljavi premik')
  const moved = [original[1], original[0], ...original.slice(2)]
  await board(page)
  await history(page, 1, 1)
  await page.locator(`[data-task-id="${original[1]}"]`).getByRole('link').click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: records[1].title, exact: true })).toBeVisible()
  await expect(dialog.locator('.description p')).toHaveText(records[1].description)
  await expect(dialog.locator('time')).toHaveAttribute('datetime', records[1].dueDate)
  await expect(dialog.locator('.person')).toContainText(records[1].assignee)
  await expect(dialog.getByText(original[1], { exact: true }).first()).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await history(page, 1, 1)
  await table(page)
  await expectIds(page, moved)
  await click(page, 'Ponovi premik')
  await expectIds(page, [original[1], original[2], original[0], ...original.slice(3)])
  await project(page, 'launch')
  await history(page, 0, 0)
  await expectIds(page, ['drugi-projekt'])
  await project(page, 'web')
  await expectIds(page, original)
  await history(page, 0, 0)
  await click(page, `Premakni ${original[1]} gor`)
  await page.reload()
  await expectIds(page, original)
  await history(page, 0, 0)
  await readonly(page, writes)
})

for (const count of [0, 1]) {
  test(`A05: ${count} tasks, empty second project, both views`, async ({ page }) => {
    const data = count ? [makeTask('samo-eno', { title: 'Čisto samo' })] : []
    const writes = await mount(page, data)
    for (const changeView of [table, board]) {
      await changeView(page)
      await history(page, 0, 0)
      await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
      await expect(page.locator('[data-task-id]')).toHaveCount(count)
      if (count) {
        await ranks(page, ['samo-eno'])
        await expect(page.getByRole('button', { name: 'Premakni samo-eno gor', exact: true })).toBeDisabled()
        await expect(page.getByRole('button', { name: 'Premakni samo-eno dol', exact: true })).toBeDisabled()
      }
    }
    await project(page, 'launch')
    await history(page, 0, 0)
    await expect(page.locator('[data-task-id]')).toHaveCount(0)
    await readonly(page, writes)
  })
}

test('A06: 390px Folio, inner scrolling, keyboard controls outside links', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page, records)
  await expectIds(page, original)
  await readonly(page, writes)
  expect(await page.locator('.table-scroll').evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true)
  const down = page.getByRole('button', { name: `Premakni ${original[0]} dol`, exact: true })
  await down.focus()
  await page.keyboard.press('Enter')
  await history(page, 1, 0)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await board(page)
  await readonly(page, writes)
  expect(await page.locator('.board-scroll').evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true)
  const up = page.getByRole('button', { name: `Premakni ${original[0]} gor`, exact: true })
  await up.focus()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Shift+Tab')
  await expect(up).toBeFocused()
  expect(await up.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe('none')
  await page.keyboard.press('Enter')
  await ranks(page, original)
  expect(await page.locator('[data-task-id] button').evaluateAll(buttons => buttons.every(button => !button.closest('a')))).toBe(true)
  await readonly(page, writes)
})
