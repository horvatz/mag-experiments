import type { Page } from '@playwright/test'
import { test, expect, mount, makeTask, expectIds, ids, select, click, board, table, project, summary, columnIds, readonly, type Task } from '../development/helpers.ts'

const order = [9, 2, 17, 4, 31, 1, 22, 8, 12, 5, 26, 3, 19]
const statuses = ['done', 'todo', 'in_progress'] as const
const records = order.map((value, index) => makeTask(`č-${value}/p`, {
  title: 'Enak naslov <Čšž> & "zapis"',
  description: `Opis ${value}: čšž, <besedilo> & druga vrstica\nZaključek.`,
  status: statuses[index % 3],
  assignee: 'Živa Kovač',
  dueDate: '2026-10-03',
}))
const taskIds = (tasks: Task[]) => tasks.map(task => task.id)
const status = (page: Page) => page.getByRole('status', { name: 'Stanje straničenja' })
const directions = ['Prva stran', 'Prejšnja stran', 'Naslednja stran', 'Zadnja stran']

async function allDisabled(page: Page) {
  const before = await status(page).textContent()
  for (const name of directions) {
    const button = page.getByRole('button', { name, exact: true })
    await expect(button).toBeDisabled()
    await button.evaluate((element: HTMLButtonElement) => element.click())
  }
  await expect(status(page)).toHaveText(before!)
}

async function defaults(page: Page, expected: Task[]) {
  await expect(page.getByRole('combobox', { name: 'Velikost strani', exact: true })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter strani', exact: true })).toHaveValue('all')
  await expectIds(page, taskIds(expected), false)
}

test('A01: all sizes partition original order and navigation respects boundaries', async ({ page }) => {
  const writes = await mount(page, records)
  await defaults(page, records)
  await expectIds(page, taskIds(records))
  await expect(status(page)).toHaveText('Stran 1 od 1. Prikazano 1–13 od 13.')
  await allDisabled(page)
  for (const size of [2, 5, 10]) {
    await select(page, 'Velikost strani', String(size))
    const seen: string[] = []
    const pages = Math.ceil(records.length / size)
    for (let current = 1; current <= pages; current++) {
      const start = (current - 1) * size
      const expected = records.slice(start, start + size)
      await expectIds(page, taskIds(expected))
      seen.push(...await ids(page) as string[])
      await expect(status(page)).toHaveText(`Stran ${current} od ${pages}. Prikazano ${start + 1}–${start + expected.length} od 13.`)
      for (const name of directions.slice(0, 2)) {
        const button = page.getByRole('button', { name, exact: true })
        if (current === 1) await expect(button).toBeDisabled(); else await expect(button).toBeEnabled()
      }
      for (const name of directions.slice(2)) {
        const button = page.getByRole('button', { name, exact: true })
        if (current === pages) await expect(button).toBeDisabled(); else await expect(button).toBeEnabled()
      }
      if (current < pages) await click(page, 'Naslednja stran')
    }
    expect(seen).toEqual(taskIds(records))
    expect(new Set(seen).size).toBe(13)
    await click(page, 'Prejšnja stran')
    await expectIds(page, taskIds(records.slice((pages - 2) * size, (pages - 1) * size)))
    await click(page, 'Zadnja stran')
    await expectIds(page, taskIds(records.slice((pages - 1) * size)))
    await click(page, 'Prva stran')
    await expectIds(page, taskIds(records.slice(0, size)))
  }
  await select(page, 'Velikost strani', '2')
  await click(page, 'Naslednja stran')
  await select(page, 'Velikost strani', '5')
  await expectIds(page, taskIds(records.slice(0, 5)))
  await expect(status(page)).toHaveText('Stran 1 od 3. Prikazano 1–5 od 13.')
  await click(page, 'Zadnja stran')
  await select(page, 'Velikost strani', 'all')
  await expectIds(page, taskIds(records))
  await allDisabled(page)
  await readonly(page, writes)
})

test('A02: filters precede the shared board page and global counts stay unchanged', async ({ page }) => {
  const writes = await mount(page, records)
  await select(page, 'Velikost strani', '2')
  for (const filter of ['todo', 'in_progress', 'done', 'all']) {
    const last = page.getByRole('button', { name: 'Zadnja stran', exact: true })
    if (await last.isEnabled()) await last.click()
    await select(page, 'Filter strani', filter)
    const filtered = records.filter(task => filter === 'all' || task.status === filter)
    await expectIds(page, taskIds(filtered.slice(0, 2)))
    await expect(status(page)).toHaveText(`Stran 1 od ${Math.ceil(filtered.length / 2)}. Prikazano 1–2 od ${filtered.length}.`)
    await click(page, 'Naslednja stran')
    const current = filtered.slice(2, 4)
    await expectIds(page, taskIds(current))
    await board(page)
    await expectIds(page, taskIds(current), false)
    const columns = [['todo', 'Pripravljeno'], ['in_progress', 'V delu'], ['done', 'Končano']]
    for (const [state, name] of columns) {
      const expected = current.filter(task => task.status === state)
      await columnIds(page, name, taskIds(expected))
      await expect(page.getByRole('region', { name, exact: true }).locator('.column-count')).toHaveText(String(expected.length))
    }
    await summary(page, [4, 4, 5])
    await expect(page.locator('.count-badge')).toHaveText('13')
    await expect(page.locator('.table-footer')).toContainText('5 / 13 končanih')
    await table(page)
    await expectIds(page, taskIds(current))
  }
  await select(page, 'Filter strani', 'all')
  await select(page, 'Velikost strani', 'all')
  await expectIds(page, taskIds(records))
  await readonly(page, writes)
})

test('A03: views and detail dismissal retain state; project changes and reload reset it', async ({ page }) => {
  const writes = await mount(page, [...records, makeTask('drugi-id', { projectId: 'launch' })])
  const storageBefore = await page.evaluate(() => [JSON.stringify(localStorage), JSON.stringify(sessionStorage)])
  const originalURL = page.url()
  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'done')
  await click(page, 'Naslednja stran')
  expect(page.url()).toBe(originalURL)
  const expected = records.filter(task => task.status === 'done').slice(2, 4)
  for (const view of ['board', 'table']) {
    if (view === 'board') await board(page); else await table(page)
    for (const closeWith of ['button', 'escape']) {
      await page.locator('[data-task-id]').filter({ has: page.getByText(expected[0].id, { exact: true }) }).getByRole('link').click()
      const dialog = page.getByRole('dialog')
      await expect(dialog.getByText(expected[0].description, { exact: true })).toBeVisible()
      if (closeWith === 'button') await click(page, 'Zapri podrobnosti'); else await page.keyboard.press('Escape')
      await expect(dialog).toHaveCount(0)
      await expectIds(page, taskIds(expected), false)
      await expect(status(page)).toHaveText('Stran 2 od 3. Prikazano 3–4 od 5.')
      await expect(page.getByRole('combobox', { name: 'Velikost strani', exact: true })).toHaveValue('2')
      await expect(page.getByRole('combobox', { name: 'Filter strani', exact: true })).toHaveValue('done')
    }
  }
  expect(await page.evaluate(() => [JSON.stringify(localStorage), JSON.stringify(sessionStorage)])).toEqual(storageBefore)
  await project(page, 'launch')
  await defaults(page, [makeTask('drugi-id', { projectId: 'launch' })])
  await project(page, 'web')
  await defaults(page, records)
  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'todo')
  await click(page, 'Naslednja stran')
  await page.reload()
  await defaults(page, records)
  await expect(status(page)).toHaveText('Stran 1 od 1. Prikazano 1–13 od 13.')
  await readonly(page, writes)
})

test('A04: both empty projects retain controls, zero status and empty board columns', async ({ page }) => {
  const writes = await mount(page, [])
  for (const id of ['web', 'launch'] as const) {
    await project(page, id)
    await expect(status(page)).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
    await allDisabled(page)
    await select(page, 'Velikost strani', '10')
    await board(page)
    await expect(page.locator('.board-column')).toHaveCount(3)
    await expect(page.locator('.column-count')).toHaveText(['0', '0', '0'])
    await expectIds(page, [])
    await table(page)
    await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
  }
  await readonly(page, writes)
})

test('A04: one record and an empty filter have correct status and restore first page', async ({ page }) => {
  const only = makeTask('samostojno-ž', { status: 'todo' })
  const writes = await mount(page, [only])
  for (const size of ['all', '2', '5', '10']) {
    await select(page, 'Velikost strani', size)
    await expect(status(page)).toHaveText('Stran 1 od 1. Prikazano 1–1 od 1.')
    await allDisabled(page)
  }
  await select(page, 'Filter strani', 'done')
  await expect(status(page)).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
  await expectIds(page, [])
  await allDisabled(page)
  await board(page)
  await expect(page.locator('.column-count')).toHaveText(['0', '0', '0'])
  await summary(page, [1, 0, 0])
  await select(page, 'Filter strani', 'all')
  await expectIds(page, [only.id])
  await expect(status(page)).toHaveText('Stran 1 od 1. Prikazano 1–1 od 1.')
  await readonly(page, writes)
})

for (const width of [1440, 390]) {
  test(`A05: Folio, literal text, ID details and read-only interactions at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 960 })
    const forbiddenRequests: string[] = []
    page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/__test/')) forbiddenRequests.push(request.url()) })
    const writes = await mount(page, records)
    await select(page, 'Velikost strani', '5')
    await click(page, 'Naslednja stran')
    for (const view of ['table', 'board']) {
      if (view === 'board') await board(page)
      await expectIds(page, taskIds(records.slice(5, 10)), false)
      const item = page.locator('[data-task-id]').filter({ has: page.getByText(records[5].id, { exact: true }) })
      await expect(item.getByRole('link')).toContainText(records[5].title)
      await item.getByRole('link').click()
      await expect(page.getByRole('dialog').getByText(records[5].description, { exact: true })).toBeVisible()
      await page.keyboard.press('Escape')
      await readonly(page, writes)
      await page.screenshot({ path: `docs/agent/P05/folio-${width}-${view}.png`, fullPage: true })
    }
    expect(forbiddenRequests).toEqual([])
    await table(page)
    await select(page, 'Velikost strani', 'all')
    await expectIds(page, taskIds(records))
    await readonly(page, writes)
  })
}
