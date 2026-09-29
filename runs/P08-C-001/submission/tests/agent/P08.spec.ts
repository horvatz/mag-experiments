import type { Page } from '@playwright/test'
import { test, expect, mount, makeTask, examples, select, expectIds, board, table, project, details, readonly } from '../development/helpers.ts'

const keys = ['overdue', 'today', 'week', 'later', 'done'] as const
const dateField = (page: Page) => page.getByLabel('Referenčni datum', { exact: true })
const filterField = (page: Page) => page.getByRole('combobox', { name: 'Pogled rokov', exact: true })
async function counts(page: Page, values: number[]) {
  for (const [index, key] of keys.entries()) {
    await expect(page.getByLabel(`Število rokov ${key}`, { exact: true })).toHaveText(String(values[index]))
  }
}

test('A01: fixed date, complete partition, stable order and shared view IDs', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2040-01-15T23:30:00Z'))
  const records = [
    makeTask('z8', { status: 'in_progress', dueDate: '2026-09-29' }),
    makeTask('n0', { dueDate: '2026-09-21' }),
    makeTask('d-old', { status: 'done', dueDate: '2026-09-10' }),
    makeTask('z7', { status: 'in_progress', dueDate: '2026-09-28' }),
    makeTask('past', { dueDate: '2026-09-20' }),
    makeTask('n1', { dueDate: '2026-09-22' }),
    makeTask('d-now', { status: 'done', dueDate: '2026-09-21' }),
    makeTask('far', { dueDate: '2026-10-01' }),
    makeTask('past2', { status: 'in_progress', dueDate: '2026-09-19' }),
    makeTask('d-future', { status: 'done', dueDate: '2027-01-01' }),
    makeTask('n0b', { status: 'in_progress', dueDate: '2026-09-21' }),
    makeTask('n3', { dueDate: '2026-09-24' }),
    makeTask('far2', { dueDate: '2026-09-30' }),
  ].map(task => ({ ...task, title: 'Enak naslov — čšž, "zapis"' }))
  const writes = await mount(page, records)
  await expect(dateField(page)).toHaveValue('2026-09-21')
  await expect(filterField(page)).toHaveValue('all')
  expect(await filterField(page).locator('option').evaluateAll(nodes => nodes.map(node => (node as HTMLOptionElement).value))).toEqual(['all', ...keys])
  const expected = {
    all: records.map(task => task.id), overdue: ['past', 'past2'], today: ['n0', 'n0b'],
    week: ['z7', 'n1', 'n3'], later: ['z8', 'far', 'far2'], done: ['d-old', 'd-now', 'd-future'],
  }
  for (const [group, ids] of Object.entries(expected)) {
    await select(page, 'Pogled rokov', group)
    await expectIds(page, ids)
    await counts(page, [2, 2, 3, 3, 3])
    await board(page)
    await expectIds(page, ids, false)
    await counts(page, [2, 2, 3, 3, 3])
    await table(page)
    await expectIds(page, ids)
  }
  await select(page, 'Pogled rokov', 'all')
  expect(await page.locator('tbody time').evaluateAll(nodes => nodes.map(node => node.getAttribute('datetime')))).toEqual(records.map(task => task.dueDate))
  await details(page, 'n0')
  await readonly(page, writes)
})

for (const timezoneId of ['Europe/Ljubljana', 'America/Los_Angeles', 'Pacific/Kiritimati']) {
  test.describe(timezoneId, () => {
    test.use({ timezoneId })
    test('A02: calendar boundaries including leap February and DST', async ({ page }) => {
      const cases = [
        { anchor: '2024-02-25', dates: ['2024-02-24', '2024-02-25', '2024-02-29', '2024-03-03', '2024-03-04'] },
        { anchor: '2026-12-28', dates: ['2026-12-27', '2026-12-28', '2026-12-29', '2027-01-04', '2027-01-05'] },
        { anchor: '2026-03-25', dates: ['2026-03-24', '2026-03-25', '2026-03-26', '2026-04-01', '2026-04-02'] },
        { anchor: '2026-10-23', dates: ['2026-10-22', '2026-10-23', '2026-10-24', '2026-10-30', '2026-10-31'] },
      ]
      const records = cases.flatMap(({ dates }, index) => dates.map((dueDate, position) => makeTask(`c${index}-${position}`, { dueDate })))
      await mount(page, records)
      for (const [index, { anchor }] of cases.entries()) {
        await dateField(page).fill(anchor)
        await select(page, 'Pogled rokov', 'today')
        await expectIds(page, [`c${index}-1`])
        await select(page, 'Pogled rokov', 'week')
        await expectIds(page, [`c${index}-2`, `c${index}-3`])
        await expect(page.getByLabel('Število rokov week', { exact: true })).toHaveText('2')
      }
    })
  })
}

test('A03: draft date, valid recalculation, view preservation and project resets', async ({ page }) => {
  const writes = await mount(page)
  await select(page, 'Pogled rokov', 'overdue')
  await dateField(page).fill('2026-09-20')
  await expectIds(page, ['web-01'])
  await counts(page, [1, 1, 1, 3, 2])
  await dateField(page).fill('')
  await expect(page.getByRole('alert')).toHaveText('Vnesi veljaven referenčni datum.')
  await board(page)
  await expect(dateField(page)).toHaveValue('')
  await expect(filterField(page)).toHaveValue('overdue')
  await expectIds(page, ['web-01'])
  await counts(page, [1, 1, 1, 3, 2])
  await table(page)
  await expect(dateField(page)).toHaveValue('')
  await dateField(page).fill('2026-09-21')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(filterField(page)).toHaveValue('overdue')
  await expectIds(page, ['web-01', 'web-07'])
  await dateField(page).fill('2026-10-05')
  expect(new URL(page.url()).hash).toBe('#/projects/web')
  expect(await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }))).toEqual({ local: {}, session: {} })
  await project(page, 'launch')
  await expect(dateField(page)).toHaveValue('2026-09-21')
  await expect(filterField(page)).toHaveValue('all')
  await counts(page, [0, 0, 1, 0, 1])
  await project(page, 'web')
  await expect(dateField(page)).toHaveValue('2026-09-21')
  await expect(filterField(page)).toHaveValue('all')
  await dateField(page).fill('')
  await select(page, 'Pogled rokov', 'done')
  await board(page)
  await page.reload()
  await expect(dateField(page)).toHaveValue('2026-09-21')
  await expect(filterField(page)).toHaveValue('all')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expectIds(page, examples.filter(task => task.projectId === 'web').map(task => task.id), false)
  await readonly(page, writes)
})

test('A04: empty projects and empty groups remain navigable', async ({ page }) => {
  await mount(page, [])
  await counts(page, [0, 0, 0, 0, 0])
  await expectIds(page, [])
  await board(page)
  await counts(page, [0, 0, 0, 0, 0])
  await project(page, 'launch')
  await counts(page, [0, 0, 0, 0, 0])
  await table(page)
  await expectIds(page, [])
})

test('A05: single task, empty group, mobile Folio and read-only details', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const task = makeTask('unique-ž', { title: 'Dolgo opravilo — enako, "čšž"', description: 'Prva vrstica\nDruga vrstica', dueDate: '2024-02-29' })
  const writes = await mount(page, [task])
  await select(page, 'Pogled rokov', 'week')
  await expect(page.getByText('Ni opravil v izbrani skupini.', { exact: true })).toBeVisible()
  await expectIds(page, [])
  await board(page)
  await expect(page.getByText('Ni opravil v izbrani skupini.', { exact: true })).toBeVisible()
  await select(page, 'Pogled rokov', 'all')
  await expectIds(page, [task.id])
  await details(page, task.id)
  await readonly(page, writes)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: 'docs/agent/P08/mobile-board.png', fullPage: true })
  await table(page)
  await expectIds(page, [task.id])
  await expect(page.locator('tbody time')).toHaveAttribute('datetime', '2024-02-29')
  await readonly(page, writes)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: 'docs/agent/P08/mobile-table.png', fullPage: true })
  await page.setViewportSize({ width: 1440, height: 960 })
  await page.screenshot({ path: 'docs/agent/P08/desktop-table.png', fullPage: true })
})
