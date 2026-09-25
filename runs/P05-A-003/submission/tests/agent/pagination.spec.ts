import { expect, test, type Page } from '@playwright/test'
import type { Task, TaskStatus } from '../../shared/types.ts'
import { mount, expectIds, ids, select, click, board, table, project, summary, readonly } from '../development/helpers.ts'

// Deliberately non-lexical IDs, repeated titles, Unicode and mixed states.
const states: TaskStatus[] = ['done', 'todo', 'in_progress', 'todo']
const records: Task[] = Array.from({ length: 23 }, (_, index) => ({
  id: index === 5 ? 'ž-81/č?x#%"' : `zapis-${(index * 7 + 19) % 29}`,
  projectId: 'web',
  title: 'Enak naslov, »čšž« <b>&',
  description: `Opis ${index}: prva vrstica\nDruga vrstica; <script>navadno besedilo</script>`,
  status: states[index % states.length],
  assignee: index % 2 ? 'Živa Kovač' : 'Črt Novak',
  dueDate: index % 2 ? '2028-02-29' : '2026-12-31',
}))
const secondProject: Task = { ...records[0], id: 'drugi-ž', projectId: 'launch' }
const fixture = [...records, secondProject]
const moveNames = ['Prva stran', 'Prejšnja stran', 'Naslednja stran', 'Zadnja stran']
const status = (page: Page) => page.getByRole('status', { name: 'Stanje straničenja', exact: true })

async function expectStatus(page: Page, text: string) {
  await expect(status(page)).toHaveText(text)
}

async function expectEdges(page: Page, first: boolean, last: boolean) {
  for (const [index, name] of moveNames.entries()) {
    const button = page.getByRole('button', { name, exact: true })
    if (index < 2 ? first : last) await expect(button).toBeDisabled()
    else await expect(button).toBeEnabled()
  }
}

test('A01: defaults preserve all IDs, API order and literal text without writes', async ({ page }) => {
  const writes = await mount(page, fixture)
  await expect(page.getByRole('combobox', { name: 'Velikost strani', exact: true })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter strani', exact: true })).toHaveValue('all')
  await expectIds(page, records.map(task => task.id))
  await expect(page.getByRole('table').getByText(records[0].title, { exact: true })).toHaveCount(23)
  await expectStatus(page, 'Stran 1 od 1. Prikazano 1–23 od 23.')
  await expectEdges(page, true, true)
  await readonly(page, writes)
})

for (const size of [2, 5, 10]) {
  test(`A02: size ${size} partitions 23 records, handles every boundary and all four moves`, async ({ page }) => {
    const writes = await mount(page, fixture)
    await select(page, 'Velikost strani', String(size))
    const visited: string[] = []
    const pages = Math.ceil(records.length / size)
    for (let number = 1; number <= pages; number++) {
      const expected = records.slice((number - 1) * size, number * size).map(task => task.id)
      await expectIds(page, expected)
      await expectStatus(page, `Stran ${number} od ${pages}. Prikazano ${(number - 1) * size + 1}–${Math.min(number * size, 23)} od 23.`)
      await expectEdges(page, number === 1, number === pages)
      visited.push(...await ids(page) as string[])
      if (number < pages) await click(page, 'Naslednja stran')
    }
    expect(visited).toEqual(records.map(task => task.id))
    expect(new Set(visited).size).toBe(23)
    // Native disabled controls must not dispatch page changes even through click().
    for (const name of moveNames.slice(2)) await page.getByRole('button', { name, exact: true }).evaluate(element => (element as HTMLButtonElement).click())
    await expectIds(page, records.slice((pages - 1) * size).map(task => task.id))
    await click(page, 'Prejšnja stran')
    await expectIds(page, records.slice((pages - 2) * size, (pages - 1) * size).map(task => task.id))
    await click(page, 'Prva stran')
    await expectIds(page, records.slice(0, size).map(task => task.id))
    for (const name of moveNames.slice(0, 2)) await page.getByRole('button', { name, exact: true }).evaluate(element => (element as HTMLButtonElement).click())
    await expectIds(page, records.slice(0, size).map(task => task.id))
    await click(page, 'Zadnja stran')
    await expectIds(page, records.slice((pages - 1) * size).map(task => task.id))
    await readonly(page, writes)
  })
}

test('A03: size and every filter reset a still-valid page and filter before pagination', async ({ page }) => {
  await mount(page, fixture)
  await select(page, 'Velikost strani', '2')
  for (const size of ['5', '10', 'all']) {
    await click(page, 'Naslednja stran')
    await select(page, 'Velikost strani', size)
    await expectIds(page, records.slice(0, size === 'all' ? 23 : Number(size)).map(task => task.id))
    await expect(status(page)).toContainText('Stran 1 od')
  }
  await select(page, 'Velikost strani', '2')
  for (const filter of ['todo', 'done', 'in_progress', 'all']) {
    await click(page, 'Naslednja stran')
    await select(page, 'Filter strani', filter)
    const matching = records.filter(task => filter === 'all' || task.status === filter)
    await expectIds(page, matching.slice(0, 2).map(task => task.id))
    await expectStatus(page, `Stran 1 od ${Math.ceil(matching.length / 2)}. Prikazano 1–2 od ${matching.length}.`)
    await click(page, 'Zadnja stran')
    const lastOffset = Math.floor((matching.length - 1) / 2) * 2
    await expectIds(page, matching.slice(lastOffset).map(task => task.id))
    await click(page, 'Prva stran')
  }
})

test('A04: board uses the global slice, counters stay scoped and details preserve state by ID', async ({ page }) => {
  const writes = await mount(page, fixture)
  await select(page, 'Velikost strani', '5')
  await click(page, 'Naslednja stran')
  const visible = records.slice(5, 10)
  await board(page)
  await expectIds(page, visible.map(task => task.id), false)
  await summary(page, [11, 6, 6])
  await expect(page.locator('.count-badge')).toHaveText('23')
  const labels = ['Pripravljeno', 'V delu', 'Končano']
  for (const [index, state] of (['todo', 'in_progress', 'done'] as const).entries()) {
    const column = page.getByRole('region', { name: labels[index], exact: true })
    const matching = visible.filter(task => task.status === state)
    await expect(column.locator('.column-count')).toHaveText(String(matching.length))
    expect(await column.locator('[data-task-id]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-task-id')))).toEqual(matching.map(task => task.id))
  }
  const selected = records[5]
  const card = page.getByRole('link', { name: `${selected.title} ${selected.id}`, exact: true })
  await expect(card).toHaveAttribute('href', `#/projects/web/tasks/${encodeURIComponent(selected.id)}?view=board`)
  await card.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: selected.title, exact: true })).toBeVisible()
  await expect(dialog.locator('.description p')).toHaveText(selected.description)
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(card).toBeFocused()
  await expectStatus(page, 'Stran 2 od 5. Prikazano 6–10 od 23.')
  await table(page)
  await expectIds(page, visible.map(task => task.id))

  await select(page, 'Filter strani', 'todo')
  await select(page, 'Velikost strani', '2')
  await click(page, 'Naslednja stran')
  const filteredPage = records.filter(task => task.status === 'todo').slice(2, 4)
  for (const close of ['button', 'history']) {
    await page.locator('[data-task-id]').first().getByRole('link').click()
    await expect(dialog).toBeVisible()
    if (close === 'button') await click(page, 'Zapri podrobnosti')
    else await page.goBack()
    await expect(dialog).toHaveCount(0)
    await expectIds(page, filteredPage.map(task => task.id))
    await expectStatus(page, 'Stran 2 od 6. Prikazano 3–4 od 11.')
    await expect(page.getByRole('combobox', { name: 'Filter strani', exact: true })).toHaveValue('todo')
  }
  await board(page)
  await expectIds(page, filteredPage.map(task => task.id), false)
  await summary(page, [11, 6, 6])
  await readonly(page, writes)
})

test('A05: both empty projects, a single task and empty filters keep controls recoverable', async ({ page }) => {
  const writes = await mount(page, [])
  for (const target of ['web', 'launch'] as const) {
    await project(page, target)
    for (const size of ['all', '2', '5', '10']) {
      await select(page, 'Velikost strani', size)
      await expectStatus(page, 'Stran 0 od 0. Prikazano 0–0 od 0.')
      await expectEdges(page, true, true)
    }
    await board(page)
    await expect(page.locator('.column-count')).toHaveText(['0', '0', '0'])
    await summary(page, [0, 0, 0])
    await table(page)
  }
  await readonly(page, writes)
})

test('A05b: empty filter and single result restore the first page with accurate counters', async ({ page }) => {
  await mount(page, [{ ...records[0], status: 'todo' }])
  await select(page, 'Filter strani', 'done')
  for (const size of ['2', '5', '10', 'all']) {
    await select(page, 'Velikost strani', size)
    await expectStatus(page, 'Stran 0 od 0. Prikazano 0–0 od 0.')
    await expectEdges(page, true, true)
    await expectIds(page, [])
  }
  await expect(page.getByRole('heading', { name: 'Ni opravil z izbranim stanjem' })).toBeVisible()
  await summary(page, [1, 0, 0])
  await expect(page.locator('.count-badge')).toHaveText('1')
  await board(page)
  await expect(page.locator('.column-count')).toHaveText(['0', '0', '0'])
  await select(page, 'Filter strani', 'all')
  for (const size of ['all', '2', '5', '10']) {
    await select(page, 'Velikost strani', size)
    await expectStatus(page, 'Stran 1 od 1. Prikazano 1–1 od 1.')
    await expectEdges(page, true, true)
    await expectIds(page, [records[0].id])
  }
  await expect(page.locator('.column-count')).toHaveText(['1', '0', '0'])
})

test('A06: project changes and reload reset all settings without URL or storage state', async ({ page }) => {
  await mount(page, fixture)
  const url = page.url()
  const storage = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }))
  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'todo')
  await click(page, 'Naslednja stran')
  expect(page.url()).toBe(url)
  expect(await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }))).toEqual(storage)
  await project(page, 'launch')
  await expect(page.getByRole('combobox', { name: 'Velikost strani', exact: true })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter strani', exact: true })).toHaveValue('all')
  await expectStatus(page, 'Stran 1 od 1. Prikazano 1–1 od 1.')
  await project(page, 'web')
  await expectIds(page, records.map(task => task.id))
  await expectStatus(page, 'Stran 1 od 1. Prikazano 1–23 od 23.')
  await select(page, 'Velikost strani', '5')
  await select(page, 'Filter strani', 'todo')
  await click(page, 'Zadnja stran')
  await board(page)
  await page.reload()
  await expect(page.getByRole('combobox', { name: 'Velikost strani', exact: true })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter strani', exact: true })).toHaveValue('all')
  await expectStatus(page, 'Stran 1 od 1. Prikazano 1–23 od 23.')
  await expectIds(page, records.map(task => task.id), false)
})

test('A07: 390px layout, keyboard controls and page changes without API requests', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page, fixture)
  await expectIds(page, records.map(task => task.id))
  const requests: string[] = []
  page.on('request', request => {
    if (new URL(request.url()).pathname.startsWith('/api/')) requests.push(request.method() + ' ' + request.url())
  })
  await select(page, 'Velikost strani', '2')
  await page.getByRole('combobox', { name: 'Velikost strani', exact: true }).focus()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('combobox', { name: 'Filter strani', exact: true })).toBeFocused()
  await page.keyboard.press('Tab')
  const next = page.getByRole('button', { name: 'Naslednja stran', exact: true })
  await expect(next).toBeFocused()
  expect(await next.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe('none')
  await page.keyboard.press('Enter')
  await expectIds(page, records.slice(2, 4).map(task => task.id))
  for (const name of moveNames) {
    const bounds = await page.getByRole('button', { name, exact: true }).boundingBox()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390)
  }
  expect(await page.locator('.table-scroll').evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true)
  await readonly(page, writes)
  await board(page)
  await expectIds(page, records.slice(2, 4).map(task => task.id), false)
  expect(await page.locator('.board-scroll').evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true)
  await select(page, 'Filter strani', 'done')
  await click(page, 'Zadnja stran')
  await readonly(page, writes)
  expect(requests).toEqual([])
})
