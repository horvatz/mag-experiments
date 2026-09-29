import { type Page } from '@playwright/test'
import { test, expect, mount, makeTask, expectIds, select, click, board, table, project, summary, columnIds, readonly, type Task } from '../development/helpers.ts'

const statuses = ['todo', 'in_progress', 'done'] as const
const labels = ['Pripravljeno', 'V delu', 'Končano']
const records = Array.from({ length: 23 }, (_, index) => makeTask(`č-${(index * 7) % 23}-x`, {
  title: 'Enak naslov, »čšž«', description: 'Besedilo <b>ni HTML</b> & druga vrstica\nUnicode: Živa',
  status: statuses[index % 3], dueDate: '2028-02-29',
}))
const taskIds = (tasks: Task[]) => tasks.map(task => task.id)
const status = (page: Page) => page.getByRole('status', { name: 'Stanje straničenja' })
const moves = ['Prva stran', 'Prejšnja stran', 'Naslednja stran', 'Zadnja stran']

async function expectDefaults(page: Page, tasks: Task[]) {
  await expect(page.getByRole('combobox', { name: 'Velikost strani' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter strani' })).toHaveValue('all')
  await expectIds(page, taskIds(tasks), false)
  await expect(status(page)).toHaveText(tasks.length ? `Stran 1 od 1. Prikazano 1–${tasks.length} od ${tasks.length}.` : 'Stran 0 od 0. Prikazano 0–0 od 0.')
  for (const name of moves) await expect(page.getByRole('button', { name, exact: true })).toBeDisabled()
}

for (const count of [1, 2, 3, 5, 6, 10, 11, 23]) {
  test(`A01 R01–R04/R09: ordered disjoint pages for ${count} tasks and every size`, async ({ page }) => {
    const tasks = records.slice(0, count)
    await mount(page, tasks)
    await expectDefaults(page, tasks)
    await expectIds(page, taskIds(tasks))
    for (const size of [2, 5, 10]) {
      await select(page, 'Velikost strani', String(size))
      const collected: string[] = []
      const pages = Math.ceil(count / size)
      for (let current = 1; current <= pages; current++) {
        const slice = tasks.slice((current - 1) * size, current * size)
        await expectIds(page, taskIds(slice))
        await expect(status(page)).toHaveText(`Stran ${current} od ${pages}. Prikazano ${(current - 1) * size + 1}–${Math.min(current * size, count)} od ${count}.`)
        for (const name of moves.slice(0, 2)) await expect(page.getByRole('button', { name, exact: true })).toHaveJSProperty('disabled', current === 1)
        for (const name of moves.slice(2)) await expect(page.getByRole('button', { name, exact: true })).toHaveJSProperty('disabled', current === pages)
        collected.push(...await page.locator('[data-task-id]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-task-id')!)))
        if (current < pages) await click(page, 'Naslednja stran')
      }
      expect(collected).toEqual(taskIds(tasks))
      expect(new Set(collected).size).toBe(count)
      if (pages > 1) {
        await click(page, 'Prejšnja stran')
        await expectIds(page, taskIds(tasks.slice((pages - 2) * size, (pages - 1) * size)))
        if (pages > 2) await click(page, 'Prva stran')
        await expectIds(page, taskIds(tasks.slice(0, size)))
        await click(page, 'Zadnja stran')
        await expectIds(page, taskIds(tasks.slice((pages - 1) * size)))
      }
    }
    await select(page, 'Velikost strani', 'all')
    await expectDefaults(page, tasks)
  })
}

test('A02 R04–R06/R11/R12: filter precedes one shared page; counts remain project-wide', async ({ page }) => {
  const writes = await mount(page, records)
  await select(page, 'Velikost strani', '2')
  await click(page, 'Naslednja stran')
  await select(page, 'Velikost strani', '5')
  await expectIds(page, taskIds(records.slice(0, 5)))
  for (const filter of ['todo', 'in_progress', 'done', 'all']) {
    await click(page, 'Naslednja stran')
    await select(page, 'Filter strani', filter)
    const filtered = records.filter(task => filter === 'all' || task.status === filter)
    await expectIds(page, taskIds(filtered.slice(0, 5)))
    await expect(status(page)).toHaveText(`Stran 1 od ${Math.ceil(filtered.length / 5)}. Prikazano 1–5 od ${filtered.length}.`)
    await click(page, 'Zadnja stran')
    const last = filtered.slice(Math.floor((filtered.length - 1) / 5) * 5)
    await expectIds(page, taskIds(last))
    await board(page)
    await expectIds(page, taskIds(last), false)
    for (let index = 0; index < statuses.length; index++) {
      const expected = last.filter(task => task.status === statuses[index])
      await columnIds(page, labels[index], taskIds(expected))
      await expect(page.getByRole('region', { name: labels[index], exact: true }).locator('.column-count')).toHaveText(String(expected.length))
    }
    await summary(page, [8, 8, 7])
    await expect(page.locator('.count-badge')).toHaveText('23')
    await expect(page.locator('.table-footer')).toContainText('7 / 23 končanih')
    await table(page)
    await expectIds(page, taskIds(last))
    await click(page, 'Prva stran')
  }
  await readonly(page, writes)
})

test('A03 R07–R08/R12: details retain state; project changes and reload reset it', async ({ page }) => {
  const writes = await mount(page, records)
  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'in_progress')
  await click(page, 'Naslednja stran')
  const expected = records.filter(task => task.status === 'in_progress').slice(2, 4)
  for (const view of ['board', 'table']) {
    if (view === 'board') await board(page)
    else await table(page)
    for (const close of ['button', 'escape', 'back']) {
      const link = page.locator('[data-task-id]').first().getByRole('link')
      await link.click()
      await expect(page.getByRole('dialog').getByRole('heading', { name: expected[0].title, exact: true })).toBeVisible()
      await expect(page.getByRole('dialog').getByText(expected[0].description, { exact: true })).toBeVisible()
      if (close === 'button') await click(page, 'Zapri podrobnosti')
      else if (close === 'escape') await page.keyboard.press('Escape')
      else await page.goBack()
      await expect(page.getByRole('dialog')).toHaveCount(0)
      await expect(link).toBeFocused()
      await expectIds(page, taskIds(expected))
      await expect(status(page)).toHaveText('Stran 2 od 4. Prikazano 3–4 od 8.')
      await expect(page.getByRole('combobox', { name: 'Velikost strani' })).toHaveValue('2')
      await expect(page.getByRole('combobox', { name: 'Filter strani' })).toHaveValue('in_progress')
    }
  }
  await board(page)
  await project(page, 'launch')
  await expectDefaults(page, [])
  await project(page, 'web')
  await expectDefaults(page, records)
  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'done')
  await click(page, 'Naslednja stran')
  await expect(page).toHaveURL(/#\/projects\/web\?view=board$/)
  await page.reload()
  await expectDefaults(page, records)
  await expect(page.getByRole('button', { name: 'Tabla', exact: true })).toHaveAttribute('aria-pressed', 'true')
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 })
  await readonly(page, writes)
})

for (const emptyProject of [true, false]) {
  test(`A04 R10: ${emptyProject ? 'empty project' : 'empty filter'} keeps controls in both views`, async ({ page }) => {
    const tasks = emptyProject ? [] : records.filter(task => task.status === 'todo')
    await mount(page, tasks)
    for (const size of ['all', '2', '5', '10']) {
      await select(page, 'Velikost strani', size)
      await select(page, 'Filter strani', 'done')
      for (const view of ['table', 'board']) {
        if (view === 'table') await table(page)
        else await board(page)
        await expectIds(page, [])
        await expect(status(page)).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
        for (const name of moves) {
          const button = page.getByRole('button', { name, exact: true })
          await expect(button).toBeDisabled()
          await button.evaluate(element => (element as HTMLButtonElement).click())
        }
        await expect(status(page)).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
      }
      await select(page, 'Filter strani', 'all')
      await table(page)
      const length = size === 'all' ? tasks.length : Math.min(Number(size), tasks.length)
      await expectIds(page, taskIds(tasks.slice(0, length)))
      await expect(status(page)).toContainText(emptyProject ? 'Stran 0 od 0.' : 'Stran 1 od')
    }
  })
}

for (const width of [1440, 390]) {
  test(`A05 R06/R12: layout and visual artifacts at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 960 })
    const writes = await mount(page, records)
    await select(page, 'Velikost strani', '5')
    await click(page, 'Naslednja stran')
    for (const view of ['table', 'board']) {
      if (view === 'board') await board(page)
      await readonly(page, writes)
      await expectIds(page, taskIds(records.slice(5, 10)), view === 'table')
      await expect(status(page)).toHaveText('Stran 2 od 5. Prikazano 6–10 od 23.')
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.screenshot({ path: testInfo.outputPath(`${view}-${width}.png`), fullPage: true })
    }
  })
}
