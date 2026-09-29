import { type Page } from '@playwright/test'
import { test, expect, mount, makeTask, expectIds, ids, select, click, board, table, project, summary, columnIds, readonly, type Task } from '../development/helpers.ts'

const statuses: Task['status'][] = ['todo', 'in_progress', 'todo', 'done', 'todo', 'in_progress', 'todo', 'done', 'todo', 'in_progress', 'todo', 'done', 'todo']
const records = [41, 7, 92, 2, 31, 18, 6, 75, 9, 54, 1, 63, 27].map((number, index) => makeTask(`č-${number}`, {
  title: 'Enak naslov, "čšž"', description: `Opis ${number}\nDruga vrstica <besedilo>`, status: statuses[index],
}))
const names = ['Prva stran', 'Prejšnja stran', 'Naslednja stran', 'Zadnja stran']
const pageStatus = (page: Page) => page.getByRole('status', { name: 'Stanje straničenja' })
const taskIds = (tasks: Task[]) => tasks.map(task => task.id)
async function edges(page: Page, first: boolean, last: boolean) {
  for (const [index, name] of names.entries()) {
    const button = page.getByRole('button', { name, exact: true })
    if (index < 2 ? first : last) await expect(button).toBeDisabled()
    else await expect(button).toBeEnabled()
  }
}

test('A01: every size and filter partitions 13 tasks without losses, repeats or reordering', async ({ page }) => {
  const writes = await mount(page, records)
  await expectIds(page, taskIds(records))
  await expect(page.getByRole('combobox', { name: 'Velikost strani' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter strani' })).toHaveValue('all')
  await expect(pageStatus(page)).toHaveText('Stran 1 od 1. Prikazano 1–13 od 13.')
  await edges(page, true, true)
  for (const filter of ['all', 'todo', 'in_progress', 'done']) {
    await select(page, 'Filter strani', filter)
    const expected = records.filter(task => filter === 'all' || task.status === filter)
    for (const size of [2, 5, 10]) {
      await select(page, 'Velikost strani', String(size))
      const visited = []
      for (let offset = 0; offset < expected.length; offset += size) {
        await expectIds(page, taskIds(expected.slice(offset, offset + size)))
        visited.push(...await ids(page))
        await expect(pageStatus(page)).toHaveText(`Stran ${offset / size + 1} od ${Math.ceil(expected.length / size)}. Prikazano ${offset + 1}–${Math.min(offset + size, expected.length)} od ${expected.length}.`)
        await edges(page, offset === 0, offset + size >= expected.length)
        if (offset + size < expected.length) await click(page, 'Naslednja stran')
      }
      expect(visited).toEqual(taskIds(expected))
      expect(new Set(visited).size).toBe(expected.length)
    }
  }
  await readonly(page, writes)
})

test('A02: all four moves, exact division, and size/filter reset even when the previous page remains valid', async ({ page }) => {
  await mount(page, records.slice(0, 10))
  await select(page, 'Velikost strani', '2')
  await click(page, 'Zadnja stran')
  await expectIds(page, taskIds(records.slice(8, 10)))
  await expect(pageStatus(page)).toHaveText('Stran 5 od 5. Prikazano 9–10 od 10.')
  await click(page, 'Prejšnja stran')
  await expectIds(page, taskIds(records.slice(6, 8)))
  await click(page, 'Prva stran')
  await expectIds(page, taskIds(records.slice(0, 2)))
  await click(page, 'Naslednja stran')
  await select(page, 'Velikost strani', '5')
  await expectIds(page, taskIds(records.slice(0, 5)))
  await expect(pageStatus(page)).toHaveText('Stran 1 od 2. Prikazano 1–5 od 10.')
  await click(page, 'Naslednja stran')
  await select(page, 'Filter strani', 'todo')
  await expect(pageStatus(page)).toHaveText('Stran 1 od 1. Prikazano 1–5 od 5.')
  await select(page, 'Velikost strani', '2')
  await click(page, 'Naslednja stran')
  await select(page, 'Velikost strani', '5')
  await expect(page.getByRole('combobox', { name: 'Filter strani' })).toHaveValue('todo')
  await expectIds(page, taskIds(records.slice(0, 10).filter(task => task.status === 'todo')))
  await select(page, 'Velikost strani', '10')
  await select(page, 'Velikost strani', 'all')
  await expect(pageStatus(page)).toHaveText('Stran 1 od 1. Prikazano 1–5 od 5.')
  await edges(page, true, true)
})

test('A03: board groups the shared page; project counts and column counts have distinct scopes', async ({ page }) => {
  await mount(page, records)
  await select(page, 'Velikost strani', '5')
  for (const offset of [0, 5, 10]) {
    const visible = records.slice(offset, offset + 5)
    await expectIds(page, taskIds(visible))
    await board(page)
    await expectIds(page, taskIds(visible), false)
    await summary(page, [7, 3, 3])
    await expect(page.locator('.count-badge')).toHaveText('13')
    await expect(page.locator('.table-footer')).toContainText('3 / 13 končanih')
    for (const [status, name] of [['todo', 'Pripravljeno'], ['in_progress', 'V delu'], ['done', 'Končano']]) {
      const expected = visible.filter(task => task.status === status)
      await columnIds(page, name, taskIds(expected))
      await expect(page.getByRole('region', { name, exact: true }).locator('.column-count')).toHaveText(String(expected.length))
    }
    await table(page)
    await expectIds(page, taskIds(visible))
    if (offset < 10) await click(page, 'Naslednja stran')
  }
  await select(page, 'Filter strani', 'done')
  await board(page)
  await summary(page, [7, 3, 3])
  await columnIds(page, 'Pripravljeno', [])
  await columnIds(page, 'Končano', taskIds(records.filter(task => task.status === 'done')))
})

test('A04: view and detail navigation preserve a filtered second page and the correct duplicate-title ID', async ({ page }) => {
  const writes = await mount(page, records)
  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'todo')
  await click(page, 'Naslednja stran')
  const visible = records.filter(task => task.status === 'todo').slice(2, 4)
  for (const view of ['board', 'table']) {
    if (view === 'board') await board(page)
    else await table(page)
    for (const dismissal of ['button', 'escape', 'back']) {
      await expectIds(page, taskIds(visible))
      const link = page.locator(`[data-task-id="${visible[1].id}"]`).getByRole('link')
      await link.focus()
      await page.keyboard.press('Enter')
      await expect(page.getByRole('dialog').getByText(visible[1].description, { exact: true })).toBeVisible()
      await expect(page.getByRole('dialog').locator('dd.task-id')).toHaveText(visible[1].id)
      if (dismissal === 'button') await click(page, 'Zapri podrobnosti')
      else if (dismissal === 'escape') await page.keyboard.press('Escape')
      else await page.goBack()
      await expect(page.getByRole('dialog')).toHaveCount(0)
      await expect(link).toBeFocused()
      await expect(pageStatus(page)).toHaveText('Stran 2 od 4. Prikazano 3–4 od 7.')
      await expect(page.getByRole('combobox', { name: 'Velikost strani' })).toHaveValue('2')
      await expect(page.getByRole('combobox', { name: 'Filter strani' })).toHaveValue('todo')
    }
  }
  await readonly(page, writes)
})

for (const view of ['table', 'board']) {
  test(`A05 ${view}: project change and reload reset local pagination without persistence`, async ({ page }) => {
    await mount(page, [...records, makeTask('drugi', { projectId: 'launch' })], `#/projects/web${view === 'board' ? '?view=board' : ''}`)
    const originalUrl = page.url()
    for (const action of ['project', 'reload']) {
      await select(page, 'Velikost strani', '2')
      await select(page, 'Filter strani', 'todo')
      await click(page, 'Zadnja stran')
      expect(page.url()).toBe(originalUrl)
      expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0])
      if (action === 'project') {
        await project(page, 'launch')
        await expect(pageStatus(page)).toHaveText('Stran 1 od 1. Prikazano 1–1 od 1.')
        await expect(page.getByRole('combobox', { name: 'Velikost strani' })).toHaveValue('all')
        await expect(page.getByRole('combobox', { name: 'Filter strani' })).toHaveValue('all')
        await project(page, 'web')
      } else await page.reload()
      await expect(page.getByRole('combobox', { name: 'Velikost strani' })).toHaveValue('all')
      await expect(page.getByRole('combobox', { name: 'Filter strani' })).toHaveValue('all')
      await expect(pageStatus(page)).toHaveText('Stran 1 od 1. Prikazano 1–13 od 13.')
      await expectIds(page, taskIds(records), view === 'table')
    }
  })
}

test('A06: two empty projects keep controls usable in both views', async ({ page }) => {
  await mount(page, [])
  for (const id of ['web', 'launch'] as const) {
    await project(page, id)
    for (const size of ['all', '2', '5', '10']) {
      await select(page, 'Velikost strani', size)
      await expect(pageStatus(page)).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
      await edges(page, true, true)
      await board(page)
      await expect(page.getByRole('region', { name: 'Tabla opravil' }).getByRole('region')).toHaveCount(3)
      await expectIds(page, [])
      await table(page)
      await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
    }
  }
})

test('A07: singleton and empty filter at 390px, keyboard controls and no API writes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page, [records[0]])
  await expectIds(page, [records[0].id])
  await expect(pageStatus(page)).toHaveText('Stran 1 od 1. Prikazano 1–1 od 1.')
  await edges(page, true, true)
  const size = page.getByRole('combobox', { name: 'Velikost strani' })
  await size.focus()
  await page.keyboard.press('2')
  await page.keyboard.press('Enter')
  await expect(size).toHaveValue('2')
  for (const view of ['table', 'board']) {
    if (view === 'board') await board(page)
    await select(page, 'Filter strani', 'done')
    await expect(pageStatus(page)).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
    await expectIds(page, [])
    await edges(page, true, true)
    await readonly(page, writes)
    await select(page, 'Filter strani', 'all')
    await expect(pageStatus(page)).toHaveText('Stran 1 od 1. Prikazano 1–1 od 1.')
    await expectIds(page, [records[0].id])
    await readonly(page, writes)
  }
})
