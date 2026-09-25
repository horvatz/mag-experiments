import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { board, expectIds, makeTask, mount, project, readonly, select, table } from '../development/helpers.ts'

const records = [
  makeTask('rok-Ž-91', { status: 'in_progress', dueDate: '2026-09-28' }),
  makeTask('končano-1', { status: 'done', dueDate: '2026-09-01' }),
  makeTask('danes-9', { dueDate: '2026-09-21' }),
  makeTask('pozno-4', { status: 'in_progress', dueDate: '2026-09-29' }),
  makeTask('prej-8', { dueDate: '2026-09-20' }),
  makeTask('rok-2', { dueDate: '2026-09-22' }),
  makeTask('končano-2', { status: 'done', dueDate: '2026-10-09' }),
  makeTask('prej-3', { status: 'in_progress', dueDate: '2026-09-01' }),
  makeTask('danes-2', { status: 'in_progress', dueDate: '2026-09-21' }),
  makeTask('rok-7', { dueDate: '2026-09-25' }),
  makeTask('končano-3', { status: 'done', dueDate: '2026-09-21' }),
  makeTask('pozno-1', { dueDate: '2026-10-01' }),
  makeTask('končano-4', { status: 'done', dueDate: '2026-09-22' }),
  makeTask('pozno-9', { dueDate: '2030-01-01' }),
].map(task => ({ ...task, title: 'Enak naslov – čšž, "citat"', description: 'Prva vrstica\nDruga vrstica; <besedilo> & čšž' }))

const expectedGroups = {
  overdue: ['prej-8', 'prej-3'],
  today: ['danes-9', 'danes-2'],
  week: ['rok-Ž-91', 'rok-2', 'rok-7'],
  later: ['pozno-4', 'pozno-1', 'pozno-9'],
  done: ['končano-1', 'končano-2', 'končano-3', 'končano-4'],
}

async function expectCounts(page: Page, values: number[]) {
  for (const [index, key] of ['overdue', 'today', 'week', 'later', 'done'].entries()) {
    await expect(page.getByLabel(`Število rokov ${key}`, { exact: true })).toHaveText(String(values[index]))
  }
}

test('A01: fixed initial date, disjoint complete groups, stable order and full-project counters', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2040-01-01T23:59:00Z'))
  const writes = await mount(page, records)
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(page.getByLabel('Pogled rokov', { exact: true })).toHaveValue('all')
  await expectIds(page, records.map(task => task.id))
  const seen: string[] = []
  for (const [group, expected] of Object.entries(expectedGroups)) {
    await select(page, 'Pogled rokov', group)
    await expectIds(page, expected)
    await expectCounts(page, [2, 2, 3, 3, 4])
    seen.push(...expected)
    await board(page)
    await expectIds(page, expected, false)
    await expectCounts(page, [2, 2, 3, 3, 4])
    await table(page)
    await expectIds(page, expected)
  }
  expect(new Set(seen).size).toBe(records.length)
  expect(seen.sort()).toEqual(records.map(task => task.id).sort())
  await select(page, 'Pogled rokov', 'all')
  await expectIds(page, records.map(task => task.id))
  await board(page)
  for (const [status, label] of [['todo', 'Pripravljeno'], ['in_progress', 'V delu'], ['done', 'Končano']]) {
    const column = page.getByRole('region', { name: label, exact: true })
    expect(await column.locator('[data-task-id]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-task-id'))))
      .toEqual(records.filter(task => task.status === status).map(task => task.id))
  }
  await readonly(page, writes)
})

const calendarCases = [
  { name: 'leap February', anchor: '2028-02-27', dates: ['2028-02-26', '2028-02-27', '2028-02-28', '2028-02-29', '2028-03-05', '2028-03-06'] },
  { name: 'spring DST', anchor: '2026-03-07', dates: ['2026-03-06', '2026-03-07', '2026-03-08', '2026-03-09', '2026-03-14', '2026-03-15'] },
  { name: 'autumn DST and month boundary', anchor: '2026-10-24', dates: ['2026-10-23', '2026-10-24', '2026-10-25', '2026-10-26', '2026-10-31', '2026-11-01'] },
  { name: 'year boundary', anchor: '2026-12-28', dates: ['2026-12-27', '2026-12-28', '2026-12-29', '2026-12-30', '2027-01-04', '2027-01-05'] },
  { name: 'non-leap century', anchor: '2100-02-27', dates: ['2100-02-26', '2100-02-27', '2100-02-28', '2100-03-01', '2100-03-06', '2100-03-07'] },
  { name: 'leap century', anchor: '2000-02-27', dates: ['2000-02-26', '2000-02-27', '2000-02-28', '2000-02-29', '2000-03-05', '2000-03-06'] },
  { name: 'year before 100', anchor: '0096-02-27', dates: ['0096-02-26', '0096-02-27', '0096-02-28', '0096-02-29', '0096-03-05', '0096-03-06'] },
]

for (const timezoneId of ['America/Los_Angeles', 'Europe/Ljubljana', 'Pacific/Kiritimati']) {
  test.describe(timezoneId, () => {
    test.use({ timezoneId })
    test('A02: calendar boundaries are independent of timezone and DST', async ({ page }) => {
      for (const scenario of calendarCases) {
        await test.step(scenario.name, async () => {
          const tasks = scenario.dates.map((dueDate, index) => makeTask(`meja-${index}`, { dueDate }))
          // Reusing an identical hash URL is an in-document navigation, not a data reload.
          await page.goto('about:blank')
          await page.unrouteAll()
          await mount(page, tasks)
          await expect(page.locator('tbody time').first()).toHaveAttribute('datetime', scenario.dates[0])
          await page.getByLabel('Referenčni datum', { exact: true }).fill(scenario.anchor)
          await expectCounts(page, [1, 1, 3, 1, 0])
          for (const [group, ids] of [['overdue', ['meja-0']], ['today', ['meja-1']], ['week', ['meja-2', 'meja-3', 'meja-4']], ['later', ['meja-5']]] as const) {
            await select(page, 'Pogled rokov', group)
            await expectIds(page, [...ids])
          }
          await select(page, 'Pogled rokov', 'all')
          await expectIds(page, tasks.map(task => task.id))
          expect(await page.locator('tbody time').evaluateAll(nodes => nodes.map(node => node.getAttribute('datetime')))).toEqual(scenario.dates)
        })
      }
    })
  })
}

test('A03: invalid draft and valid reclassification survive views; projects and reload reset state', async ({ page }) => {
  await mount(page, [...records, makeTask('drug-projekt', { projectId: 'launch' })])
  const date = page.getByLabel('Referenčni datum', { exact: true })
  const filter = page.getByLabel('Pogled rokov', { exact: true })
  await select(page, 'Pogled rokov', 'overdue')
  await date.fill('')
  await expect(page.getByRole('alert')).toHaveText('Vnesi veljaven referenčni datum.')
  await expect(date).toHaveAttribute('aria-invalid', 'true')
  await expectCounts(page, [2, 2, 3, 3, 4])
  await board(page)
  await expect(date).toHaveValue('')
  await expect(filter).toHaveValue('overdue')
  await expectIds(page, expectedGroups.overdue, false)
  await table(page)
  await expectIds(page, expectedGroups.overdue)
  await expect(date).toHaveValue('')
  await date.fill('2026-09-22')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(filter).toHaveValue('overdue')
  await expectIds(page, ['danes-9', 'prej-8', 'prej-3', 'danes-2'])
  await expectCounts(page, [4, 1, 3, 2, 4])
  await board(page)
  await expect(date).toHaveValue('2026-09-22')
  await expectIds(page, ['danes-9', 'prej-8', 'prej-3', 'danes-2'], false)
  await project(page, 'launch')
  await expect(date).toHaveValue('2026-09-21')
  await expect(filter).toHaveValue('all')
  await expectCounts(page, [0, 1, 0, 0, 0])
  await expectIds(page, ['drug-projekt'])
  await project(page, 'web')
  await expect(date).toHaveValue('2026-09-21')
  await expect(filter).toHaveValue('all')
  await select(page, 'Pogled rokov', 'later')
  await date.fill('2030-12-31')
  expect(new URL(page.url()).hash).toBe('#/projects/web?view=board')
  await date.fill('')
  await page.reload()
  await expect(date).toHaveValue('2026-09-21')
  await expect(filter).toHaveValue('all')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expectIds(page, records.map(task => task.id), false)
  expect(await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) })))
    .toEqual({ local: [], session: [] })
})

test('A04: two empty projects retain zero counters, controls and board columns', async ({ page }) => {
  await mount(page, [])
  for (const id of ['web', 'launch'] as const) {
    await project(page, id)
    for (const filter of ['all', 'overdue', 'today', 'week', 'later', 'done']) {
      await select(page, 'Pogled rokov', filter)
      await expectCounts(page, [0, 0, 0, 0, 0])
      await expectIds(page, [])
    }
    await board(page)
    await expect(page.getByRole('region', { name: 'Tabla opravil' }).getByRole('region')).toHaveCount(3)
    await expectCounts(page, [0, 0, 0, 0, 0])
    await table(page)
    await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
  }
})

test('A04: singleton project has recoverable empty groups in both views', async ({ page }) => {
  await mount(page, [makeTask('edina-naloga')])
  for (const view of [table, board]) {
    await view(page)
    for (const filter of ['overdue', 'week', 'later', 'done']) {
      await select(page, 'Pogled rokov', filter)
      await expect(page.getByText('Ni opravil v izbrani skupini.', { exact: true })).toBeVisible()
      await expectIds(page, [])
      await expectCounts(page, [0, 1, 0, 0, 0])
      await select(page, 'Pogled rokov', 'today')
      await expectIds(page, ['edina-naloga'])
      await expect(page.getByText('Ni opravil v izbrani skupini.', { exact: true })).toHaveCount(0)
    }
    await select(page, 'Pogled rokov', 'all')
    await expectIds(page, ['edina-naloga'])
  }
})

test('A05: narrow Folio preserves literal details, IDs, fields and read-only API', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page, records)
  const before = await (await page.request.get('/__test/state')).json()
  const testControlRequests: string[] = []
  page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/__test/')) testControlRequests.push(request.url()) })
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await select(page, 'Pogled rokov', 'week')
  for (const view of [table, board]) {
    await view(page)
    await expectIds(page, expectedGroups.week, view === table)
    await readonly(page, writes)
    const row = page.locator('[data-task-id="rok-Ž-91"]')
    await expect(row.locator('time')).toHaveAttribute('datetime', '2026-09-28')
    const link = row.getByRole('link')
    await link.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: records[0].title, exact: true })).toBeVisible()
    await expect(dialog.getByText(records[0].description, { exact: true })).toBeVisible()
    await expect(dialog.locator('time')).toHaveAttribute('datetime', records[0].dueDate)
    await expect(dialog.getByText('V delu', { exact: true })).toBeVisible()
    await expect(dialog.getByText('Ana Novak', { exact: true })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(link).toBeFocused()
    await expect(page.getByLabel('Pogled rokov', { exact: true })).toHaveValue('week')
  }
  await page.getByLabel('Referenčni datum', { exact: true }).fill('')
  await expect(page.getByRole('alert')).toBeVisible()
  await readonly(page, writes)
  expect(await (await page.request.get('/__test/state')).json()).toEqual(before)
  expect(testControlRequests).toEqual([])
  expect(errors).toEqual([])
})
