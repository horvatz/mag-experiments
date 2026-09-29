import { expect, test, type Page } from '@playwright/test'
import { board, click, columnIds, expectIds, makeTask, mount, project, readonly, select, summary, table } from '../development/helpers.ts'

const taskIds = ['z-81', 'č /2?x=#%', 'a-93', 'x-04', 'b-75', 'n-06', 'q-37', 'f-08', 'r-69', 'k-10', 'c-51', 'm-12', 'd-43']
const states = ['done', 'todo', 'in_progress', 'todo', 'done', 'in_progress', 'done', 'todo', 'in_progress', 'done', 'todo', 'in_progress', 'todo'] as const
const records = taskIds.map((id, i) => makeTask(id, {
  title: 'Enak naslov – čšž, "citat" <span> &',
  description: `Opis ${id}\nDruga vrstica.`,
  status: states[i],
  assignee: i % 2 ? 'Živa Kovač' : 'Črt',
  dueDate: '2028-02-29',
}))
const allRecords = [...records, makeTask('drugi-projekt', { projectId: 'launch' })]
const navigation = ['Prva stran', 'Prejšnja stran', 'Naslednja stran', 'Zadnja stran']
const status = (page: Page) => page.getByRole('status', { name: 'Stanje straničenja', exact: true })
const size = (page: Page) => page.getByRole('combobox', { name: 'Velikost strani', exact: true })
const filter = (page: Page) => page.getByRole('combobox', { name: 'Filter strani', exact: true })

async function expectStatus(page: Page, value: string) {
  await expect(status(page)).toHaveText(value)
}
async function expectEdges(page: Page, first: boolean, last: boolean) {
  for (const [index, label] of navigation.entries()) {
    const button = page.getByRole('button', { name: label, exact: true })
    if (index < 2 ? first : last) await expect(button).toBeDisabled()
    else await expect(button).toBeEnabled()
  }
}
async function expectDefaults(page: Page, ids: string[]) {
  await expect(size(page)).toHaveValue('all')
  await expect(filter(page)).toHaveValue('all')
  await expectIds(page, ids)
  await expectStatus(page, `Stran 1 od 1. Prikazano 1–${ids.length} od ${ids.length}.`)
  await expectEdges(page, true, true)
}

// Explicit expected partitions include a short final page and deliberately unsorted IDs.
const partitions = {
  '2': [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12]],
  '5': [[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12]],
  '10': [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [10, 11, 12]],
}

test('A01: default order, one page, accessible controls and unchanged source data', async ({ page }) => {
  const writes = await mount(page, allRecords)
  await expectDefaults(page, taskIds)
  expect(await size(page).locator('option').evaluateAll(options => options.map(option => option.getAttribute('value')))).toEqual(['all', '2', '5', '10'])
  expect(await filter(page).locator('option').evaluateAll(options => options.map(option => option.getAttribute('value')))).toEqual(['all', 'todo', 'in_progress', 'done'])
  await summary(page, [5, 4, 4])
  await readonly(page, writes)
})

for (const [pageSize, pages] of Object.entries(partitions)) {
  test(`A02: size ${pageSize} visits every ID once, handles all four moves and boundaries`, async ({ page }) => {
    const writes = await mount(page, allRecords)
    await select(page, 'Velikost strani', pageSize)
    const seen: string[] = []
    let offset = 1
    for (const [index, positions] of pages.entries()) {
      const expected = positions.map(i => taskIds[i])
      await expectIds(page, expected)
      await expectStatus(page, `Stran ${index + 1} od ${pages.length}. Prikazano ${offset}–${offset + expected.length - 1} od 13.`)
      await expectEdges(page, index === 0, index === pages.length - 1)
      seen.push(...await page.locator('[data-task-id]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-task-id')!)))
      offset += expected.length
      if (index < pages.length - 1) await click(page, 'Naslednja stran')
    }
    expect(seen).toEqual(taskIds)
    expect(new Set(seen).size).toBe(13)
    // DOM click on disabled controls must not change the current page.
    await page.getByRole('button', { name: 'Naslednja stran', exact: true }).evaluate((button: HTMLButtonElement) => button.click())
    await page.getByRole('button', { name: 'Zadnja stran', exact: true }).evaluate((button: HTMLButtonElement) => button.click())
    await expectIds(page, pages.at(-1)!.map(i => taskIds[i]))
    await click(page, 'Prejšnja stran')
    await expectIds(page, pages.at(-2)!.map(i => taskIds[i]))
    await click(page, 'Zadnja stran')
    await expectIds(page, pages.at(-1)!.map(i => taskIds[i]))
    await click(page, 'Prva stran')
    await expectIds(page, pages[0].map(i => taskIds[i]))
    await page.getByRole('button', { name: 'Prva stran', exact: true }).evaluate((button: HTMLButtonElement) => button.click())
    await page.getByRole('button', { name: 'Prejšnja stran', exact: true }).evaluate((button: HTMLButtonElement) => button.click())
    await expectIds(page, pages[0].map(i => taskIds[i]))
    await readonly(page, writes)
  })
}

test('A03: size changes reset even a still valid page and all returns one page', async ({ page }) => {
  await mount(page, allRecords)
  await select(page, 'Velikost strani', '2')
  await click(page, 'Naslednja stran')
  await select(page, 'Velikost strani', '5')
  await expectIds(page, taskIds.slice(0, 5))
  await expectStatus(page, 'Stran 1 od 3. Prikazano 1–5 od 13.')
  await click(page, 'Naslednja stran')
  await select(page, 'Velikost strani', '2')
  await expectIds(page, taskIds.slice(0, 2))
  await select(page, 'Velikost strani', '10')
  await click(page, 'Zadnja stran')
  await select(page, 'Velikost strani', 'all')
  await expectDefaults(page, taskIds)
})

test('A04: every filter applies before paging and leaves project totals intact', async ({ page }) => {
  const writes = await mount(page, allRecords)
  await select(page, 'Velikost strani', '2')
  const expectedByState = { todo: [1, 3, 7, 10, 12], in_progress: [2, 5, 8, 11], done: [0, 4, 6, 9] }
  for (const [state, positions] of Object.entries(expectedByState)) {
    await click(page, 'Zadnja stran')
    await select(page, 'Filter strani', state)
    await expectIds(page, positions.slice(0, 2).map(i => taskIds[i]))
    await expectStatus(page, `Stran 1 od ${state === 'todo' ? 3 : 2}. Prikazano 1–2 od ${positions.length}.`)
    await summary(page, [5, 4, 4])
    await expect(page.locator('.count-badge')).toHaveText('13')
    await expect(page.locator('.table-footer')).toContainText('4 / 13 končanih')
    await select(page, 'Velikost strani', 'all')
    await expectIds(page, positions.map(i => taskIds[i]))
    await select(page, 'Velikost strani', '2')
  }
  await click(page, 'Zadnja stran')
  await select(page, 'Filter strani', 'all')
  await expectIds(page, taskIds.slice(0, 2))
  await readonly(page, writes)
})

test('A05: board shares the page, counts visible cards and preserves state through details and history', async ({ page }) => {
  const writes = await mount(page, allRecords)
  await select(page, 'Velikost strani', '5')
  await click(page, 'Naslednja stran')
  await board(page)
  await expectIds(page, taskIds.slice(5, 10), false)
  await columnIds(page, 'Pripravljeno', [taskIds[7]])
  await columnIds(page, 'V delu', [taskIds[5], taskIds[8]])
  await columnIds(page, 'Končano', [taskIds[6], taskIds[9]])
  for (const [name, count] of [['Pripravljeno', 1], ['V delu', 2], ['Končano', 2]] as const) {
    await expect(page.getByRole('region', { name, exact: true }).locator('.column-count')).toHaveText(String(count))
  }
  await summary(page, [5, 4, 4])
  await select(page, 'Filter strani', 'todo')
  await select(page, 'Velikost strani', '2')
  await click(page, 'Naslednja stran')
  const expected = [taskIds[7], taskIds[10]]
  for (const view of ['board', 'table'] as const) {
    if (view === 'table') await table(page)
    await expectIds(page, expected)
    const link = page.locator(`[data-task-id="${taskIds[10]}"]`).getByRole('link')
    await link.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog').locator('.eyebrow')).toHaveText(taskIds[10])
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(link).toBeFocused()
    await link.click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await click(page, 'Zapri podrobnosti')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await link.click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.goBack()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(size(page)).toHaveValue('2')
    await expect(filter(page)).toHaveValue('todo')
    await expectStatus(page, 'Stran 2 od 3. Prikazano 3–4 od 5.')
    await expectIds(page, expected)
  }
  await readonly(page, writes)
})

test('A06: empty projects, no matches, one result and filter removal have exact zero and one states', async ({ page }) => {
  await mount(page, [])
  for (const projectId of ['web', 'launch'] as const) {
    if (projectId === 'launch') await project(page, projectId)
    await expectStatus(page, 'Stran 0 od 0. Prikazano 0–0 od 0.')
    await expectEdges(page, true, true)
    await select(page, 'Velikost strani', '10')
    await select(page, 'Filter strani', 'in_progress')
    await board(page)
    await expect(page.getByRole('region', { name: 'Tabla opravil' }).getByRole('region')).toHaveCount(3)
    await expectIds(page, [])
    await expectStatus(page, 'Stran 0 od 0. Prikazano 0–0 od 0.')
    await expectEdges(page, true, true)
    await table(page)
  }
  await mount(page, [records[0]])
  await select(page, 'Velikost strani', '2')
  await expectStatus(page, 'Stran 1 od 1. Prikazano 1–1 od 1.')
  await expectEdges(page, true, true)
  await select(page, 'Filter strani', 'todo')
  await expectIds(page, [])
  await expect(page.getByRole('heading', { name: 'Ni opravil za izbrano stanje' })).toBeVisible()
  await expectStatus(page, 'Stran 0 od 0. Prikazano 0–0 od 0.')
  await expectEdges(page, true, true)
  await board(page)
  await expectIds(page, [])
  await expect(page.locator('.column-count')).toHaveText(['0', '0', '0'])
  await select(page, 'Filter strani', 'all')
  await expectIds(page, [taskIds[0]])
  await expectStatus(page, 'Stran 1 od 1. Prikazano 1–1 od 1.')
  await expect(size(page)).toHaveValue('2')
})

test('A07: project navigation and reload reset local state without putting it in URL or storage', async ({ page }) => {
  await mount(page, allRecords)
  const initialStorage = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }))
  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'todo')
  await click(page, 'Zadnja stran')
  await expect(page).toHaveURL(/\/#\/projects\/web$/)
  await project(page, 'launch')
  await expectDefaults(page, ['drugi-projekt'])
  await project(page, 'web')
  await expectDefaults(page, taskIds)
  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'done')
  await click(page, 'Naslednja stran')
  await board(page)
  await page.reload()
  await expect(size(page)).toHaveValue('all')
  await expect(filter(page)).toHaveValue('all')
  await expectStatus(page, 'Stran 1 od 1. Prikazano 1–13 od 13.')
  await expectIds(page, taskIds, false)
  expect(await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }))).toEqual(initialStorage)
})

test('A08: 390px layout, encoded IDs and plain Unicode text remain usable in both views', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page, allRecords)
  await select(page, 'Velikost strani', '2')
  for (const view of ['table', 'board'] as const) {
    if (view === 'board') await board(page)
    await expectIds(page, taskIds.slice(0, 2), view === 'table')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    for (const label of navigation) {
      const bounds = await page.getByRole('button', { name: label, exact: true }).boundingBox()
      expect(bounds!.x).toBeGreaterThanOrEqual(0)
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390)
    }
    const link = page.locator('[data-task-id]').filter({ hasText: taskIds[1] }).getByRole('link')
    await expect(link).toHaveAccessibleName(`${records[1].title} ${taskIds[1]}`)
    await expect(link).toHaveAttribute('href', `#/projects/web/tasks/${encodeURIComponent(taskIds[1])}${view === 'board' ? '?view=board' : ''}`)
    await link.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: records[1].title, exact: true })).toBeVisible()
    await expect(dialog.locator('time')).toHaveAttribute('datetime', '2028-02-29')
    await expect(dialog.locator('.description p')).toHaveText(records[1].description)
    await click(page, 'Zapri podrobnosti')
    await expect(dialog).toHaveCount(0)
    await expect(size(page)).toHaveValue('2')
    await click(page, 'Naslednja stran')
    await expectIds(page, [taskIds[2], taskIds[3]], view === 'table')
    await click(page, 'Prva stran')
  }
  await readonly(page, writes)
})
