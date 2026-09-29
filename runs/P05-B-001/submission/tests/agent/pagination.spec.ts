import { expect, test, type Page } from '@playwright/test'
import { board, click, columnIds, expectIds, ids, makeTask, mount, project, readonly, select, summary, table } from '../development/helpers.ts'
import type { Task } from '../../shared/types.ts'

const statuses: Task['status'][] = ['todo', 'done', 'in_progress', 'todo', 'todo', 'in_progress', 'done', 'todo', 'in_progress', 'todo', 'done', 'todo', 'in_progress']
const records = statuses.map((status, index) => makeTask(index === 4 ? 'naloga/ž? 42' : `z-${31 - index * 2}`, {
  status, title: '<b>Čas "A" & B</b>', description: `Opis ${index}: čšž\nDruga vrstica.`, dueDate: '2028-02-29',
}))
const taskIds = records.map(task => task.id)
const buttons = ['Prva stran', 'Prejšnja stran', 'Naslednja stran', 'Zadnja stran']
const status = (page: Page) => page.getByRole('status', { name: 'Stanje straničenja', exact: true })

async function empty(page: Page) {
  await expectIds(page, [])
  await expect(status(page)).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
  for (const name of buttons) await expect(page.getByRole('button', { name, exact: true })).toBeDisabled()
}

for (const width of [1440, 390]) {
  test.describe(`P05 pri širini ${width}`, () => {
    test.use({ viewport: { width, height: 960 } })

    test('S01: defaults, complete partitions, boundaries and size reset', async ({ page }) => {
      const writes = await mount(page, records)
      await expectIds(page, taskIds)
      await expect(page.getByLabel('Velikost strani')).toHaveValue('all')
      await expect(page.getByLabel('Filter strani')).toHaveValue('all')
      await expect(status(page)).toHaveText('Stran 1 od 1. Prikazano 1–13 od 13.')
      for (const name of buttons) await expect(page.getByRole('button', { name, exact: true })).toBeDisabled()
      for (const size of [2, 5, 10]) {
        await select(page, 'Velikost strani', String(size))
        const seen: string[] = []
        const pages = Math.ceil(13 / size)
        for (let number = 1; number <= pages; number++) {
          await expectIds(page, taskIds.slice((number - 1) * size, number * size))
          await expect(status(page)).toHaveText(`Stran ${number} od ${pages}. Prikazano ${(number - 1) * size + 1}–${Math.min(number * size, 13)} od 13.`)
          seen.push(...await ids(page) as string[])
          if (number < pages) await click(page, 'Naslednja stran')
        }
        expect(seen).toEqual(taskIds)
        expect(new Set(seen).size).toBe(13)
        for (const name of ['Naslednja stran', 'Zadnja stran']) {
          const button = page.getByRole('button', { name, exact: true })
          await expect(button).toBeDisabled()
          await button.evaluate(element => (element as HTMLButtonElement).click())
        }
        await expectIds(page, taskIds.slice((pages - 1) * size))
        await click(page, 'Prejšnja stran')
        await expectIds(page, taskIds.slice((pages - 2) * size, (pages - 1) * size))
        await click(page, 'Zadnja stran')
        await expectIds(page, taskIds.slice((pages - 1) * size))
        await click(page, 'Prva stran')
        await expectIds(page, taskIds.slice(0, size))
        for (const name of ['Prva stran', 'Prejšnja stran']) await expect(page.getByRole('button', { name, exact: true })).toBeDisabled()
      }
      await select(page, 'Velikost strani', '2')
      await click(page, 'Naslednja stran')
      await select(page, 'Velikost strani', '5')
      await expectIds(page, taskIds.slice(0, 5))
      await expect(status(page)).toHaveText('Stran 1 od 3. Prikazano 1–5 od 13.')
      await click(page, 'Naslednja stran')
      await select(page, 'Velikost strani', 'all')
      await expectIds(page, taskIds)
      await expect(status(page)).toHaveText('Stran 1 od 1. Prikazano 1–13 od 13.')
      await readonly(page, writes)
    })

    test('S02: stable filters, shared board page and full versus visible counts', async ({ page }) => {
      const writes = await mount(page, records)
      await select(page, 'Velikost strani', '2')
      const expected: Record<string, number[]> = { todo: [0, 3, 4, 7, 9, 11], in_progress: [2, 5, 8, 12], done: [1, 6, 10], all: records.map((_, index) => index) }
      for (const filter of ['todo', 'in_progress', 'done', 'all']) {
        await click(page, 'Zadnja stran')
        await select(page, 'Filter strani', filter)
        await expectIds(page, expected[filter].slice(0, 2).map(index => taskIds[index]))
        await expect(status(page)).toHaveText(`Stran 1 od ${Math.ceil(expected[filter].length / 2)}. Prikazano 1–2 od ${expected[filter].length}.`)
        await summary(page, [6, 4, 3])
        await expect(page.locator('.count-badge')).toHaveText('13')
        await expect(page.locator('.table-footer')).toContainText('3 / 13 končanih')
      }
      await select(page, 'Velikost strani', '5')
      await click(page, 'Naslednja stran')
      await expectIds(page, taskIds.slice(5, 10))
      await board(page)
      await expectIds(page, taskIds.slice(5, 10), false)
      for (const [name, indexes] of [['Pripravljeno', [7, 9]], ['V delu', [5, 8]], ['Končano', [6]]] as const) {
        await columnIds(page, name, indexes.map(index => taskIds[index]))
        await expect(page.getByRole('region', { name, exact: true }).locator('.column-count')).toHaveText(String(indexes.length))
      }
      await summary(page, [6, 4, 3])
      await select(page, 'Filter strani', 'todo')
      await click(page, 'Naslednja stran')
      await expectIds(page, [taskIds[11]])
      await expect(status(page)).toHaveText('Stran 2 od 2. Prikazano 6–6 od 6.')
      await select(page, 'Velikost strani', '2')
      await expect(page.getByLabel('Filter strani')).toHaveValue('todo')
      await expectIds(page, [taskIds[0], taskIds[3]])
      await table(page)
      await expectIds(page, [taskIds[0], taskIds[3]])
      await readonly(page, writes)
    })

    test('S03: details and view preserve state; project and refresh reset it', async ({ page }) => {
      const writes = await mount(page, records)
      await select(page, 'Velikost strani', '2')
      await select(page, 'Filter strani', 'todo')
      await click(page, 'Naslednja stran')
      for (const view of ['table', 'board'] as const) {
        if (view === 'board') await board(page)
        await expectIds(page, [taskIds[4], taskIds[7]], false)
        const link = page.locator('[data-task-id]').filter({ hasText: taskIds[4] }).getByRole('link')
        await link.focus()
        await page.keyboard.press('Enter')
        const dialog = page.getByRole('dialog')
        await expect(dialog.getByRole('heading', { name: records[4].title, exact: true })).toBeVisible()
        await expect(dialog.locator('.description p')).toHaveText(records[4].description)
        expect(page.url()).toContain(encodeURIComponent(taskIds[4]))
        if (view === 'table') await click(page, 'Zapri podrobnosti')
        else await page.keyboard.press('Escape')
        await expect(dialog).toHaveCount(0)
        await expect(link).toBeFocused()
        await expect(status(page)).toHaveText('Stran 2 od 3. Prikazano 3–4 od 6.')
        await expect(page.getByLabel('Velikost strani')).toHaveValue('2')
        await expect(page.getByLabel('Filter strani')).toHaveValue('todo')
      }
      expect(new URL(page.url()).hash).toBe('#/projects/web?view=board')
      expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 })
      await project(page, 'launch')
      await empty(page)
      await expect(page.getByLabel('Velikost strani')).toHaveValue('all')
      await expect(page.getByLabel('Filter strani')).toHaveValue('all')
      await project(page, 'web')
      await expectIds(page, taskIds, false)
      for (const view of ['board', 'table'] as const) {
        if (view === 'table') await table(page)
        await select(page, 'Velikost strani', '2')
        await select(page, 'Filter strani', 'todo')
        await click(page, 'Naslednja stran')
        await page.reload()
        await expect(page.getByLabel('Velikost strani')).toHaveValue('all')
        await expect(page.getByLabel('Filter strani')).toHaveValue('all')
        await expectIds(page, taskIds, view === 'table')
        await expect(status(page)).toHaveText('Stran 1 od 1. Prikazano 1–13 od 13.')
      }
      await readonly(page, writes)
    })

    test('S04: both projects empty in both views', async ({ page }) => {
      const writes = await mount(page, [])
      for (const id of ['web', 'launch'] as const) {
        await project(page, id)
        for (const size of ['all', '2', '5', '10']) {
          await select(page, 'Velikost strani', size)
          await select(page, 'Filter strani', 'done')
          await empty(page)
          await board(page)
          await empty(page)
          await expect(page.locator('.column-count')).toHaveText(['0', '0', '0'])
          await select(page, 'Filter strani', 'all')
          await empty(page)
          await summary(page, [0, 0, 0])
          await table(page)
        }
      }
      await readonly(page, writes)
    })

    test('S05: single task, empty filter, keyboard controls and mobile containment', async ({ page }) => {
      const writes = await mount(page, [records[0]])
      await expect(status(page)).toHaveText('Stran 1 od 1. Prikazano 1–1 od 1.')
      for (const size of ['2', '5', '10', 'all']) {
        await select(page, 'Velikost strani', size)
        await expectIds(page, [taskIds[0]])
        for (const name of buttons) await expect(page.getByRole('button', { name, exact: true })).toBeDisabled()
      }
      await page.getByLabel('Filter strani').focus()
      await page.keyboard.press('k')
      await page.keyboard.press('Enter')
      await expect(page.getByLabel('Filter strani')).toHaveValue('done')
      await empty(page)
      await summary(page, [1, 0, 0])
      await expect(page.locator('.count-badge')).toHaveText('1')
      await board(page)
      await empty(page)
      await expect(page.locator('.column-count')).toHaveText(['0', '0', '0'])
      await readonly(page, writes)
      await select(page, 'Filter strani', 'all')
      await expectIds(page, [taskIds[0]])
      await expect(status(page)).toHaveText('Stran 1 od 1. Prikazano 1–1 od 1.')
      await table(page)
      await expect(page.getByRole('link', { name: `${records[0].title} ${taskIds[0]}`, exact: true })).toBeVisible()
      await readonly(page, writes)
    })
  })
}
