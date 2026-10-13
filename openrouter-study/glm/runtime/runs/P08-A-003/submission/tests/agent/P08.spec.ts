import { expect, test } from '@playwright/test'
import { addCalendarDays, getDeadlineGroup } from '../../src/deadlines.ts'
import { board, expectIds, makeTask, mount, select, table } from '../development/helpers.ts'

test('A01: fixed reference date and inclusive calendar boundaries', () => {
  const referenceDate = '2026-09-21'
  expect(addCalendarDays('2024-02-28', 7)).toBe('2024-03-06')
  expect(addCalendarDays('2024-12-31', 1)).toBe('2025-01-01')
  expect(getDeadlineGroup(makeTask('overdue', { dueDate: '2026-09-20' }), referenceDate)).toBe('overdue')
  expect(getDeadlineGroup(makeTask('today', { dueDate: referenceDate }), referenceDate)).toBe('today')
  expect(getDeadlineGroup(makeTask('week-start', { dueDate: '2026-09-22' }), referenceDate)).toBe('week')
  expect(getDeadlineGroup(makeTask('week-end', { dueDate: '2026-09-28' }), referenceDate)).toBe('week')
  expect(getDeadlineGroup(makeTask('later', { dueDate: '2026-09-29' }), referenceDate)).toBe('later')
  expect(getDeadlineGroup(makeTask('done-old', { status: 'done', dueDate: '2026-09-20' }), referenceDate)).toBe('done')
  expect(getDeadlineGroup(makeTask('done-later', { status: 'done', dueDate: '2026-10-20' }), referenceDate)).toBe('done')
})

test('A02: counts are project-wide and filtering preserves source order', async ({ page }) => {
  const writes = await mount(page)
  const referenceDate = page.getByLabel('Referenčni datum', { exact: true })
  const deadlineView = page.getByRole('combobox', { name: 'Pogled rokov', exact: true })

  await expect(referenceDate).toHaveValue('2026-09-21')
  await expect(deadlineView).toHaveValue('all')
  for (const [group, count] of [['overdue', '2'], ['today', '0'], ['week', '2'], ['later', '2'], ['done', '2']] as const) {
    await expect(page.getByLabel(`Število rokov ${group}`, { exact: true })).toHaveText(count)
  }

  await select(page, 'Pogled rokov', 'later')
  await expectIds(page, ['web-05', 'web-08'])
  for (const group of ['overdue', 'today', 'week', 'later', 'done']) {
    await expect(page.getByLabel(`Število rokov ${group}`, { exact: true })).toBeVisible()
  }

  await page.getByLabel('Referenčni datum', { exact: true }).fill('2026-09-23')
  await expect(referenceDate).toHaveValue('2026-09-23')
  await expectIds(page, ['web-08'])

  await board(page)
  await expectIds(page, ['web-08'])
  await table(page)
  await expectIds(page, ['web-08'])
  await expect(referenceDate).toHaveValue('2026-09-23')
  await expect(deadlineView).toHaveValue('later')

  const state = await (await page.request.get('/__test/state')).json() as { saveRequests: number }
  expect(state.saveRequests).toBe(0)
  expect(writes).toEqual([])
})

test('A03: empty draft retains the last valid calculation and active group', async ({ page }) => {
  await mount(page)
  await select(page, 'Pogled rokov', 'overdue')
  await page.getByLabel('Referenčni datum', { exact: true }).fill('')
  await expect(page.getByRole('alert')).toHaveText('Vnesi veljaven referenčni datum.')
  await expectIds(page, ['web-01', 'web-07'])
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2026-09-20')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expectIds(page, ['web-01'])
})

test('A04: project switch and refresh reset local deadline state', async ({ page }) => {
  await mount(page)
  await select(page, 'Pogled rokov', 'week')
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2026-09-25')
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja' }).click()
  await expect(page.getByRole('heading', { name: 'Jesenska kampanja', exact: true })).toBeVisible()
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov', exact: true })).toHaveValue('all')

  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Spletna prenova' }).click()
  await select(page, 'Pogled rokov', 'done')
  await page.reload()
  await expect(page.getByRole('table')).toBeVisible()
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov', exact: true })).toHaveValue('all')
  expect(await page.evaluate(() => window.localStorage.length)).toBe(0)
  expect(page.url()).not.toMatch(/deadline|reference/)
})

test("A05: empty project remains usable", async ({ page }) => {
  await mount(page, [], "#/projects/web")
  for (const group of ["overdue", "today", "week", "later", "done"]) {
    await expect(page.getByLabel(`Število rokov ${group}`, { exact: true })).toHaveText("0")
  }
  await select(page, "Pogled rokov", "all")
  await expect(page.getByRole("heading", { name: "V tem projektu še ni opravil" })).toBeVisible()
})

test("A06: an empty selected group remains switchable", async ({ page }) => {
  await mount(page, [makeTask("web-only", { dueDate: "2026-09-21" })], "#/projects/web")
  await select(page, "Pogled rokov", "later")
  await expect(page.getByRole("heading", { name: "Ni opravil v izbrani skupini.", exact: true })).toBeVisible()
  await select(page, "Pogled rokov", "all")
  await expectIds(page, ["web-only"])
})

test('A7: mobile layout does not expand the page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mount(page)
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Pogled rokov', exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
}
)
