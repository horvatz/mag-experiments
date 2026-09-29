import { test, expect, type Page } from '@playwright/test'
import type { Task, TaskStatus } from '../../shared/types.ts'
import { mount, expectIds, select, click, board, table, project, summary, columnIds, readonly } from '../development/helpers.ts'

// Deliberately unsorted IDs, duplicate titles, Unicode and URL punctuation.
const statuses: TaskStatus[] = ['in_progress', 'done', 'todo']
const records: Task[] = Array.from({ length: 23 }, (_, index) => ({
  id: `opravilo-ž/${(index * 7 + 11) % 23}?v=1`,
  projectId: 'web',
  title: 'Enak naslov, "čšž" <besedilo>',
  description: `Opis ${index + 1}: čšž & <navadno besedilo>\nDruga vrstica.`,
  status: statuses[index % 3],
  assignee: `Oseba ${index + 1}`,
  dueDate: '2028-02-29',
}))
const names: Record<TaskStatus, string> = { todo: 'Pripravljeno', in_progress: 'V delu', done: 'Končano' }
const idList = (tasks: Task[]) => tasks.map(task => task.id)
const pageStatus = (page: Page) => page.getByRole('status', { name: 'Stanje straničenja', exact: true })
const navigation = ['Prva stran', 'Prejšnja stran', 'Naslednja stran', 'Zadnja stran']

async function expectStatus(page: Page, text: string) {
  await expect(pageStatus(page)).toHaveText(text)
}

async function expectEdges(page: Page, first: boolean, last: boolean) {
  for (const [index, name] of navigation.entries()) {
    const button = page.getByRole('button', { name, exact: true })
    if (index < 2 ? first : last) await expect(button).toBeDisabled()
    else await expect(button).toBeEnabled()
  }
}

test('A01: all defaults and complete ordered partitions at sizes 2, 5 and 10', async ({ page }) => {
  const writes = await mount(page, records)
  await expect(page.getByRole('combobox', { name: 'Velikost strani' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter strani' })).toHaveValue('all')
  await expectIds(page, idList(records))
  await expectStatus(page, 'Stran 1 od 1. Prikazano 1–23 od 23.')
  await expectEdges(page, true, true)

  for (const size of [2, 5, 10]) {
    await select(page, 'Velikost strani', String(size))
    const collected: string[] = []
    const count = Math.ceil(records.length / size)
    for (let number = 1; number <= count; number++) {
      const expected = records.slice((number - 1) * size, number * size)
      await expectIds(page, idList(expected))
      await expectStatus(page, `Stran ${number} od ${count}. Prikazano ${(number - 1) * size + 1}–${Math.min(number * size, 23)} od 23.`)
      await expectEdges(page, number === 1, number === count)
      collected.push(...await page.locator('[data-task-id]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-task-id')!)))
      if (number < count) await click(page, 'Naslednja stran')
    }
    expect(collected).toEqual(idList(records))
    expect(new Set(collected).size).toBe(23)
  }
  await readonly(page, writes)
})

test('A02: all navigation actions, disabled edges and size reset from still-valid page', async ({ page }) => {
  await mount(page, records)
  await select(page, 'Velikost strani', '5')
  await click(page, 'Zadnja stran')
  await expectIds(page, idList(records.slice(20)))
  await click(page, 'Prejšnja stran')
  await expectIds(page, idList(records.slice(15, 20)))
  await click(page, 'Prva stran')
  await expectIds(page, idList(records.slice(0, 5)))
  // Native disabled buttons cannot change state even via HTMLElement.click().
  for (const name of navigation.slice(0, 2)) await page.getByRole('button', { name, exact: true }).evaluate((button: HTMLButtonElement) => button.click())
  await expectStatus(page, 'Stran 1 od 5. Prikazano 1–5 od 23.')
  await click(page, 'Naslednja stran')
  await select(page, 'Velikost strani', '10')
  await expectStatus(page, 'Stran 1 od 3. Prikazano 1–10 od 23.')
  await expectIds(page, idList(records.slice(0, 10)))
  await click(page, 'Zadnja stran')
  for (const name of navigation.slice(2)) await page.getByRole('button', { name, exact: true }).evaluate((button: HTMLButtonElement) => button.click())
  await expectStatus(page, 'Stran 3 od 3. Prikazano 21–23 od 23.')
  await select(page, 'Velikost strani', 'all')
  await expectIds(page, idList(records))
  await expectStatus(page, 'Stran 1 od 1. Prikazano 1–23 od 23.')
  await expectEdges(page, true, true)
})

test('A03: every filter precedes the shared board slice; summary and column counts differ correctly', async ({ page }) => {
  const writes = await mount(page, records)
  await select(page, 'Velikost strani', '5')
  await click(page, 'Naslednja stran')
  await board(page)
  const middle = records.slice(5, 10)
  await expectIds(page, idList(middle), false)
  for (const status of statuses) {
    const expected = middle.filter(task => task.status === status)
    await columnIds(page, names[status], idList(expected))
    await expect(page.getByRole('region', { name: names[status], exact: true }).locator('.column-count')).toHaveText(String(expected.length))
  }
  await summary(page, [7, 8, 8])
  await expect(page.locator('.count-badge')).toHaveText('23')
  for (const status of statuses) {
    const filtered = records.filter(task => task.status === status)
    await select(page, 'Filter strani', status)
    await expectIds(page, idList(filtered.slice(0, 5)))
    await expectStatus(page, `Stran 1 od 2. Prikazano 1–5 od ${filtered.length}.`)
    await click(page, 'Zadnja stran')
    await expectIds(page, idList(filtered.slice(5)))
    await table(page)
    await expectIds(page, idList(filtered.slice(5)))
    await summary(page, [7, 8, 8])
    await expect(page.locator('.count-badge')).toHaveText('23')
    await board(page)
  }
  await select(page, 'Filter strani', 'all')
  await expectIds(page, idList(records.slice(0, 5)), false)
  await expectStatus(page, 'Stran 1 od 5. Prikazano 1–5 od 23.')
  await readonly(page, writes)
})

test('A04: views, duplicate-title details and all closing methods retain page, size and filter', async ({ page }) => {
  const writes = await mount(page, records)
  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'todo')
  await click(page, 'Naslednja stran')
  const visible = records.filter(task => task.status === 'todo').slice(2, 4)
  const chosen = visible[1]
  const entry = page.locator('[data-task-id]').filter({ has: page.getByText(chosen.id, { exact: true }) }).getByRole('link')
  for (const mode of ['escape', 'button', 'back'] as const) {
    if (mode === 'button') await board(page)
    if (mode === 'back') await table(page)
    await expectIds(page, idList(visible))
    await entry.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: chosen.title, exact: true })).toBeVisible()
    await expect(dialog.getByText(chosen.assignee, { exact: true })).toBeVisible()
    await expect(dialog.locator('.description p')).toHaveText(chosen.description)
    await expect(dialog.locator('time')).toHaveAttribute('datetime', chosen.dueDate)
    expect(page.url()).toContain(encodeURIComponent(chosen.id))
    if (mode === 'escape') await page.keyboard.press('Escape')
    else if (mode === 'button') await click(page, 'Zapri podrobnosti')
    else await page.goBack()
    await expect(dialog).toHaveCount(0)
    await expect(entry).toBeFocused()
    await expectStatus(page, 'Stran 2 od 4. Prikazano 3–4 od 7.')
    await expect(page.getByRole('combobox', { name: 'Velikost strani' })).toHaveValue('2')
    await expect(page.getByRole('combobox', { name: 'Filter strani' })).toHaveValue('todo')
    await expectIds(page, idList(visible))
  }
  await readonly(page, writes)
})

test('A05: project switch, return and refresh reset local state without URL or storage persistence', async ({ page }) => {
  const other = { ...records[0], id: 'drugi-id', projectId: 'launch' }
  await mount(page, [...records, other])
  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'done')
  await click(page, 'Zadnja stran')
  expect(new URL(page.url()).hash).toBe('#/projects/web')
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0])
  await project(page, 'launch')
  await expectIds(page, [other.id])
  await expectStatus(page, 'Stran 1 od 1. Prikazano 1–1 od 1.')
  await expectEdges(page, true, true)
  for (const label of ['Velikost strani', 'Filter strani']) await expect(page.getByRole('combobox', { name: label })).toHaveValue('all')
  await project(page, 'web')
  await expectIds(page, idList(records))
  await select(page, 'Velikost strani', '5')
  await select(page, 'Filter strani', 'in_progress')
  await click(page, 'Zadnja stran')
  await board(page)
  expect(new URL(page.url()).hash).toBe('#/projects/web?view=board')
  await page.reload()
  await expectIds(page, idList(records), false)
  await expectStatus(page, 'Stran 1 od 1. Prikazano 1–23 od 23.')
  for (const label of ['Velikost strani', 'Filter strani']) await expect(page.getByRole('combobox', { name: label })).toHaveValue('all')
  await expect(page.getByRole('button', { name: 'Tabla', exact: true })).toHaveAttribute('aria-pressed', 'true')
})

test('A06: empty projects, empty filtered results and a single record have correct zero and boundary states', async ({ page }) => {
  await mount(page, [])
  for (const target of ['web', 'launch'] as const) {
    await project(page, target)
    for (const size of ['all', '2', '5', '10']) {
      await select(page, 'Velikost strani', size)
      await expectStatus(page, 'Stran 0 od 0. Prikazano 0–0 od 0.')
      await expectEdges(page, true, true)
    }
    await board(page)
    await expectIds(page, [])
    await expect(page.locator('.column-count')).toHaveText(['0', '0', '0'])
    await summary(page, [0, 0, 0])
    await table(page)
    await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
  }

  // Reinstall controlled public GET responses with one task in one state.
  await page.unroute('**/api/**')
  await mount(page, [records[0]])
  for (const size of ['all', '2', '5', '10']) {
    await select(page, 'Velikost strani', size)
    await expectStatus(page, 'Stran 1 od 1. Prikazano 1–1 od 1.')
    await expectEdges(page, true, true)
  }
  await select(page, 'Filter strani', 'done')
  await expectStatus(page, 'Stran 0 od 0. Prikazano 0–0 od 0.')
  await expectEdges(page, true, true)
  await expect(page.getByRole('heading', { name: 'Ni opravil za izbrani filter' })).toBeVisible()
  await summary(page, [0, 1, 0])
  await expect(page.locator('.count-badge')).toHaveText('1')
  await board(page)
  await expectIds(page, [])
  await expect(page.locator('.column-count')).toHaveText(['0', '0', '0'])
  await select(page, 'Filter strani', 'all')
  await expectIds(page, [records[0].id])
  await expectStatus(page, 'Stran 1 od 1. Prikazano 1–1 od 1.')
})

test('A07: 390px layout and keyboard pagination work in both views without API writes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page, records)
  await select(page, 'Velikost strani', '2')
  const next = page.getByRole('button', { name: 'Naslednja stran', exact: true })
  await next.focus()
  await page.keyboard.press('Enter')
  await expectStatus(page, 'Stran 2 od 12. Prikazano 3–4 od 23.')
  await expect(next).toBeFocused()
  await expect(next).toHaveCSS('outline-style', 'solid')
  for (const view of ['table', 'board'] as const) {
    if (view === 'board') await board(page)
    await expectIds(page, idList(records.slice(2, 4)), view === 'table')
    for (const control of [page.getByRole('combobox', { name: 'Velikost strani' }), page.getByRole('combobox', { name: 'Filter strani' }), ...navigation.map(name => page.getByRole('button', { name, exact: true }))]) {
      const bounds = await control.boundingBox()
      expect(bounds).not.toBeNull()
      expect(bounds!.x).toBeGreaterThanOrEqual(0)
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390)
    }
    await readonly(page, writes)
  }
})
