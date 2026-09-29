import type { Page } from '@playwright/test'
import { test, expect, mount, makeTask, expectIds, ids, select, click, board, table, project, summary, readonly } from '../development/helpers.ts'

const taskIds = ['z-9', 'a-2', 'č-7', 'n-1', 'b-8', 'x-3', 'd-6', 'v-4', 'e-5', 'k-0', 'j-12', 'f-11', 'h-10']
const statuses = ['todo', 'in_progress', 'done'] as const
const records = taskIds.map((id, index) => makeTask(id, {
  title: 'Enak naslov, "čšž"', description: `Opis ${id}\nDruga vrstica; ž`,
  status: statuses[index % 3], dueDate: '2026-10-15',
}))
const pageStatus = (page: Page) => page.getByRole('status', { name: 'Stanje straničenja', exact: true })
const sizeControl = (page: Page) => page.getByRole('combobox', { name: 'Velikost strani', exact: true })
const filterControl = (page: Page) => page.getByRole('combobox', { name: 'Filter strani', exact: true })
const movements = ['Prva stran', 'Prejšnja stran', 'Naslednja stran', 'Zadnja stran']
async function allDisabled(page: Page) {
  for (const name of movements) await expect(page.getByRole('button', { name, exact: true })).toBeDisabled()
}

for (const size of [2, 5, 10]) {
  test(`P01: ordered pages and all navigation, size ${size}`, async ({ page }) => {
    await mount(page, records)
    await expect(sizeControl(page)).toHaveValue('all')
    await expect(filterControl(page)).toHaveValue('all')
    await expectIds(page, taskIds)
    await expect(pageStatus(page)).toHaveText('Stran 1 od 1. Prikazano 1–13 od 13.')
    await allDisabled(page)
    await select(page, 'Velikost strani', String(size))
    const pages = Math.ceil(13 / size)
    const seen: string[] = []
    for (let number = 1; number <= pages; number++) {
      const expected = taskIds.slice((number - 1) * size, number * size)
      await expectIds(page, expected)
      seen.push(...await ids(page) as string[])
      await expect(pageStatus(page)).toHaveText(`Stran ${number} od ${pages}. Prikazano ${(number - 1) * size + 1}–${Math.min(number * size, 13)} od 13.`)
      for (const name of movements.slice(0, 2)) {
        const button = page.getByRole('button', { name, exact: true })
        if (number === 1) await expect(button).toBeDisabled()
        else await expect(button).toBeEnabled()
      }
      for (const name of movements.slice(2)) {
        const button = page.getByRole('button', { name, exact: true })
        if (number === pages) await expect(button).toBeDisabled()
        else await expect(button).toBeEnabled()
      }
      if (number < pages) await click(page, 'Naslednja stran')
    }
    expect(seen).toEqual(taskIds)
    const lastStatus = await pageStatus(page).textContent()
    await page.getByRole('button', { name: 'Naslednja stran', exact: true }).evaluate((button: HTMLButtonElement) => button.click())
    await expect(pageStatus(page)).toHaveText(lastStatus!)
    await click(page, 'Prejšnja stran')
    await expectIds(page, taskIds.slice((pages - 2) * size, (pages - 1) * size))
    if (pages > 2) await click(page, 'Prva stran')
    await expectIds(page, taskIds.slice(0, size))
    await click(page, 'Zadnja stran')
    await expectIds(page, taskIds.slice((pages - 1) * size))
  })
}

test('P01: changing size resets a still-valid second page', async ({ page }) => {
  await mount(page, records)
  for (const size of ['2', '5', '10']) {
    await select(page, 'Velikost strani', size)
    await expectIds(page, taskIds.slice(0, Number(size)))
    await expect(pageStatus(page)).toContainText('Stran 1 od')
    await click(page, 'Naslednja stran')
  }
  await select(page, 'Velikost strani', 'all')
  await expectIds(page, taskIds)
  await expect(pageStatus(page)).toHaveText('Stran 1 od 1. Prikazano 1–13 od 13.')
  await allDisabled(page)
})

test('P02: filters precede paging, preserve views/details, and count the correct scope', async ({ page }) => {
  await mount(page, records)
  await select(page, 'Velikost strani', '2')
  const matching = {
    todo: ['z-9', 'n-1', 'd-6', 'k-0', 'h-10'],
    in_progress: ['a-2', 'b-8', 'v-4', 'j-12'],
    done: ['č-7', 'x-3', 'e-5', 'f-11'],
  }
  for (const state of statuses) {
    const last = page.getByRole('button', { name: 'Zadnja stran', exact: true })
    if (await last.isEnabled()) await last.click()
    await select(page, 'Filter strani', state)
    await expectIds(page, matching[state].slice(0, 2))
    await expect(pageStatus(page)).toContainText('Stran 1 od')
    await click(page, 'Naslednja stran')
    const expected = matching[state].slice(2, 4)
    await expectIds(page, expected)
    const text = await pageStatus(page).textContent()
    await board(page)
    await expectIds(page, expected, false)
    await summary(page, [5, 4, 4])
    await expect(page.locator('.count-badge')).toHaveText('13')
    const labels = ['Pripravljeno', 'V delu', 'Končano']
    for (let index = 0; index < statuses.length; index++) {
      const column = page.getByRole('region', { name: labels[index], exact: true })
      await expect(column.locator('.column-count')).toHaveText(statuses[index] === state ? '2' : '0')
    }
    await page.locator(`[data-task-id="${expected[0]}"]`).getByRole('link').click()
    await expect(page.getByRole('dialog').getByText(expected[0], { exact: true }).first()).toBeVisible()
    await click(page, 'Zapri podrobnosti')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(pageStatus(page)).toHaveText(text!)
    await table(page)
    await expectIds(page, expected)
    const link = page.locator(`[data-task-id="${expected[1]}"]`).getByRole('link')
    await link.click()
    await expect(page.getByRole('dialog').getByText(expected[1], { exact: true }).first()).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(link).toBeFocused()
    await expect(pageStatus(page)).toHaveText(text!)
    await expect(sizeControl(page)).toHaveValue('2')
    await expect(filterControl(page)).toHaveValue(state)
  }
  await select(page, 'Filter strani', 'all')
  await expectIds(page, taskIds.slice(0, 2))
  await click(page, 'Naslednja stran')
  await board(page)
  await expectIds(page, ['č-7', 'n-1'], false)
  await expect(page.locator('.column-count')).toHaveText(['1', '0', '1'])
  await summary(page, [5, 4, 4])
})

test('P03: project changes and reload reset local state without URL or storage', async ({ page }) => {
  await mount(page, [...records, makeTask('other', { projectId: 'launch' })])
  const initialStorage = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }))
  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'todo')
  await click(page, 'Naslednja stran')
  expect(new URL(page.url()).hash).toBe('#/projects/web')
  await board(page)
  await project(page, 'launch')
  await expect(sizeControl(page)).toHaveValue('all')
  await expect(filterControl(page)).toHaveValue('all')
  await expect(pageStatus(page)).toHaveText('Stran 1 od 1. Prikazano 1–1 od 1.')
  await project(page, 'web')
  await expectIds(page, taskIds, false)
  await expect(sizeControl(page)).toHaveValue('all')
  await expect(filterControl(page)).toHaveValue('all')
  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'done')
  await click(page, 'Naslednja stran')
  expect(new URL(page.url()).hash).toBe('#/projects/web?view=board')
  expect(await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }))).toEqual(initialStorage)
  await page.reload()
  await expect(sizeControl(page)).toHaveValue('all')
  await expect(filterControl(page)).toHaveValue('all')
  await expect(pageStatus(page)).toHaveText('Stran 1 od 1. Prikazano 1–13 od 13.')
  await expectIds(page, taskIds, false)
})

for (const count of [0, 1]) {
  test(`P04: empty and singleton projects, count ${count}`, async ({ page }) => {
    await mount(page, count === 0 ? [] : [makeTask('solo')])
    for (const size of ['all', '2', '5', '10']) {
      await select(page, 'Velikost strani', size)
      await expectIds(page, count === 0 ? [] : ['solo'])
      await expect(pageStatus(page)).toHaveText(count === 0 ? 'Stran 0 od 0. Prikazano 0–0 od 0.' : 'Stran 1 od 1. Prikazano 1–1 od 1.')
      await allDisabled(page)
    }
    await select(page, 'Filter strani', 'done')
    await expect(pageStatus(page)).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
    await allDisabled(page)
    await board(page)
    await expectIds(page, [])
    await expect(page.locator('.column-count')).toHaveText(['0', '0', '0'])
    await select(page, 'Filter strani', 'all')
    await expectIds(page, count === 0 ? [] : ['solo'])
    await project(page, 'launch')
    await expect(pageStatus(page)).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
    await allDisabled(page)
    await table(page)
    await expectIds(page, [])
  })
}

test('P04: a nonmatching filter resets the page and removing it starts at one', async ({ page }) => {
  await mount(page, records.map(task => ({ ...task, status: 'todo' })))
  await select(page, 'Velikost strani', '2')
  await click(page, 'Zadnja stran')
  await select(page, 'Filter strani', 'done')
  await expectIds(page, [])
  await expect(pageStatus(page)).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
  await allDisabled(page)
  await select(page, 'Filter strani', 'all')
  await expectIds(page, taskIds.slice(0, 2))
  await expect(pageStatus(page)).toHaveText('Stran 1 od 7. Prikazano 1–2 od 13.')
})

test('P05: mobile controls, keyboard focus and read-only data', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const testControlRequests: string[] = []
  page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/__test/')) testControlRequests.push(request.url()) })
  const writes = await mount(page, records)
  const before = await (await page.request.get('/__test/state')).json()
  await select(page, 'Velikost strani', '2')
  await filterControl(page).focus()
  await page.keyboard.press('Tab')
  const next = page.getByRole('button', { name: 'Naslednja stran', exact: true })
  await expect(next).toBeFocused()
  expect(await next.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe('none')
  await page.keyboard.press('Enter')
  await expectIds(page, ['č-7', 'n-1'])
  await readonly(page, writes)
  await page.screenshot({ path: 'docs/agent/P05/mobile-table.png', fullPage: true })
  await board(page)
  await expectIds(page, ['č-7', 'n-1'], false)
  await readonly(page, writes)
  await page.screenshot({ path: 'docs/agent/P05/mobile-board.png', fullPage: true })
  await select(page, 'Filter strani', 'done')
  await click(page, 'Zadnja stran')
  await select(page, 'Velikost strani', 'all')
  const after = await (await page.request.get('/__test/state')).json()
  expect(after.tasks).toEqual(before.tasks)
  expect(after.saveRequests).toBe(0)
  expect(await page.evaluate(async () => (await fetch('/api/projects/web/tasks')).json())).toEqual(records)
  expect(writes).toEqual([])
  expect(testControlRequests).toEqual([])
})
