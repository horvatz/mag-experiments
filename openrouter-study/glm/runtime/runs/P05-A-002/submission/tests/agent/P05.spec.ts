import { test, expect, mount, expectIds, webIds, select, click, board, table, details, summary, readonly, project, examples } from '../development/helpers.ts'
import type { Page } from '@playwright/test'

const navigationButtons = ['Prva stran', 'Prejšnja stran', 'Naslednja stran', 'Zadnja stran']

async function expectNavigationDisabled(page: Page, names: string[]) {
  for (const name of names) await expect(page.getByRole('button', { name, exact: true })).toBeDisabled()
}

test('A01: zaporedno straničenje, filter, pogleda in podrobnosti', async ({ page }) => {
  const writes = await mount(page)
  await expectIds(page, webIds())
  await summary(page, [4, 2, 2])

  await select(page, 'Velikost strani', '2')
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 4. Prikazano 1–2 od 8.')
  await click(page, 'Naslednja stran')
  await expectIds(page, ['web-03', 'web-04'])
  await click(page, 'Zadnja stran')
  await expectIds(page, ['web-07', 'web-08'])
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 4 od 4. Prikazano 7–8 od 8.')
  await expectNavigationDisabled(page, ['Naslednja stran', 'Zadnja stran'])
  await click(page, 'Prejšnja stran')
  await expectIds(page, ['web-05', 'web-06'])
  await click(page, 'Prva stran')
  await expectIds(page, ['web-01', 'web-02'])
  await expectNavigationDisabled(page, ['Prva stran', 'Prejšnja stran'])

  await select(page, 'Velikost strani', '5')
  await expectIds(page, webIds().slice(0, 5))
  await click(page, 'Zadnja stran')
  await expectIds(page, webIds().slice(5))

  await select(page, 'Velikost strani', '10')
  await expectIds(page, webIds())
  await select(page, 'Velikost strani', 'all')
  await expectIds(page, webIds())
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 1. Prikazano 1–8 od 8.')

  await select(page, 'Filter strani', 'todo')
  await expectIds(page, ['web-02', 'web-04', 'web-07', 'web-08'])
  await select(page, 'Velikost strani', '2')
  await expectIds(page, ['web-02', 'web-04'])
  await click(page, 'Naslednja stran')
  await expectIds(page, ['web-07', 'web-08'])
  await summary(page, [4, 2, 2])

  await board(page)
  await expectIds(page, ['web-07', 'web-08'])
  await expect(page.locator('.board-todo .column-count')).toHaveText('2')
  await expect(page.locator('.board-done .column-count')).toHaveText('0')
  await details(page, 'web-07')
  await expectIds(page, ['web-07', 'web-08'])

  await table(page)
  await expectIds(page, ['web-07', 'web-08'])
  await select(page, 'Filter strani', 'all')
  await expectIds(page, ['web-01', 'web-02'])
  await page.setViewportSize({ width: 390, height: 844 })
  await readonly(page, writes)
})

test('A02: prazen filter ima stran 0 in ponastavitev na prvo', async ({ page }) => {
  const records = examples.map((task) => task.status === 'done' ? { ...task, status: 'todo' as const } : task)
  const writes = await mount(page, records)
  await select(page, 'Filter strani', 'done')
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
  await expectNavigationDisabled(page, navigationButtons)
  await expect(page.locator('[data-task-id]')).toHaveCount(0)
  await select(page, 'Filter strani', 'all')
  await expectIds(page, records.filter((task) => task.projectId === 'web').map((task) => task.id))
  await readonly(page, writes)
})

test('A03: prazen projekt in ponastavitev po osvežitvi', async ({ page }) => {
  const writes = await mount(page, [], '#/projects/web')
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
  await expectNavigationDisabled(page, navigationButtons)
  await expect(page.locator('[data-task-id]')).toHaveCount(0)
  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'done')
  await page.reload()
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
  await expect(page.getByRole('combobox', { name: 'Velikost strani' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter strani' })).toHaveValue('all')
  await expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([])
  await expect(new URL(page.url()).hash).toBe('#/projects/web')
  await readonly(page, writes)
})

test('A04: menjava projekta ponastavi straničenje', async ({ page }) => {
  await mount(page)
  await select(page, 'Velikost strani', '2')
  await click(page, 'Zadnja stran')
  await select(page, 'Filter strani', 'todo')
  await project(page, 'launch')
  await expectIds(page, ['launch-01', 'launch-02'])
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 1. Prikazano 1–2 od 2.')
  await expect(page.getByRole('combobox', { name: 'Velikost strani' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter strani' })).toHaveValue('all')
  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'done')
  await expectIds(page, ['launch-02'])
  await page.reload()
  await expectIds(page, ['launch-01', 'launch-02'])
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 1. Prikazano 1–2 od 2.')
  await expect(page.getByRole('combobox', { name: 'Velikost strani' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter strani' })).toHaveValue('all')
})
