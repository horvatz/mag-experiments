import { board, details, expectIds, makeTask, mount, readonly, select } from '../development/helpers.ts'
import { addDays, getDeadlineGroup, isValidDate } from '../../src/deadlines.ts'
import { expect, test } from '@playwright/test'

test('A01: čista koledarska aritmetika in klasifikacija', () => {
  expect(addDays('2024-02-27', 2)).toBe('2024-02-29')
  expect(addDays('2024-02-27', 3)).toBe('2024-03-01')
  expect(addDays('2023-12-30', 2)).toBe('2024-01-01')
  expect(isValidDate('2026-02-30')).toBe(false)
  const referenceDate = '2026-09-21'
  expect(getDeadlineGroup(makeTask('done-old', { status: 'done', dueDate: '2026-09-01' }), referenceDate)).toBe('done')
  expect(getDeadlineGroup(makeTask('overdue', { dueDate: '2026-09-20' }), referenceDate)).toBe('overdue')
  expect(getDeadlineGroup(makeTask('today', { dueDate: '2026-09-21' }), referenceDate)).toBe('today')
  expect(getDeadlineGroup(makeTask('week-start', { dueDate: '2026-09-22' }), referenceDate)).toBe('week')
  expect(getDeadlineGroup(makeTask('week-end', { dueDate: '2026-09-28' }), referenceDate)).toBe('week')
  expect(getDeadlineGroup(makeTask('later', { dueDate: '2026-09-29' }), referenceDate)).toBe('later')
})

test('A02: začetne vrednosti, števci, filter in preklop pogleda', async ({ page }) => {
  await mount(page)
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(page.getByLabel('Pogled rokov', { exact: true })).toHaveValue('all')
  const expectedCounts: Record<string, string> = { overdue: '2', today: '1', week: '1', later: '2', done: '2' }
  for (const [key, value] of Object.entries(expectedCounts)) await expect(page.getByLabel(`Število rokov ${key}`, { exact: true })).toHaveText(value)
  await select(page, 'Pogled rokov', 'today')
  await expectIds(page, ['web-02'])
  for (const [key, value] of Object.entries(expectedCounts)) await expect(page.getByLabel(`Število rokov ${key}`, { exact: true })).toHaveText(value)
  await board(page)
  await expectIds(page, ['web-02'])
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(page.getByLabel('Pogled rokov', { exact: true })).toHaveValue('today')
})

test('A03: prazen osnutek ohrani zadnji veljavni izračun', async ({ page }) => {
  await mount(page)
  await select(page, 'Pogled rokov', 'overdue')
  await page.getByLabel('Referenčni datum', { exact: true }).fill('')
  await expect(page.getByRole('alert')).toContainText('Vnesi veljaven referenčni datum.')
  await expectIds(page, ['web-01', 'web-07'])
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2026-09-20')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.getByLabel('Pogled rokov', { exact: true })).toHaveValue('overdue')
  await expectIds(page, ['web-01'])
})

test('A04: menjava projekta ponastavi lokalno stanje', async ({ page }) => {
  await mount(page)
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2026-09-25')
  await select(page, 'Pogled rokov', 'week')
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Jesenska kampanja', exact: true })).toBeAttached()
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(page.getByLabel('Pogled rokov', { exact: true })).toHaveValue('all')
  expect(await page.evaluate(() => window.location.hash)).not.toContain('deadline')
})

test('A05: prazen projekt in prazna izbrana skupina', async ({ page }) => {
  await mount(page, [])
  for (const key of ['overdue', 'today', 'week', 'later', 'done']) await expect(page.getByLabel(`Število rokov ${key}`, { exact: true })).toHaveText('0')
  await page.unroute('**/api/**')
  await mount(page, [makeTask('only', { dueDate: '2026-09-21' })])
  await select(page, 'Pogled rokov', 'later')
  await expect(page.getByText('Ni opravil v izbrani skupini.', { exact: true })).toBeVisible()
  await select(page, 'Pogled rokov', 'all')
  await expectIds(page, ['only'])
})

test('A06: bralni pregled brez zapisov in prilagodljiv Folio', async ({ page }) => {
  const writes = await mount(page)
  await select(page, 'Pogled rokov', 'done')
  await board(page)
  await details(page, 'web-03')
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByRole('region', { name: 'Tabla opravil' })).toBeVisible()
  await readonly(page, writes)
})
