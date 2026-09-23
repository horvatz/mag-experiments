import { test, expect, type Page } from '@playwright/test'
import { board, expectIds, makeTask, mount, project, readonly, select, table, type Task } from '../development/helpers.ts'

const records: Task[] = [
  makeTask('late-open', { dueDate: '2026-09-29' }),
  makeTask('done-past', { status: 'done', dueDate: '2026-09-20' }),
  makeTask('week-last', { dueDate: '2026-09-28' }),
  makeTask('today-open'),
  makeTask('week-first', { status: 'in_progress', dueDate: '2026-09-22' }),
  makeTask('done-today', { status: 'done' }),
  makeTask('past-open', { dueDate: '2026-09-20' }),
  makeTask('done-week', { status: 'done', dueDate: '2026-09-28' }),
  makeTask('late-far', { status: 'in_progress', dueDate: '2027-01-01' }),
  makeTask('today-progress', { status: 'in_progress' }),
  makeTask('done-future', { status: 'done', dueDate: '2028-02-29' }),
  makeTask('past-older', { dueDate: '2026-09-19' }),
].map(task => ({ ...task, title: 'Enak naslov čšž, "citat"', description: 'Prva vrstica\nDruga vrstica; Ω', assignee: 'Živa Kovač' }))

const groups = ['overdue', 'today', 'week', 'later', 'done'] as const
async function counts(page: Page, values: number[]) {
  for (const [index, key] of groups.entries()) await expect(page.getByLabel(`Število rokov ${key}`, { exact: true })).toHaveText(String(values[index]))
}

test('S1: complete disjoint partition, stable IDs, done precedence, both views and read-only details', async ({ page }) => {
  const writes = await mount(page, records)
  await expect(page.getByLabel('Pogled rokov', { exact: true })).toHaveValue('all')
  await expectIds(page, records.map(task => task.id))
  const expected = {
    overdue: ['past-open', 'past-older'], today: ['today-open', 'today-progress'],
    week: ['week-last', 'week-first'], later: ['late-open', 'late-far'],
    done: ['done-past', 'done-today', 'done-week', 'done-future'],
  }
  const observed: string[] = []
  for (const key of groups) {
    await select(page, 'Pogled rokov', key)
    await expectIds(page, expected[key])
    observed.push(...expected[key])
    await counts(page, [2, 2, 2, 2, 4])
    await board(page)
    await expectIds(page, expected[key], false)
    for (const [status, label] of [['todo', 'Pripravljeno'], ['in_progress', 'V delu'], ['done', 'Končano']]) {
      const ids = records.filter(task => expected[key].includes(task.id) && task.status === status).map(task => task.id)
      await expect(page.getByRole('region', { name: label, exact: true }).locator('[data-task-id]')).toHaveCount(ids.length)
      expect(await page.getByRole('region', { name: label, exact: true }).locator('[data-task-id]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-task-id')))).toEqual(ids)
    }
    await table(page)
  }
  expect(new Set(observed).size).toBe(records.length)
  expect(observed.sort()).toEqual(records.map(task => task.id).sort())
  await select(page, 'Pogled rokov', 'all')
  await expectIds(page, records.map(task => task.id))
  for (const task of records) await expect(page.locator(`[data-task-id="${task.id}"] time`)).toHaveAttribute('datetime', task.dueDate)
  const link = page.locator('[data-task-id="done-future"]').getByRole('link')
  await link.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: records[0].title })).toBeVisible()
  await expect(dialog.getByText(records[0].description, { exact: true })).toBeVisible()
  await expect(dialog.getByText('Živa Kovač', { exact: true })).toBeVisible()
  await expect(dialog.locator('time')).toHaveAttribute('datetime', '2028-02-29')
  await page.keyboard.press('Escape')
  await expect(link).toBeFocused()
  await readonly(page, writes)
})

test('S3: invalid draft, recalculation, view preservation, project and refresh reset, no persistence', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2037-04-12T12:00:00Z'))
  const writes = await mount(page, records)
  const date = page.getByLabel('Referenčni datum', { exact: true })
  const filter = page.getByLabel('Pogled rokov', { exact: true })
  const storage = () => page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }))
  const initialStorage = await storage()
  await expect(date).toHaveValue('2026-09-21')
  await select(page, 'Pogled rokov', 'week')
  await date.fill('2026-09-22')
  await expect(filter).toHaveValue('week')
  await expectIds(page, ['late-open', 'week-last'])
  await counts(page, [4, 1, 2, 1, 4])
  await date.fill('')
  await expect(page.getByRole('alert')).toHaveText('Vnesi veljaven referenčni datum.')
  await expectIds(page, ['late-open', 'week-last'])
  await counts(page, [4, 1, 2, 1, 4])
  await board(page)
  await expect(date).toHaveValue('')
  await expect(filter).toHaveValue('week')
  await expectIds(page, ['late-open', 'week-last'], false)
  await select(page, 'Pogled rokov', 'today')
  await expectIds(page, ['week-first'])
  await table(page)
  await expect(date).toHaveValue('')
  await expect(page.getByRole('alert')).toBeVisible()
  await date.fill('2026-09-21')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(filter).toHaveValue('today')
  await expectIds(page, ['today-open', 'today-progress'])
  expect(await storage()).toEqual(initialStorage)
  expect(new URL(page.url()).hash).toBe('#/projects/web')
  await date.fill('')
  await project(page, 'launch')
  await expect(date).toHaveValue('2026-09-21')
  await expect(filter).toHaveValue('all')
  await counts(page, [0, 0, 0, 0, 0])
  await project(page, 'web')
  await expect(date).toHaveValue('2026-09-21')
  await expect(filter).toHaveValue('all')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await date.fill('2024-02-22')
  await select(page, 'Pogled rokov', 'done')
  await board(page)
  await page.reload()
  await expect(date).toHaveValue('2026-09-21')
  await expect(filter).toHaveValue('all')
  await expect(page.getByRole('button', { name: 'Tabla', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expectIds(page, records.map(task => task.id), false)
  expect(await storage()).toEqual(initialStorage)
  await readonly(page, writes)
})

test('S4/S5: empty projects and empty groups recover on a 390 px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page, [])
  for (const id of ['web', 'launch'] as const) {
    await project(page, id)
    await counts(page, [0, 0, 0, 0, 0])
    await board(page)
    await expect(page.getByRole('region', { name: 'Tabla opravil' }).getByRole('region')).toHaveCount(3)
    await readonly(page, writes)
    await table(page)
    await expect(page.getByText('V tem projektu še ni opravil', { exact: true })).toBeVisible()
  }
  await mount(page, [makeTask('single-Ω', { title: 'Dolg naslov čšž '.repeat(15), description: 'Dolgo besedilo '.repeat(30) })])
  for (const view of ['table', 'board']) {
    if (view === 'board') await board(page)
    await select(page, 'Pogled rokov', 'done')
    await expect(page.getByText('Ni opravil v izbrani skupini.', { exact: true })).toBeVisible()
    await expectIds(page, [])
    await counts(page, [0, 1, 0, 0, 0])
    await select(page, 'Pogled rokov', 'today')
    await expectIds(page, ['single-Ω'])
    await select(page, 'Pogled rokov', 'all')
    await expectIds(page, ['single-Ω'])
    await readonly(page, writes)
  }
  await page.getByLabel('Referenčni datum', { exact: true }).focus()
  for (let index = 0; index < 5; index += 1) {
    await page.keyboard.press('Tab')
    if (await page.getByLabel('Pogled rokov', { exact: true }).evaluate(element => element === document.activeElement)) break
  }
  await expect(page.getByLabel('Pogled rokov', { exact: true })).toBeFocused()
})

const boundaries = [
  ['2026-01-25', '2026-02-01', '2026-02-02'],
  ['2026-12-25', '2027-01-01', '2027-01-02'],
  ['2024-02-22', '2024-02-29', '2024-03-01'],
  ['2025-02-22', '2025-03-01', '2025-03-02'],
  ['2026-03-25', '2026-04-01', '2026-04-02'],
  ['2026-10-21', '2026-10-28', '2026-10-29'],
  ['2026-03-04', '2026-03-11', '2026-03-12'],
  ['2026-10-28', '2026-11-04', '2026-11-05'],
]

for (const timezoneId of ['UTC', 'Europe/Ljubljana', 'America/Los_Angeles']) {
  test.describe(`S2: calendar in ${timezoneId}`, () => {
    test.use({ timezoneId })
    test('month, year, leap February and daylight saving boundaries', async ({ page }) => {
      for (const [reference, seventh, eighth] of boundaries) {
        await page.goto('about:blank')
        await page.unroute('**/api/**')
        await mount(page, [makeTask('eighth', { dueDate: eighth }), makeTask('seventh', { dueDate: seventh }), makeTask('anchor', { dueDate: reference }), makeTask('finished', { dueDate: seventh, status: 'done' })])
        await page.getByLabel('Referenčni datum', { exact: true }).fill(reference)
        await counts(page, [0, 1, 1, 1, 1])
        await select(page, 'Pogled rokov', 'week')
        await expectIds(page, ['seventh'])
        await select(page, 'Pogled rokov', 'later')
        await expectIds(page, ['eighth'])
        await select(page, 'Pogled rokov', 'today')
        await expectIds(page, ['anchor'])
      }
    })
  })
}
