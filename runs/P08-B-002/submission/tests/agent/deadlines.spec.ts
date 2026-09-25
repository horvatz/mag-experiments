import { test, expect, type Page } from '@playwright/test'
import { board, columnIds, expectIds, makeTask, mount, project, readonly, select, table } from '../development/helpers.ts'

const keys = ['overdue', 'today', 'week', 'later', 'done']
const records = [
  makeTask('pozno:ž', { dueDate: '2026-09-29' }),
  makeTask('done-before', { status: 'done', dueDate: '2026-09-20' }),
  makeTask('week-edge', { status: 'in_progress', dueDate: '2026-09-28' }),
  makeTask('overdue-one', { dueDate: '2026-09-20' }),
  makeTask('done-today', { status: 'done' }),
  makeTask('today-one', { status: 'in_progress' }),
  makeTask('week-start', { dueDate: '2026-09-22' }),
  makeTask('done-next', { status: 'done', dueDate: '2026-09-22' }),
  makeTask('later&two', { status: 'in_progress', dueDate: '2026-10-01' }),
  makeTask('done-edge', { status: 'done', dueDate: '2026-09-28' }),
  makeTask('week-middle', { dueDate: '2026-09-23' }),
  makeTask('done-later', { status: 'done', dueDate: '2026-09-29' }),
].map(task => ({ ...task, title: 'Enak naslov, "čšž" — 日本語', description: 'Opis: prva vrstica\nDruga vrstica; <besedilo> & podatki.' }))

async function counts(page: Page, values: number[]) {
  for (const [index, key] of keys.entries()) {
    await expect(page.getByLabel(`Število rokov ${key}`, { exact: true })).toHaveText(String(values[index]))
  }
}

test('S01/S03: fixed anchor, all boundaries, stable identities in both views and no writes', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2037-01-15T12:00:00Z'))
  const writes = await mount(page, records)
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(page.getByLabel('Pogled rokov', { exact: true })).toHaveValue('all')
  const expected = {
    all: records.map(task => task.id), overdue: ['overdue-one'], today: ['today-one'],
    week: ['week-edge', 'week-start', 'week-middle'], later: ['pozno:ž', 'later&two'],
    done: ['done-before', 'done-today', 'done-next', 'done-edge', 'done-later'],
  }
  for (const [filter, taskIds] of Object.entries(expected)) {
    await select(page, 'Pogled rokov', filter)
    await expectIds(page, taskIds)
    await counts(page, [1, 1, 3, 2, 5])
    await board(page)
    await expectIds(page, taskIds, false)
    for (const [status, label] of [['todo', 'Pripravljeno'], ['in_progress', 'V delu'], ['done', 'Končano']]) {
      await columnIds(page, label, records.filter(task => taskIds.includes(task.id) && task.status === status).map(task => task.id))
    }
    await counts(page, [1, 1, 3, 2, 5])
    await table(page)
    await expectIds(page, taskIds)
  }
  await select(page, 'Pogled rokov', 'later')
  await page.locator('[data-task-id="pozno:ž"]').getByRole('link').click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: records[0].title, exact: true })).toBeVisible()
  await expect(dialog.locator('time')).toHaveAttribute('datetime', '2026-09-29')
  await expect(dialog.locator('.description p')).toHaveText(records[0].description)
  await page.keyboard.press('Escape')
  await expect(page.getByLabel('Pogled rokov', { exact: true })).toHaveValue('later')
  await readonly(page, writes)
})

for (const timezoneId of ['UTC', 'Europe/Ljubljana', 'America/Los_Angeles']) {
  test(`S02: calendar boundaries and leap days in ${timezoneId}`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, timezoneId })
    try {
      for (const [reference, edge, later] of [
        ['2026-09-27', '2026-10-04', '2026-10-05'],
        ['2026-12-28', '2027-01-04', '2027-01-05'],
        ['2028-02-22', '2028-02-29', '2028-03-01'],
        ['2028-02-23', '2028-03-01', '2028-03-02'],
        ['2028-02-29', '2028-03-07', '2028-03-08'],
        ['2027-02-22', '2027-03-01', '2027-03-02'],
        ['2026-03-26', '2026-04-02', '2026-04-03'],
        ['2026-10-22', '2026-10-29', '2026-10-30'],
      ]) {
        const page = await context.newPage()
        await mount(page, [makeTask('today', { dueDate: reference }), makeTask('edge', { dueDate: edge }), makeTask('later', { dueDate: later })])
        await page.getByLabel('Referenčni datum', { exact: true }).fill(reference)
        await counts(page, [0, 1, 1, 1, 0])
        for (const [filter, id] of [['today', 'today'], ['week', 'edge'], ['later', 'later']]) {
          await select(page, 'Pogled rokov', filter)
          await expectIds(page, [id])
        }
        await page.close()
      }
    } finally {
      await context.close()
    }
  })
}

test('S04: invalid draft retains calculation and filter across views, valid input recovers', async ({ page }) => {
  await mount(page, records)
  const date = page.getByLabel('Referenčni datum', { exact: true })
  await select(page, 'Pogled rokov', 'overdue')
  await date.fill('2026-09-23')
  await expectIds(page, ['overdue-one', 'today-one', 'week-start'])
  await counts(page, [3, 1, 2, 1, 5])
  await date.fill('')
  await expect(page.getByRole('alert')).toHaveText('Vnesi veljaven referenčni datum.')
  await expect(date).toHaveAttribute('aria-invalid', 'true')
  await board(page)
  await expect(date).toHaveValue('')
  await expect(page.getByLabel('Pogled rokov', { exact: true })).toHaveValue('overdue')
  await expectIds(page, ['overdue-one', 'today-one', 'week-start'], false)
  await counts(page, [3, 1, 2, 1, 5])
  await select(page, 'Pogled rokov', 'today')
  await expectIds(page, ['week-middle'])
  await table(page)
  await expect(date).toHaveValue('')
  await expect(page.getByRole('alert')).toBeVisible()
  await date.fill('2026-09-21')
  await expectIds(page, ['today-one'])
  await expect(page.getByLabel('Pogled rokov', { exact: true })).toHaveValue('today')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await counts(page, [1, 1, 3, 2, 5])
})

test('S05: project changes and refresh reset local controls without persistence', async ({ page }) => {
  await mount(page, [...records, makeTask('second-project', { projectId: 'launch' })])
  const date = page.getByLabel('Referenčni datum', { exact: true })
  const filter = page.getByLabel('Pogled rokov', { exact: true })
  await date.fill('2028-02-29')
  await select(page, 'Pogled rokov', 'later')
  await expect(page).toHaveURL(/#\/projects\/web$/)
  await board(page)
  await expect(page).toHaveURL(/#\/projects\/web\?view=board$/)
  await project(page, 'launch')
  await expect(date).toHaveValue('2026-09-21')
  await expect(filter).toHaveValue('all')
  await date.fill('')
  await project(page, 'web')
  await expect(date).toHaveValue('2026-09-21')
  await expect(filter).toHaveValue('all')
  await expect(page.getByRole('alert')).toHaveCount(0)
  for (const switchView of [table, board]) {
    await switchView(page)
    await date.fill('')
    await select(page, 'Pogled rokov', 'done')
    await page.reload()
    await expect(date).toHaveValue('2026-09-21')
    await expect(filter).toHaveValue('all')
    await expect(page.getByRole('alert')).toHaveCount(0)
  }
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 })
})

test('S06: empty projects and an empty group retain usable controls and board columns', async ({ page }) => {
  await mount(page, [makeTask('single', { projectId: 'launch' })])
  await counts(page, [0, 0, 0, 0, 0])
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
  await board(page)
  await expect(page.getByRole('region', { name: 'Tabla opravil' }).getByRole('region')).toHaveCount(3)
  await project(page, 'launch')
  await counts(page, [0, 1, 0, 0, 0])
  for (const switchView of [table, board]) {
    await switchView(page)
    await select(page, 'Pogled rokov', 'overdue')
    await expect(page.getByText('Ni opravil v izbrani skupini.', { exact: true })).toBeVisible()
    await expectIds(page, [])
    await select(page, 'Pogled rokov', 'all')
    await expectIds(page, ['single'])
    await expect(page.getByText('Ni opravil v izbrani skupini.', { exact: true })).toHaveCount(0)
  }
})

test('S07: narrow Folio keeps controls, alert and long content within the page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page, records.map(task => ({ ...task, title: task.title.repeat(10), assignee: 'DolgoIme'.repeat(20) })))
  await page.getByLabel('Referenčni datum', { exact: true }).fill('')
  await expect(page.getByRole('alert')).toBeVisible()
  for (const switchView of [table, board]) {
    await switchView(page)
    await readonly(page, writes)
    const filter = page.getByLabel('Pogled rokov', { exact: true })
    await filter.focus()
    await expect(filter).toBeFocused()
    expect(await filter.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe('none')
    const bounds = await filter.boundingBox()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390)
  }
})
