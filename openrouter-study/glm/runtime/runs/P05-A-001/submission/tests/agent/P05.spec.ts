import type { Page } from '@playwright/test'
import { expect, test, mount, expectIds, select, click, board, details, summary, readonly, type Task } from '../development/helpers.ts'
import { makeTask } from '../development/helpers.ts'

const allWebIds = ['web-01', 'web-02', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08']
const status = (page: Page) => page.getByRole('status', { name: 'Stanje straničenja' })

test('R01-R04: page sizes, edges and status ranges', async ({ page }) => {
  await mount(page)
  await expectIds(page, allWebIds)
  await expect(status(page)).toHaveText('Stran 1 od 1. Prikazano 1–8 od 8.')
  for (const name of ['Prva stran', 'Prejšnja stran', 'Naslednja stran', 'Zadnja stran']) {
    await expect(page.getByRole('button', { name, exact: true })).toBeDisabled()
  }

  await select(page, 'Velikost strani', '2')
  await expectIds(page, ['web-01', 'web-02'])
  await expect(status(page)).toHaveText('Stran 1 od 4. Prikazano 1–2 od 8.')
  await click(page, 'Naslednja stran')
  await expectIds(page, ['web-03', 'web-04'])
  await click(page, 'Zadnja stran')
  await expectIds(page, ['web-07', 'web-08'])
  await expect(status(page)).toHaveText('Stran 4 od 4. Prikazano 7–8 od 8.')
  await expect(page.getByRole('button', { name: 'Prva stran', exact: true })).toBeEnabled()
  await expect(page.getByRole('button', { name: 'Prejšnja stran', exact: true })).toBeEnabled()
  await expect(page.getByRole('button', { name: 'Naslednja stran', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Zadnja stran', exact: true })).toBeDisabled()
  await click(page, 'Prva stran')
  await expectIds(page, ['web-01', 'web-02'])

  await select(page, 'Velikost strani', '5')
  await expectIds(page, allWebIds.slice(0, 5))
  await click(page, 'Zadnja stran')
  await expectIds(page, allWebIds.slice(5))

  await select(page, 'Velikost strani', '10')
  await expectIds(page, allWebIds)
  await select(page, 'Velikost strani', '2')
  await click(page, 'Zadnja stran')
  await select(page, 'Velikost strani', '5')
  await expectIds(page, allWebIds.slice(0, 5))
})

test('R05, R06 and R11: filter before pagination and shared views', async ({ page }) => {
  await mount(page)
  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'todo')
  await expectIds(page, ['web-02', 'web-04'])
  await expect(status(page)).toHaveText('Stran 1 od 2. Prikazano 1–2 od 4.')
  await summary(page, [4, 2, 2])
  await board(page)
  await expectIds(page, ['web-02', 'web-04'])
  await expect(page.getByRole('region', { name: 'Tabla opravil' }).locator('.column-count')).toHaveText(['2', '0', '0'])

  await select(page, 'Filter strani', 'in_progress')
  await expectIds(page, ['web-01', 'web-05'])
  await select(page, 'Filter strani', 'done')
  await expectIds(page, ['web-03', 'web-06'])
  await page.getByRole('button', { name: 'Preglednica', exact: true }).click()
  await select(page, 'Filter strani', 'all')
  await expectIds(page, ['web-01', 'web-02'])
})

test('R07 and R08: state persistence in current project only', async ({ page }) => {
  await mount(page)
  await select(page, 'Velikost strani', '2')
  await click(page, 'Naslednja stran')
  await board(page)
  await expectIds(page, ['web-04', 'web-03'])
  await details(page, 'web-03')
  await expectIds(page, ['web-04', 'web-03'])

  await page.getByRole('button', { name: 'Preglednica', exact: true }).click()
  await expectIds(page, ['web-04', 'web-03'])
  await page.reload()
  await expectIds(page, allWebIds)
  await expect(page).not.toHaveURL(/page|size|filter/)

  await select(page, 'Velikost strani', '2')
  await click(page, 'Zadnja stran')
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja', exact: true }).click()
  await expectIds(page, ['launch-01', 'launch-02'])
  await expect(status(page)).toHaveText('Stran 1 od 1. Prikazano 1–2 od 2.')
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Spletna prenova', exact: true }).click()
  await expectIds(page, allWebIds)
})

test('R10: empty project and empty filter result', async ({ page }) => {
  await mount(page, [])
  await expectIds(page, [])
  await expect(status(page)).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
  for (const name of ['Prva stran', 'Prejšnja stran', 'Naslednja stran', 'Zadnja stran']) {
    await expect(page.getByRole('button', { name, exact: true })).toBeDisabled()
  }
})

test('R12: pagination is read-only and responsive', async ({ page }) => {
  const writes = await mount(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await select(page, 'Velikost strani', '5')
  await select(page, 'Filter strani', 'todo')
  await board(page)
  await details(page, 'web-08')
  await readonly(page, writes)
})

test('R10: empty filter result', async ({ page }) => {
  const records: Task[] = [
    makeTask('web-01'),
    makeTask('web-02', { status: 'in_progress' }),
  ]
  await mount(page, records)
  await select(page, 'Filter strani', 'done')
  await expectIds(page, [])
  await expect(status(page)).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
  for (const name of ['Prva stran', 'Prejšnja stran', 'Naslednja stran', 'Zadnja stran']) {
    await expect(page.getByRole('button', { name, exact: true })).toBeDisabled()
  }
  await select(page, 'Filter strani', 'all')
  await expectIds(page, ['web-01', 'web-02'])
})
