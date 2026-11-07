import type { Page } from '@playwright/test'
import { test, expect, mount, expectIds, ids, select, click, board, table, readonly, makeTask, summary, columnIds, details, project } from '../development/helpers.ts'

const nav = {
  first: 'Prva stran',
  previous: 'Prejšnja stran',
  next: 'Naslednja stran',
  last: 'Zadnja stran',
}

async function expectNav(page: Page, names: string[], disabled: boolean) {
  for (const name of names) {
    const button = page.getByRole('button', { name, exact: true })
    if (disabled) await expect(button).toBeDisabled()
    else await expect(button).toBeEnabled()
  }
}

const status = (page: Page) => page.getByRole('status', { name: 'Stanje straničenja' })

test('agent V3: default all/all first page and exact status', async ({ page }) => {
  const writes = await mount(page)
  await expectIds(page, ['web-01', 'web-02', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
  await expect(page.getByRole('combobox', { name: 'Velikost strani', exact: true })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter strani', exact: true })).toHaveValue('all')
  await expect(status(page)).toHaveText('Stran 1 od 1. Prikazano 1–8 od 8.')
  for (const name of Object.values(nav)) await expect(page.getByRole('button', { name, exact: true })).toBeDisabled()
  await page.getByRole('button', { name: nav.first, exact: true }).click({ force: true })
  await expectIds(page, ['web-01', 'web-02', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
  await readonly(page, writes)
})

test('agent V4: size 2 pages cover F in order without loss or duplicates', async ({ page }) => {
  await mount(page)
  await select(page, 'Velikost strani', '2')
  await expect(status(page)).toHaveText('Stran 1 od 4. Prikazano 1–2 od 8.')
  const seen = [...await ids(page)]
  for (const [index, text] of ['Stran 2 od 4. Prikazano 3–4 od 8.', 'Stran 3 od 4. Prikazano 5–6 od 8.', 'Stran 4 od 4. Prikazano 7–8 od 8.'].entries()) {
    await click(page, nav.next)
    await expect(status(page)).toHaveText(text)
    seen.push(...await ids(page))
    if (index === 0) await expectNav(page, [nav.next, nav.last], false)
  }
  await expectNav(page, [nav.next, nav.last], true)
  await expectNav(page, [nav.first, nav.previous], false)
  expect(seen).toEqual(['web-01', 'web-02', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
  expect(new Set(seen).size).toBe(8)
  await click(page, nav.first)
  await expectIds(page, ['web-01', 'web-02'])
  await click(page, nav.last)
  await expectIds(page, ['web-07', 'web-08'])
  await click(page, nav.previous)
  await expectIds(page, ['web-05', 'web-06'])
})

test('agent V5: size change returns to first page and all is one page', async ({ page }) => {
  await mount(page)
  await select(page, 'Velikost strani', '2')
  await click(page, nav.last)
  await expectIds(page, ['web-07', 'web-08'])
  await select(page, 'Velikost strani', '5')
  await expectIds(page, ['web-01', 'web-02', 'web-03', 'web-04', 'web-05'])
  await expect(status(page)).toHaveText('Stran 1 od 2. Prikazano 1–5 od 8.')
  await select(page, 'Velikost strani', 'all')
  await expect(status(page)).toHaveText('Stran 1 od 1. Prikazano 1–8 od 8.')
  await expectIds(page, ['web-01', 'web-02', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
})

test('agent V6: filter applies before pagination and both views show the same page', async ({ page }) => {
  await mount(page)
  await select(page, 'Velikost strani', '5')
  await click(page, nav.last)
  await expectIds(page, ['web-06', 'web-07', 'web-08'])
  await select(page, 'Filter strani', 'todo')
  await expectIds(page, ['web-02', 'web-04', 'web-07', 'web-08'])
  await expect(status(page)).toHaveText('Stran 1 od 1. Prikazano 1–4 od 4.')
  await select(page, 'Velikost strani', '2')
  await expectIds(page, ['web-02', 'web-04'])
  await expect(status(page)).toHaveText('Stran 1 od 2. Prikazano 1–2 od 4.')
  await board(page)
  await expectIds(page, ['web-02', 'web-04'])
  await expect(status(page)).toHaveText('Stran 1 od 2. Prikazano 1–2 od 4.')
  await click(page, nav.next)
  await expectIds(page, ['web-07', 'web-08'])
  await table(page)
  await expectIds(page, ['web-07', 'web-08'])
})

test('agent V7: view switch and details keep page, size and filter', async ({ page }) => {
  await mount(page)
  await select(page, 'Velikost strani', '2')
  await click(page, nav.next)
  await expectIds(page, ['web-03', 'web-04'])
  await board(page)
  await columnIds(page, 'Pripravljeno', ['web-04'])
  await columnIds(page, 'Končano', ['web-03'])
  await expect(status(page)).toHaveText('Stran 2 od 4. Prikazano 3–4 od 8.')
  await details(page, 'web-03')
  await expect(status(page)).toHaveText('Stran 2 od 4. Prikazano 3–4 od 8.')
  await columnIds(page, 'Pripravljeno', ['web-04'])
  await columnIds(page, 'Končano', ['web-03'])
  await table(page)
  await expect(status(page)).toHaveText('Stran 2 od 4. Prikazano 3–4 od 8.')
  await expectIds(page, ['web-03', 'web-04'])
  await expect(page.getByRole('combobox', { name: 'Velikost strani', exact: true })).toHaveValue('2')
})

test('agent V8: project change and refresh reset size, filter and page', async ({ page }) => {
  await mount(page)
  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'done')
  await project(page, 'launch')
  await expectIds(page, ['launch-01', 'launch-02'])
  await expect(page.getByRole('combobox', { name: 'Velikost strani', exact: true })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter strani', exact: true })).toHaveValue('all')
  await expect(status(page)).toHaveText('Stran 1 od 1. Prikazano 1–2 od 2.')
  await project(page, 'web')
  await select(page, 'Velikost strani', '2')
  await click(page, nav.next)
  await expectIds(page, ['web-03', 'web-04'])
  await page.reload()
  await expectIds(page, ['web-01', 'web-02', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
  await expect(page.getByRole('combobox', { name: 'Velikost strani', exact: true })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter strani', exact: true })).toHaveValue('all')
  await expect(status(page)).toHaveText('Stran 1 od 1. Prikazano 1–8 od 8.')
})

test('agent V9: empty result and empty project show 0 od 0 with all navigation disabled', async ({ page }) => {
  await mount(page, [makeTask('web-01', { status: 'in_progress' }), makeTask('web-02', { status: 'in_progress' })])
  await select(page, 'Filter strani', 'done')
  await expect(status(page)).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
  for (const name of Object.values(nav)) await expect(page.getByRole('button', { name, exact: true })).toBeDisabled()
  await select(page, 'Filter strani', 'all')
  await expect(status(page)).toHaveText('Stran 1 od 1. Prikazano 1–2 od 2.')
  await select(page, 'Filter strani', 'done')
  await expect(status(page)).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
})

test('agent V9b: empty project keeps zero status and disabled navigation', async ({ page }) => {
  await mount(page, [])
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
  await expect(status(page)).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
  for (const name of Object.values(nav)) await expect(page.getByRole('button', { name, exact: true })).toBeDisabled()
  await expect(page.locator('.count-badge')).toHaveText('0')
})

test('agent V4b/V12: size 10 shorter last page, single task, state stays out of URL and storage', async ({ page }) => {
  const many = Array.from({ length: 12 }, (_, index) => makeTask(`web-${String(index + 1).padStart(2, '0')}`))
  await mount(page, many)
  await select(page, 'Velikost strani', '10')
  await expectIds(page, many.slice(0, 10).map((task) => task.id))
  await expect(status(page)).toHaveText('Stran 1 od 2. Prikazano 1–10 od 12.')
  await click(page, nav.last)
  await expectIds(page, ['web-11', 'web-12'])
  await expect(status(page)).toHaveText('Stran 2 od 2. Prikazano 11–12 od 12.')
  const state = await page.evaluate(() => ({ hash: location.hash, local: Object.keys(localStorage), session: Object.keys(sessionStorage) }))
  expect(state.hash).toBe('#/projects/web')
  expect(state.local).toEqual([])
  expect(state.session).toEqual([])
})

test('agent V4c: single task has one page and disabled navigation', async ({ page }) => {
  await mount(page, [makeTask('web-01')])
  await select(page, 'Velikost strani', '10')
  await expect(status(page)).toHaveText('Stran 1 od 1. Prikazano 1–1 od 1.')
  for (const name of Object.values(nav)) await expect(page.getByRole('button', { name, exact: true })).toBeDisabled()
})

test('agent V10/V11: summary counts full project, columns count page, no writes, 390 px fits', async ({ page }) => {
  const writes = await mount(page)
  await select(page, 'Filter strani', 'done')
  await summary(page, [4, 2, 2])
  await select(page, 'Velikost strani', '2')
  await expectIds(page, ['web-03', 'web-06'])
  await board(page)
  await columnIds(page, 'Pripravljeno', [])
  await columnIds(page, 'V delu', [])
  await columnIds(page, 'Končano', ['web-03', 'web-06'])
  await expect(page.getByRole('region', { name: 'Končano', exact: true }).getByLabel('2 opravil')).toBeVisible()
  await expect(page.locator('.count-badge')).toHaveText('8')
  await summary(page, [4, 2, 2])
  await table(page)
  await expectIds(page, ['web-03', 'web-06'])
  await readonly(page, writes)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await board(page)
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await expectIds(page, ['web-03', 'web-06'])
})
