import type { Page } from '@playwright/test'
import { test, expect, mount, makeTask, expectIds, ids, select, click, board, table, project, columnIds, summary, readonly } from '../development/helpers.ts'

const order = [13, 2, 17, 1, 9, 4, 15, 6, 3, 12, 5, 16, 7, 14, 8, 11, 10]
const states = ['todo', 'in_progress', 'done'] as const
const records = order.map((id, index) => makeTask(`opravilo-ž/${id}`, {
  title: 'Enak naslov, »čšž«', description: `Opis ${id}; <besedilo> & Unicode`,
  status: states[index % 3], assignee: 'Živa Črt', dueDate: '2026-10-03',
}))
const recordIds = records.map(task => task.id)
const controls = ['Prva stran', 'Prejšnja stran', 'Naslednja stran', 'Zadnja stran']
const status = (page: Page) => page.getByRole('status', { name: 'Stanje straničenja', exact: true })

async function expectStatus(page: Page, current: number, size: number, total: number) {
  const pages = Math.ceil(total / size)
  const start = total ? (current - 1) * size + 1 : 0
  await expect(status(page)).toHaveText(`Stran ${total ? current : 0} od ${pages}. Prikazano ${start}–${Math.min(current * size, total)} od ${total}.`)
}

for (const count of [1, 17]) {
  test(`S01: defaults preserve source order with ${count} tasks`, async ({ page }) => {
    await mount(page, records.slice(0, count))
    await expect(page.getByRole('combobox', { name: 'Velikost strani' })).toHaveValue('all')
    await expect(page.getByRole('combobox', { name: 'Filter strani' })).toHaveValue('all')
    await expectIds(page, recordIds.slice(0, count))
    await expectStatus(page, 1, count, count)
    for (const name of controls) await expect(page.getByRole('button', { name, exact: true })).toBeDisabled()
  })
}

for (const size of [2, 5, 10]) {
  test(`S02: size ${size} partitions every ID and respects navigation edges`, async ({ page }) => {
    await mount(page, records)
    await select(page, 'Velikost strani', String(size))
    const collected: string[] = []
    const pages = Math.ceil(records.length / size)
    for (let current = 1; current <= pages; current++) {
      await expectIds(page, recordIds.slice((current - 1) * size, current * size))
      await expectStatus(page, current, size, records.length)
      collected.push(...await ids(page) as string[])
      for (const name of controls.slice(0, 2)) await expect(page.getByRole('button', { name, exact: true })).toBeEnabled({ enabled: current !== 1 })
      for (const name of controls.slice(2)) await expect(page.getByRole('button', { name, exact: true })).toBeEnabled({ enabled: current !== pages })
      if (current < pages) await click(page, 'Naslednja stran')
    }
    expect(collected).toEqual(recordIds)
    expect(new Set(collected).size).toBe(records.length)
    await page.getByRole('button', { name: 'Naslednja stran', exact: true }).evaluate((button: HTMLButtonElement) => button.click())
    await expectStatus(page, pages, size, records.length)
    await click(page, 'Prejšnja stran')
    await expectIds(page, recordIds.slice((pages - 2) * size, (pages - 1) * size))
    await click(page, 'Zadnja stran')
    await expectIds(page, recordIds.slice((pages - 1) * size))
    await click(page, 'Prva stran')
    await expectIds(page, recordIds.slice(0, size))
    await page.getByRole('button', { name: 'Prejšnja stran', exact: true }).evaluate((button: HTMLButtonElement) => button.click())
    await expectStatus(page, 1, size, records.length)
  })
}

test('S03: every size and filter change resets before slicing', async ({ page }) => {
  await mount(page, records)
  for (const [from, to] of [['2', '5'], ['5', '10'], ['10', '2'], ['2', 'all']]) {
    await select(page, 'Velikost strani', from)
    await click(page, 'Naslednja stran')
    await select(page, 'Velikost strani', to)
    const size = to === 'all' ? records.length : Number(to)
    await expectIds(page, recordIds.slice(0, size))
    await expectStatus(page, 1, size, records.length)
  }
  await select(page, 'Velikost strani', '2')
  for (const filter of [...states, 'all']) {
    await click(page, 'Zadnja stran')
    await select(page, 'Filter strani', filter)
    const matching = records.filter(task => filter === 'all' || task.status === filter).map(task => task.id)
    await expectIds(page, matching.slice(0, 2))
    await expectStatus(page, 1, 2, matching.length)
    const collected: string[] = []
    for (let start = 0; start < matching.length; start += 2) {
      await expectIds(page, matching.slice(start, start + 2))
      collected.push(...await ids(page) as string[])
      if (start + 2 < matching.length) await click(page, 'Naslednja stran')
    }
    expect(collected).toEqual(matching)
    await select(page, 'Velikost strani', 'all')
    await expectIds(page, matching)
    await expectStatus(page, 1, matching.length, matching.length)
    await select(page, 'Velikost strani', '2')
  }
})

test('S04: views and details retain the global page while counts keep their scope', async ({ page }) => {
  await mount(page, records)
  await select(page, 'Velikost strani', '2')
  for (const filter of ['all', 'in_progress']) {
    await select(page, 'Filter strani', filter)
    await click(page, 'Naslednja stran')
    const matching = records.filter(task => filter === 'all' || task.status === filter)
    const visible = matching.slice(2, 4)
    await expectIds(page, visible.map(task => task.id))
    await board(page)
    await expectIds(page, visible.map(task => task.id), false)
    await summary(page, [6, 6, 5])
    await expect(page.locator('.count-badge')).toHaveText('17')
    for (const [index, name] of ['Pripravljeno', 'V delu', 'Končano'].entries()) {
      const expected = visible.filter(task => task.status === states[index]).map(task => task.id)
      await columnIds(page, name, expected)
      await expect(page.getByRole('region', { name, exact: true }).locator('.column-count')).toHaveText(String(expected.length))
    }
    for (const view of ['board', 'table']) {
      if (view === 'table') await table(page)
      const link = page.locator(`[data-task-id="${visible[0].id}"]`).getByRole('link')
      await link.click()
      const dialog = page.getByRole('dialog')
      await expect(dialog.getByRole('heading', { name: visible[0].title, exact: true })).toBeVisible()
      await expect(dialog.getByText(visible[0].description, { exact: true })).toBeVisible()
      if (view === 'board') await click(page, 'Zapri podrobnosti')
      else await page.keyboard.press('Escape')
      await expect(dialog).toHaveCount(0)
      await expect(link).toBeFocused()
      await expectStatus(page, 2, 2, matching.length)
      await expect(page.getByRole('combobox', { name: 'Velikost strani' })).toHaveValue('2')
      await expect(page.getByRole('combobox', { name: 'Filter strani' })).toHaveValue(filter)
      await expectIds(page, visible.map(task => task.id), view === 'table')
    }
  }
})

test('S05: project changes and reload reset settings without persistence', async ({ page }) => {
  await mount(page, [...records, makeTask('drug-id', { projectId: 'launch' })])
  const storage = () => page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }))
  const beforeStorage = await storage()
  const url = page.url()
  const configure = async () => {
    await select(page, 'Velikost strani', '2')
    await select(page, 'Filter strani', 'todo')
    await click(page, 'Naslednja stran')
  }
  const defaults = async (expected: string[]) => {
    await expect(page.getByRole('combobox', { name: 'Velikost strani' })).toHaveValue('all')
    await expect(page.getByRole('combobox', { name: 'Filter strani' })).toHaveValue('all')
    await expectIds(page, expected)
    await expectStatus(page, 1, expected.length, expected.length)
  }
  await configure()
  expect(page.url()).toBe(url)
  expect(await storage()).toEqual(beforeStorage)
  await project(page, 'launch')
  await defaults(['drug-id'])
  await project(page, 'web')
  await defaults(recordIds)
  await configure()
  await page.reload()
  await defaults(recordIds)
  expect(page.url()).toBe(url)
  expect(await storage()).toEqual(beforeStorage)
})

for (const emptyProject of [true, false]) {
  test(`S06: ${emptyProject ? 'empty projects' : 'empty filter'} has zero status in both views`, async ({ page }) => {
    const input = emptyProject ? [] : records.slice(0, 5).map(task => ({ ...task, status: 'done' as const }))
    await mount(page, input)
    await select(page, 'Velikost strani', '2')
    if (!emptyProject) await click(page, 'Zadnja stran')
    await select(page, 'Filter strani', 'todo')
    for (const view of ['table', 'board']) {
      if (view === 'board') await board(page)
      await expectIds(page, [])
      await expect(status(page)).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
      for (const name of controls) await expect(page.getByRole('button', { name, exact: true })).toBeDisabled()
    }
    await expect(page.locator('.column-count')).toHaveText(['0', '0', '0'])
    await table(page)
    await select(page, 'Filter strani', 'all')
    if (!emptyProject) {
      await expectIds(page, input.slice(0, 2).map(task => task.id))
      await expectStatus(page, 1, 2, input.length)
    } else {
      await project(page, 'launch')
      await expect(status(page)).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
      await board(page)
      await expect(page.locator('.column-count')).toHaveText(['0', '0', '0'])
    }
  })
}

test('S07: pagination and filtering leave data intact and send no writes', async ({ page }) => {
  const writes = await mount(page, records)
  const before = await (await page.request.get('/__test/state')).json()
  await select(page, 'Velikost strani', '2')
  await click(page, 'Zadnja stran')
  await select(page, 'Filter strani', 'done')
  await board(page)
  await click(page, 'Naslednja stran')
  await table(page)
  await select(page, 'Filter strani', 'all')
  await select(page, 'Velikost strani', 'all')
  await expectIds(page, recordIds)
  await expect(page.locator('.task-link > span:first-child')).toHaveText(records.map(task => task.title))
  await expect(page.locator('a button, a select')).toHaveCount(0)
  await readonly(page, writes)
  expect(await (await page.request.get('/__test/state')).json()).toEqual(before)
})

test('S08: controls remain usable by keyboard at 390px in both views', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mount(page, records)
  const size = page.getByRole('combobox', { name: 'Velikost strani' })
  await size.selectOption('2')
  await size.focus()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('combobox', { name: 'Filter strani' })).toBeFocused()
  const next = page.getByRole('button', { name: 'Naslednja stran', exact: true })
  await next.focus()
  await page.keyboard.press('Enter')
  await expectIds(page, recordIds.slice(2, 4))
  await expect(next).toBeFocused()
  expect(await next.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe('none')
  for (const view of ['table', 'board']) {
    if (view === 'board') await board(page)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    for (const name of controls) {
      const bounds = await page.getByRole('button', { name, exact: true }).boundingBox()
      expect(bounds!.x).toBeGreaterThanOrEqual(0)
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390)
    }
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.screenshot({ path: `docs/agent/P05/mobile-${view}.png`, fullPage: true })
  }
})
