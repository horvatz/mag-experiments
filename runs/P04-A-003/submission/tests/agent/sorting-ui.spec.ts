import { expect, test, type Page } from '@playwright/test'
import { board, columnIds, details, examples, expectIds, makeTask, mount, project, readonly, select, summary, table, webIds } from '../development/helpers.ts'

const labels = ['Primarni ključ', 'Primarna smer', 'Sekundarni ključ', 'Sekundarna smer']
const defaults = ['original', 'asc', 'none', 'asc']
const selected = ['status', 'desc', 'dueDate', 'desc']
async function expectSettings(page: Page, values: string[]) {
  for (const [index, label] of labels.entries()) await expect(page.getByRole('combobox', { name: label, exact: true })).toHaveValue(values[index])
}
async function chooseSettings(page: Page, values: string[]) {
  for (const [index, label] of labels.entries()) await select(page, label, values[index])
}

test('A05: all settings survive view/details and reset on button, project changes and reload', async ({ page }) => {
  await mount(page)
  await expectSettings(page, defaults)
  await expectIds(page, webIds())
  const originalUrl = page.url()
  const storage = await page.evaluate(() => [JSON.stringify(localStorage), JSON.stringify(sessionStorage)])
  await chooseSettings(page, selected)
  const order = ['web-06', 'web-03', 'web-05', 'web-01', 'web-08', 'web-04', 'web-02', 'web-07']
  await expectIds(page, order)
  expect(page.url()).toBe(originalUrl)
  expect(await page.evaluate(() => [JSON.stringify(localStorage), JSON.stringify(sessionStorage)])).toEqual(storage)
  await details(page, 'web-02')
  await expectSettings(page, selected)
  await expectIds(page, order)
  await board(page)
  await expectSettings(page, selected)
  await details(page, 'web-03')
  await expectSettings(page, selected)
  await table(page)
  await expectIds(page, order)
  await page.locator('[data-task-id="web-01"]').getByRole('link').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'Zapri podrobnosti' }).click()
  await expectSettings(page, selected)
  await expectIds(page, order)
  await page.getByRole('button', { name: 'Izvorni vrstni red', exact: true }).click()
  await expectSettings(page, defaults)
  await expectIds(page, webIds())
  await chooseSettings(page, selected)
  await project(page, 'launch')
  await expectSettings(page, defaults)
  await chooseSettings(page, selected)
  await project(page, 'web')
  await expectSettings(page, defaults)
  await expectIds(page, webIds())
  await chooseSettings(page, selected)
  await board(page)
  await page.reload()
  await expectSettings(page, defaults)
  await expect(page.getByRole('button', { name: 'Tabla', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await table(page)
  await expectIds(page, webIds())
})

test('A06: more than ten unique IDs, duplicate titles, board projection, unchanged fields/counts and no writes', async ({ page }) => {
  const records = [
    ...examples,
    makeTask('custom-11', { title: 'Pregled vsebine', description: 'Poseben opis <besedilo> & "citat"', status: 'done', assignee: 'Črt', dueDate: '2028-02-29' }),
    makeTask('custom-12', { title: 'Pregled vsebine', status: 'todo', dueDate: '2025-12-31' }),
    makeTask('custom-13', { title: 'Pregled vsebine', status: 'in_progress', dueDate: '2027-01-01' }),
    makeTask('custom-14', { title: 'alfa 2', status: 'in_progress', dueDate: '2026-09-29' }),
  ]
  const writes = await mount(page, records)
  const taskRequests: string[] = []
  page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/api/')) taskRequests.push(request.method() + ' ' + new URL(request.url()).pathname) })
  await expectIds(page, webIds(records))
  await summary(page, [5, 4, 3])
  const rowsBefore = await page.locator('tbody tr').evaluateAll(rows => Object.fromEntries(rows.map(row => [row.getAttribute('data-task-id'), row.textContent])))
  await chooseSettings(page, ['title', 'desc', 'dueDate', 'asc'])
  const order = ['web-06', 'custom-12', 'web-03', 'web-02', 'custom-13', 'custom-11', 'web-08', 'web-01', 'web-05', 'custom-14', 'web-04', 'web-07']
  await expectIds(page, order)
  expect(await page.locator('tbody tr').evaluateAll(rows => Object.fromEntries(rows.map(row => [row.getAttribute('data-task-id'), row.textContent])))).toEqual(rowsBefore)
  await summary(page, [5, 4, 3])
  await board(page)
  await expect(page.locator('.board-column h3')).toHaveText(['Pripravljeno', 'V delu', 'Končano'])
  await columnIds(page, 'Pripravljeno', ['custom-12', 'web-02', 'web-08', 'web-04', 'web-07'])
  await columnIds(page, 'V delu', ['custom-13', 'web-01', 'web-05', 'custom-14'])
  await columnIds(page, 'Končano', ['web-06', 'web-03', 'custom-11'])
  await expectIds(page, webIds(records), false)
  expect(taskRequests).toEqual([])
  for (const id of ['web-02', 'web-03', 'custom-11', 'custom-12', 'custom-13']) {
    const entry = records.find(record => record.id === id)!
    await page.locator(`[data-task-id="${id}"]`).getByRole('link').click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: entry.title, exact: true })).toBeVisible()
    await expect(dialog.locator('.description p')).toHaveText(entry.description)
    await expect(dialog.locator('time')).toHaveAttribute('datetime', entry.dueDate)
    await expect(dialog.getByText(entry.assignee, { exact: true })).toBeVisible()
    await expect(dialog.locator('dd.task-id')).toHaveText(id)
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
  }
  await table(page)
  await expectIds(page, order)
  await page.getByRole('button', { name: 'Izvorni vrstni red', exact: true }).click()
  await expectIds(page, webIds(records))
  await summary(page, [5, 4, 3])
  await readonly(page, writes)
})

for (const size of [0, 1]) {
  test(`A07: 390px viewport and ${size} tasks support every key/direction, both views and keyboard reset`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const records = size ? [makeTask('only-custom', { title: 'Čas, "citat" in 😀', status: 'in_progress' })] : []
    const writes = await mount(page, records)
    await expectSettings(page, defaults)
    for (const primary of ['original', 'title', 'assignee', 'status', 'dueDate']) {
      for (const direction of ['asc', 'desc']) {
        await chooseSettings(page, [primary, direction, primary === 'original' ? 'none' : primary, direction === 'asc' ? 'desc' : 'asc'])
        await expectIds(page, records.map(record => record.id))
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
        await board(page)
        await expectIds(page, records.map(record => record.id))
        await expect(page.locator('.board-column h3')).toHaveText(['Pripravljeno', 'V delu', 'Končano'])
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
        await table(page)
      }
    }
    for (const label of labels) {
      const control = page.getByRole('combobox', { name: label, exact: true })
      await control.focus()
      await expect(control).toBeFocused()
      expect(await control.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe('none')
      const bounds = await control.boundingBox()
      expect(bounds!.x).toBeGreaterThanOrEqual(0)
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390)
    }
    await page.getByRole('button', { name: 'Izvorni vrstni red', exact: true }).focus()
    await page.keyboard.press('Enter')
    await expectSettings(page, defaults)
    await expectIds(page, records.map(record => record.id))
    await readonly(page, writes)
  })
}
