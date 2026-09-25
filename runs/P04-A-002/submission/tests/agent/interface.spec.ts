import type { Page } from '@playwright/test'
import {
  test, expect, mount, makeTask, expectIds, select, board, table, columnIds,
  project, summary, readonly, type Task,
} from '../development/helpers.ts'

const records: Task[] = Array.from({ length: 13 }, (_, i) => makeTask(i === 12 ? 'opravilo/č?x=12' : `nov-${i}`, {
  title: ['Čas', 'CAS', 'Žaba'][i % 3],
  status: (['todo', 'in_progress', 'done'] as const)[i % 3],
  assignee: ['Živa', 'Ana', 'Črt'][i % 3],
  dueDate: `2024-02-0${i % 4 + 1}`,
  description: `<b>Opis & "citat" ${i}</b>\nčšž`,
}))
const original = records.map(({ id }) => id)
const sorted = [11, 2, 5, 8, 3, 7, 6, 10, 1, 9, 0, 4, 12].map(i => records[i].id)
const names = ['Primarni ključ', 'Primarna smer', 'Sekundarni ključ', 'Sekundarna smer']
const defaults = ['original', 'asc', 'none', 'asc']
const changed = ['title', 'desc', 'dueDate', 'desc']

async function settings(page: Page, values: string[]) {
  for (let i = 0; i < names.length; i++) await select(page, names[i], values[i])
}

async function expectSettings(page: Page, values: string[]) {
  for (let i = 0; i < names.length; i++) await expect(page.getByRole('combobox', { name: names[i], exact: true })).toHaveValue(values[i])
}

async function expectColumns(page: Page, expected: string[]) {
  const labels = ['Pripravljeno', 'V delu', 'Končano']
  await expect(page.locator('.board-column h3')).toHaveText(labels)
  for (let i = 0; i < labels.length; i++) {
    const status = (['todo', 'in_progress', 'done'] as const)[i]
    await columnIds(page, labels[i], expected.filter(id => records.find(task => task.id === id)!.status === status))
  }
  await expectIds(page, original, false)
}

for (const width of [1440, 390]) {
  test(`A07: ${width}px stable views, all IDs, details, preserved fields and accessible controls`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 })
    const writes = await mount(page, records)
    await expectSettings(page, defaults)
    await expectIds(page, original)
    await summary(page, [5, 4, 4])
    const fields = await page.locator('[data-task-id]').evaluateAll(nodes => Object.fromEntries(nodes.map(node => [node.getAttribute('data-task-id'), node.textContent])))
    const url = page.url()
    await settings(page, changed)
    await expectIds(page, sorted)
    expect(page.url()).toBe(url)
    await expectSettings(page, changed)
    expect(await page.locator('[data-task-id]').evaluateAll(nodes => Object.fromEntries(nodes.map(node => [node.getAttribute('data-task-id'), node.textContent])))).toEqual(fields)
    await summary(page, [5, 4, 4])
    await expect(page.locator('.table-footer')).toContainText('4 / 13 končanih')

    for (const view of ['table', 'board']) {
      if (view === 'board') await board(page)
      await expectSettings(page, changed)
      if (view === 'board') await expectColumns(page, sorted)
      for (let i = 0; i < records.length; i++) {
        const record = records[i]
        const link = page.locator(`[data-task-id="${record.id}"]`).getByRole('link')
        await link.focus()
        await page.keyboard.press('Enter')
        const dialog = page.getByRole('dialog')
        await expect(dialog.getByRole('heading', { name: record.title, exact: true })).toBeVisible()
        await expect(dialog.locator('.description p')).toHaveText(record.description)
        await expect(dialog.locator('.detail-properties .task-id')).toHaveText(record.id)
        await expect(dialog.locator('time')).toHaveAttribute('datetime', record.dueDate)
        await expect(dialog.locator('.description b')).toHaveCount(0)
        if (i % 2) await dialog.getByRole('button', { name: 'Zapri podrobnosti' }).click()
        else await page.keyboard.press('Escape')
        await expect(dialog).toHaveCount(0)
        await expect(link).toBeFocused()
      }
      await expectSettings(page, changed)
      await readonly(page, writes)
    }
    await expectColumns(page, sorted)
    await page.getByRole('button', { name: 'Tabla', exact: true }).scrollIntoViewIfNeeded()
    await page.screenshot({ path: `docs/agent/board-${width}.png`, fullPage: true })
    await table(page)
    await expectIds(page, sorted)
    for (const name of names) {
      const control = page.getByRole('combobox', { name, exact: true })
      const bounds = await control.boundingBox()
      expect(bounds!.x).toBeGreaterThanOrEqual(0)
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width)
      await control.focus()
      await expect(control).toBeFocused()
    }
    await page.screenshot({ path: `docs/agent/table-${width}.png`, fullPage: true })
    await readonly(page, writes)
  })
}

test('A08: reset, original override, project changes, browser history and refresh reset all settings', async ({ page }) => {
  const writes = await mount(page, [...records, makeTask('drugi', { projectId: 'launch' })])
  await settings(page, changed)
  await expectIds(page, sorted)
  await select(page, 'Primarni ključ', 'original')
  await expectIds(page, original)
  await expectSettings(page, ['original', 'desc', 'dueDate', 'desc'])
  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, sorted)
  await board(page)
  await page.getByRole('button', { name: 'Izvorni vrstni red', exact: true }).click()
  await expectSettings(page, defaults)
  await expectColumns(page, original)

  await settings(page, changed)
  await project(page, 'launch')
  await expectSettings(page, defaults)
  await expectIds(page, ['drugi'])
  await settings(page, changed)
  await project(page, 'web')
  await expectSettings(page, defaults)
  await expectColumns(page, original)
  await settings(page, changed)
  await page.goBack()
  await expectSettings(page, defaults)
  await expectIds(page, ['drugi'])
  await project(page, 'web')
  await settings(page, changed)
  await page.reload()
  await expectSettings(page, defaults)
  await expectColumns(page, original)
  await table(page)
  await settings(page, changed)
  await page.reload()
  await expectSettings(page, defaults)
  await expectIds(page, original)
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 })
  await readonly(page, writes)
})

for (const count of [0, 1]) {
  test(`A09: ${count} task project supports every key and direction in both views`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const entries = records.slice(0, count)
    const writes = await mount(page, entries)
    const primaryKeys = ['original', 'title', 'assignee', 'status', 'dueDate']
    const secondaryKeys = ['none', 'title', 'assignee', 'status', 'dueDate']
    for (const view of ['table', 'board']) {
      if (view === 'board') await board(page)
      for (let i = 0; i < primaryKeys.length; i++) {
        for (const direction of ['asc', 'desc']) {
          await settings(page, [primaryKeys[i], direction, secondaryKeys[i], direction])
          await expectIds(page, entries.map(({ id }) => id))
          await summary(page, [count, 0, 0])
          if (count === 0 && view === 'table') await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
          if (view === 'board') await expect(page.locator('.board-column')).toHaveCount(3)
        }
      }
    }
    await page.getByRole('button', { name: 'Izvorni vrstni red', exact: true }).click()
    await expectSettings(page, defaults)
    await readonly(page, writes)
  })
}
