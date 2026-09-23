import { expect, test, type Page } from '@playwright/test'
import { mount, makeTask, select, expectIds, ids, board, table, project, summary, readonly, columnIds } from '../development/helpers.ts'

const labels = ['Primarni ključ', 'Primarna smer', 'Sekundarni ključ', 'Sekundarna smer']
const defaults = ['original', 'asc', 'none', 'asc']
const records = Array.from({ length: 13 }, (_, i) => makeTask(`custom-${i}`, {
  title: 'Enak naslov', description: `Edinstven opis ${i}: čšž, "citat"`,
  status: (['todo', 'in_progress', 'done'] as const)[i % 3],
  assignee: i % 2 ? 'Živa' : 'Ana', dueDate: `2026-09-${String(i + 1).padStart(2, '0')}`,
}))
const idList = (values: number[]) => values.map(i => `custom-${i}`)
const allIds = records.map(t => t.id)
const storage = (page: Page) => page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }))
async function settings(page: Page, values: string[]) {
  for (let i = 0; i < labels.length; i++) await select(page, labels[i], values[i])
}
async function expectSettings(page: Page, values: string[]) {
  for (let i = 0; i < labels.length; i++) await expect(page.getByRole('combobox', { name: labels[i], exact: true })).toHaveValue(values[i])
}
async function checkDetail(page: Page, index: number, closeButton = false) {
  await page.locator(`[data-task-id="custom-${index}"]`).getByRole('link').click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText(records[index].description, { exact: true })).toBeVisible()
  await expect(dialog.getByText(records[index].id, { exact: true }).first()).toBeVisible()
  if (closeButton) await dialog.getByRole('button', { name: 'Zapri podrobnosti' }).click()
  else await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
}

test('U01 defaults, shared projection, independent directions, duplicate details and no writes', async ({ page }) => {
  const writes = await mount(page, records)
  await expectSettings(page, defaults)
  await expectIds(page, allIds)
  const stored = await storage(page)
  const initialUrl = page.url()
  const chosen = ['status', 'desc', 'dueDate', 'desc']
  await settings(page, chosen)
  expect(page.url()).toBe(initialUrl)
  const order = idList([11, 8, 5, 2, 10, 7, 4, 1, 12, 9, 6, 3, 0])
  await expectIds(page, order)
  await summary(page, [5, 4, 4])
  for (let i = 0; i < records.length; i++) {
    await checkDetail(page, i, i % 2 === 0)
    await expectSettings(page, chosen)
    await expectIds(page, order)
  }
  await board(page)
  await expectSettings(page, chosen)
  await expect(page.locator('.board-column h3')).toHaveText(['Pripravljeno', 'V delu', 'Končano'])
  for (const [status, name] of [['todo', 'Pripravljeno'], ['in_progress', 'V delu'], ['done', 'Končano']]) {
    await columnIds(page, name, order.filter(id => records.find(t => t.id === id)?.status === status))
  }
  expect(new Set(await ids(page)).size).toBe(13)
  await checkDetail(page, 0)
  await checkDetail(page, 12, true)
  await expectSettings(page, chosen)
  await select(page, 'Sekundarna smer', 'asc')
  await columnIds(page, 'Pripravljeno', idList([0, 3, 6, 9, 12]))
  await columnIds(page, 'V delu', idList([1, 4, 7, 10]))
  await columnIds(page, 'Končano', idList([2, 5, 8, 11]))
  await table(page)
  await expectIds(page, idList([2, 5, 8, 11, 1, 4, 7, 10, 0, 3, 6, 9, 12]))
  await select(page, 'Primarni ključ', 'original')
  await expectIds(page, allIds)
  await expectSettings(page, ['original', 'desc', 'dueDate', 'asc'])
  await settings(page, chosen)
  await page.getByRole('button', { name: 'Izvorni vrstni red', exact: true }).click()
  await expectSettings(page, defaults)
  await expectIds(page, allIds)
  await summary(page, [5, 4, 4])
  expect(await storage(page)).toEqual(stored)
  await readonly(page, writes)
})

test('U02 project changes and refresh reset all settings without storage', async ({ page }) => {
  const writes = await mount(page, [...records, makeTask('different-project', { projectId: 'launch' })])
  const stored = await storage(page)
  await settings(page, ['assignee', 'desc', 'title', 'desc'])
  await board(page)
  await project(page, 'launch')
  await expectSettings(page, defaults)
  await expectIds(page, ['different-project'])
  await settings(page, ['dueDate', 'desc', 'status', 'desc'])
  await project(page, 'web')
  await expectSettings(page, defaults)
  await table(page)
  await expectIds(page, allIds)
  await settings(page, ['title', 'desc', 'assignee', 'desc'])
  await page.reload()
  await expectSettings(page, defaults)
  await expectIds(page, allIds)
  expect(new URL(page.url()).hash).toBe('#/projects/web')
  expect(await storage(page)).toEqual(stored)
  await readonly(page, writes)
})

for (const count of [0, 1]) {
  test(`U03 ${count} tasks: all 100 settings in both views`, async ({ page }) => {
    test.setTimeout(120_000)
    const source = records.slice(0, count)
    const writes = await mount(page, source)
    const expected = source.map(t => t.id)
    for (const primary of ['original', 'title', 'assignee', 'status', 'dueDate']) {
      await select(page, 'Primarni ključ', primary)
      for (const direction of ['asc', 'desc']) {
        await select(page, 'Primarna smer', direction)
        for (const secondary of ['none', 'title', 'assignee', 'status', 'dueDate']) {
          await select(page, 'Sekundarni ključ', secondary)
          for (const secondaryDirection of ['asc', 'desc']) {
            await select(page, 'Sekundarna smer', secondaryDirection)
            await expectIds(page, expected)
            await board(page)
            await expectIds(page, expected)
            await expect(page.locator('.board-column')).toHaveCount(3)
            await expectSettings(page, [primary, direction, secondary, secondaryDirection])
            await table(page)
          }
        }
      }
    }
    await readonly(page, writes)
  })
}

test('U04 Folio, accessible controls and focus at 390px and desktop', async ({ page }) => {
  const writes = await mount(page, records)
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 960 })
    await table(page)
    await expectSettings(page, defaults)
    await page.getByRole('combobox', { name: 'Primarni ključ', exact: true }).focus()
    await page.keyboard.press('Tab')
    const direction = page.getByRole('combobox', { name: 'Primarna smer', exact: true })
    await expect(direction).toBeFocused()
    expect(await direction.evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none')
    await readonly(page, writes)
    await page.screenshot({ path: `docs/agent/P04/folio-table-${width}.png`, fullPage: true })
    await board(page)
    await readonly(page, writes)
    await page.screenshot({ path: `docs/agent/P04/folio-board-${width}.png`, fullPage: true })
  }
})
