import { test, expect, mount, makeTask, select, expectIds, board, table, columnIds, project, summary, readonly } from '../development/helpers.ts'
import type { Page } from '@playwright/test'

async function controls(page: Page, values = ['original', 'asc', 'none', 'asc']) {
  for (const [index, label] of ['Primarni ključ', 'Primarna smer', 'Sekundarni ključ', 'Sekundarna smer'].entries()) {
    await expect(page.getByRole('combobox', { name: label, exact: true })).toHaveValue(values[index])
  }
}

test('S03/S04/S06: shared projection, duplicate titles, state lifecycle and no writes at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const records = Array.from({ length: 14 }, (_, index) => makeTask(`custom-${14 - index}`, {
    title: 'Enak naslov čšž', description: `Opis ${index}: <besedilo> & "citat"`,
    assignee: index % 2 ? 'Živa' : 'Ana', status: index % 3 === 0 ? 'todo' : index % 3 === 1 ? 'in_progress' : 'done',
    dueDate: `2026-09-${String(index + 1).padStart(2, '0')}`,
  }))
  const writes = await mount(page, records)
  const original = records.map(task => task.id)
  await controls(page)
  await expectIds(page, original)
  await summary(page, [5, 5, 4])
  const initialUrl = page.url()
  const initialStorage = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }))
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  const sorted = [...records].reverse()
  await expectIds(page, sorted.map(task => task.id))
  expect(page.url()).toBe(initialUrl)
  expect(await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }))).toEqual(initialStorage)
  await summary(page, [5, 5, 4])
  for (const view of ['table', 'board'] as const) {
    if (view === 'board') await board(page)
    await controls(page, ['title', 'desc', 'dueDate', 'desc'])
    for (const target of [records[0], records[13]]) {
      await page.locator(`[data-task-id="${target.id}"]`).getByRole('link').click()
      await expect(page.getByRole('dialog').getByText(target.description, { exact: true })).toBeVisible()
      await expect(page.getByRole('dialog').getByText(target.id, { exact: true }).first()).toBeVisible()
      if (target === records[0]) await page.getByRole('button', { name: 'Zapri podrobnosti' }).click()
      else await page.keyboard.press('Escape')
      await expect(page.getByRole('dialog')).toHaveCount(0)
      await controls(page, ['title', 'desc', 'dueDate', 'desc'])
    }
    await readonly(page, writes)
  }
  for (const [status, label] of [['todo', 'Pripravljeno'], ['in_progress', 'V delu'], ['done', 'Končano']]) {
    await columnIds(page, label, sorted.filter(task => task.status === status).map(task => task.id))
  }
  await expect(page.locator('.board-column h3')).toHaveText(['Pripravljeno', 'V delu', 'Končano'])
  await table(page)
  await expectIds(page, sorted.map(task => task.id))
  await page.getByRole('button', { name: 'Izvorni vrstni red', exact: true }).click()
  await controls(page)
  await expectIds(page, original)
  for (const mode of ['table', 'board'] as const) {
    if (mode === 'board') await board(page)
    await select(page, 'Primarni ključ', 'assignee')
    await select(page, 'Primarna smer', 'desc')
    await select(page, 'Sekundarni ključ', 'dueDate')
    await select(page, 'Sekundarna smer', 'desc')
    await page.reload()
    await controls(page)
    await expect(page.getByRole('button', { name: mode === 'board' ? 'Tabla' : 'Preglednica', exact: true })).toHaveAttribute('aria-pressed', 'true')
  }
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await project(page, 'launch')
  await controls(page)
  await expectIds(page, [])
  await project(page, 'web')
  await controls(page)
  await table(page)
  await expectIds(page, original)
  await readonly(page, writes)
})

for (const count of [0, 1]) {
  test(`S05: controls remain usable with ${count} tasks in table and board`, async ({ page }) => {
    const records = count ? [makeTask('only-one', { title: 'Čas & <naslov>' })] : []
    const writes = await mount(page, records)
    for (const mode of ['table', 'board'] as const) {
      if (mode === 'board') await board(page)
      for (const key of ['original', 'title', 'assignee', 'status', 'dueDate']) {
        await select(page, 'Primarni ključ', key)
        await select(page, 'Sekundarni ključ', key === 'original' ? 'none' : key)
        for (const direction of ['asc', 'desc']) {
          await select(page, 'Primarna smer', direction)
          await select(page, 'Sekundarna smer', direction)
          await expectIds(page, records.map(task => task.id))
        }
      }
    }
    await page.getByRole('button', { name: 'Izvorni vrstni red', exact: true }).click()
    await controls(page)
    await readonly(page, writes)
  })
}
