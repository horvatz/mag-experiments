import { expect, test, type Page } from '@playwright/test'
import type { Task } from '../../shared/types.ts'
import { calendarDay, groupTasksByDeadline } from '../../src/deadlines.ts'
import { board, columnIds, expectIds, makeTask, mount, project, readonly, select, summary, table } from '../development/helpers.ts'

const groups = ['overdue', 'today', 'week', 'later', 'done'] as const
const reference = (page: Page) => page.getByLabel('Referenčni datum', { exact: true })
const filter = (page: Page) => page.getByRole('combobox', { name: 'Pogled rokov', exact: true })

async function expectCounts(page: Page, expected: number[]) {
  for (const [index, group] of groups.entries()) {
    await expect(page.getByLabel(`Število rokov ${group}`, { exact: true })).toHaveText(String(expected[index]))
  }
}

const records: Task[] = [
  makeTask('pozneje:8', { dueDate: '2026-09-29' }),
  makeTask('končano:staro', { status: 'done', dueDate: '2000-02-29' }),
  makeTask('danes:prvo', { status: 'in_progress' }),
  makeTask('teden:7', { status: 'in_progress', dueDate: '2026-09-28' }),
  makeTask('zapadlo:1', { dueDate: '2026-09-20' }),
  makeTask('teden:1', { dueDate: '2026-09-22' }),
  makeTask('končano:prihodnje', { status: 'done', dueDate: '2030-01-01' }),
  makeTask('zapadlo:staro', { status: 'in_progress', dueDate: '2025-12-31' }),
  makeTask('danes:drugo'),
  makeTask('teden:3', { dueDate: '2026-09-24' }),
  makeTask('pozneje:leto', { dueDate: '2027-01-01' }),
  makeTask('končano:danes', { status: 'done' }),
  makeTask('končano:teden', { status: 'done', dueDate: '2026-09-23' }),
  makeTask('teden:5', { status: 'in_progress', dueDate: '2026-09-26' }),
].map(task => ({ ...task, title: 'Enak naslov; čšž "Ω"', description: 'Prva vrstica\nDruga vrstica <b>besedilo</b>.' }))

test('A01: all groups partition 14 tasks, preserve order and keep project counts in both views', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2034-01-01T22:00:00Z'))
  const writes = await mount(page, records)
  await expect(reference(page)).toHaveAttribute('type', 'date')
  await expect(reference(page)).toHaveValue('2026-09-21')
  await expect(filter(page)).toHaveValue('all')
  expect(await filter(page).locator('option').evaluateAll(options => options.map(option => (option as HTMLOptionElement).value))).toEqual(['all', ...groups])
  const expected = {
    all: records.map(task => task.id),
    overdue: ['zapadlo:1', 'zapadlo:staro'],
    today: ['danes:prvo', 'danes:drugo'],
    week: ['teden:7', 'teden:1', 'teden:3', 'teden:5'],
    later: ['pozneje:8', 'pozneje:leto'],
    done: ['končano:staro', 'končano:prihodnje', 'končano:danes', 'končano:teden'],
  }
  const union = groups.flatMap(group => expected[group])
  expect(new Set(union).size).toBe(records.length)
  for (const [value, ids] of Object.entries(expected)) {
    await select(page, 'Pogled rokov', value)
    await expectIds(page, ids)
    await expectCounts(page, [2, 2, 4, 2, 4])
    await summary(page, [6, 4, 4])
    await board(page)
    await expectIds(page, ids, false)
    for (const [status, label] of [['todo', 'Pripravljeno'], ['in_progress', 'V delu'], ['done', 'Končano']]) {
      await columnIds(page, label, records.filter(task => task.status === status && ids.includes(task.id)).map(task => task.id))
    }
    await expectCounts(page, [2, 2, 4, 2, 4])
    await table(page)
    await expectIds(page, ids)
  }
  await readonly(page, writes)
})

const calendarCases = [
  { name: 'month', anchor: '2026-09-27', dates: ['2026-09-26', '2026-09-27', '2026-09-28', '2026-10-04', '2026-10-05'] },
  { name: 'year', anchor: '2026-12-28', dates: ['2026-12-27', '2026-12-28', '2026-12-29', '2027-01-04', '2027-01-05'] },
  { name: 'leap February', anchor: '2028-02-28', dates: ['2028-02-27', '2028-02-28', '2028-02-29', '2028-03-06', '2028-03-07'] },
  { name: 'non-leap century', anchor: '1900-02-28', dates: ['1900-02-27', '1900-02-28', '1900-03-01', '1900-03-07', '1900-03-08'] },
  { name: 'leap century', anchor: '2000-02-28', dates: ['2000-02-27', '2000-02-28', '2000-02-29', '2000-03-06', '2000-03-07'] },
  { name: 'year below 100', anchor: '0099-12-28', dates: ['0099-12-27', '0099-12-28', '0099-12-29', '0100-01-04', '0100-01-05'] },
]

for (const scenario of calendarCases) {
  test(`A02: calendar partition across ${scenario.name}`, () => {
    const tasks = scenario.dates.map((dueDate, index) => makeTask(`boundary-${index}`, { dueDate }))
    const before = structuredClone(tasks)
    tasks.forEach(Object.freeze)
    const result = groupTasksByDeadline(tasks, scenario.anchor)
    expect(Object.fromEntries(groups.map(group => [group, result[group].map(task => task.id)]))).toEqual({
      overdue: ['boundary-0'], today: ['boundary-1'], week: ['boundary-2', 'boundary-3'], later: ['boundary-4'], done: [],
    })
    expect(tasks).toEqual(before)
  })
}

test('A02: rejects invalid calendar drafts instead of normalizing impossible dates', () => {
  for (const value of ['', '2026-02-29', '1900-02-29', '2028-02-30', '2026-04-31', '2026-13-01', '2026-00-01', '2026-01-00', '2026-9-21', '2026-09-21T00:00:00Z']) {
    expect(calendarDay(value), value).toBeNull()
  }
  for (const value of ['2028-02-29', '2000-02-29', '0001-01-01', '9999-12-31']) {
    expect(calendarDay(value), value).not.toBeNull()
  }
})

for (const timezoneId of ['Pacific/Kiritimati', 'America/Los_Angeles', 'Europe/Ljubljana']) {
  test.describe(`calendar in ${timezoneId}`, () => {
    test.use({ timezoneId })
    test('A03: browser recomputes through DST and leap day without timezone shifts', async ({ page }) => {
      const dates = ['2026-03-06', '2026-03-07', '2026-03-13', '2026-03-14', '2026-03-27', '2026-03-28', '2026-04-03', '2026-04-04', '2028-02-28', '2028-02-29', '2028-03-06', '2028-03-07']
      await mount(page, dates.map(dueDate => makeTask(`d-${dueDate}`, { dueDate })))
      await select(page, 'Pogled rokov', 'week')
      for (const scenario of [
        { anchor: '2026-03-06', week: ['2026-03-07', '2026-03-13'] },
        { anchor: '2026-03-27', week: ['2026-03-28', '2026-04-03'] },
        { anchor: '2028-02-28', week: ['2028-02-29', '2028-03-06'] },
      ]) {
        await reference(page).fill(scenario.anchor)
        await expect(filter(page)).toHaveValue('week')
        await expectIds(page, scenario.week.map(date => `d-${date}`))
        await expect(page.getByLabel('Število rokov week', { exact: true })).toHaveText('2')
      }
      await select(page, 'Pogled rokov', 'today')
      await reference(page).fill('2028-02-29')
      await expectIds(page, ['d-2028-02-29'])
      await expect(page.locator('tbody time')).toHaveText('29. feb. 2028')
    })
  })
}

test('A04: last valid date and empty draft survive views; project and reload reset local state', async ({ page }) => {
  await mount(page, records.concat(makeTask('other-project', { projectId: 'launch', dueDate: '2026-09-22' })))
  await reference(page).fill('2026-09-28')
  await select(page, 'Pogled rokov', 'today')
  await expectIds(page, ['teden:7'])
  await expectCounts(page, [7, 1, 1, 1, 4])
  await board(page)
  await expect(reference(page)).toHaveValue('2026-09-28')
  await expectIds(page, ['teden:7'])
  await reference(page).fill('')
  await expect(page.getByRole('alert')).toHaveText('Vnesi veljaven referenčni datum.')
  await expect(reference(page)).toHaveAttribute('aria-invalid', 'true')
  await table(page)
  await expect(reference(page)).toHaveValue('')
  await expect(filter(page)).toHaveValue('today')
  await expectIds(page, ['teden:7'])
  await expectCounts(page, [7, 1, 1, 1, 4])
  await select(page, 'Pogled rokov', 'later')
  await expectIds(page, ['pozneje:leto'])
  await board(page)
  await expect(reference(page)).toHaveValue('')
  await expect(filter(page)).toHaveValue('later')
  await expectIds(page, ['pozneje:leto'])
  await reference(page).fill('2026-09-21')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expectIds(page, ['pozneje:8', 'pozneje:leto'])
  await reference(page).fill('')
  await project(page, 'launch')
  await expect(reference(page)).toHaveValue('2026-09-21')
  await expect(filter(page)).toHaveValue('all')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expectCounts(page, [0, 0, 1, 0, 0])
  await project(page, 'web')
  await expect(reference(page)).toHaveValue('2026-09-21')
  await expect(filter(page)).toHaveValue('all')
  await reference(page).fill('2028-02-29')
  await select(page, 'Pogled rokov', 'overdue')
  await reference(page).fill('')
  expect(new URL(page.url()).hash).toBe('#/projects/web?view=board')
  expect(await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }))).toEqual({ local: [], session: [] })
  await page.reload()
  await expect(reference(page)).toHaveValue('2026-09-21')
  await expect(filter(page)).toHaveValue('all')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expectIds(page, records.map(task => task.id), false)
})

test('A05: zero and one task support every filter and recover from an empty group in both views', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page, [makeTask('single', { projectId: 'launch' })])
  for (const view of [table, board]) {
    await view(page)
    for (const group of ['all', ...groups]) {
      await select(page, 'Pogled rokov', group)
      await expectCounts(page, [0, 0, 0, 0, 0])
      await expectIds(page, [])
    }
  }
  await project(page, 'launch')
  for (const view of [table, board]) {
    await view(page)
    for (const group of groups) {
      await select(page, 'Pogled rokov', group)
      await expectCounts(page, [0, 1, 0, 0, 0])
      await expectIds(page, group === 'today' ? ['single'] : [])
      await expect(page.getByText('Ni opravil v izbrani skupini.', { exact: true })).toHaveCount(group === 'today' ? 0 : 1)
      if (group !== 'today') await expect(page.getByText('Ni opravil v izbrani skupini.', { exact: true })).toBeVisible()
      await expect(filter(page)).toBeVisible()
    }
    await select(page, 'Pogled rokov', 'all')
    await expectIds(page, ['single'])
    await expect(page.getByText('Ni opravil v izbrani skupini.', { exact: true })).toHaveCount(0)
  }
  await readonly(page, writes)
  await project(page, 'web')
  await project(page, 'launch')
  await expect(filter(page)).toHaveValue('all')
})

test('A06: filtered Unicode IDs keep complete read-only details, fields and mobile layout', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page, records)
  const forbiddenRequests: string[] = []
  page.on('request', request => {
    if (new URL(request.url()).pathname.startsWith('/__test/')) forbiddenRequests.push(request.url())
  })
  await reference(page).fill('2026-09-28')
  await select(page, 'Pogled rokov', 'today')
  await reference(page).fill('')
  for (const view of [table, board]) {
    await view(page)
    const task = page.locator('[data-task-id="teden:7"]')
    await expect(task.locator('time')).toHaveAttribute('datetime', '2026-09-28')
    const link = task.getByRole('link')
    await link.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: records[3].title, exact: true })).toBeVisible()
    await expect(dialog.getByText(records[3].description, { exact: true })).toBeVisible()
    await expect(dialog.getByText(records[3].assignee, { exact: true })).toBeVisible()
    await expect(dialog.getByText('V delu', { exact: true })).toBeVisible()
    await expect(dialog.locator('time')).toHaveAttribute('datetime', records[3].dueDate)
    await expect(dialog.locator('input, select, textarea')).toHaveCount(0)
    await page.keyboard.press('Escape')
    await expect(link).toBeFocused()
    await expect(reference(page)).toHaveValue('')
    await expect(filter(page)).toHaveValue('today')
    await expectIds(page, ['teden:7'])
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
  expect(forbiddenRequests).toEqual([])
  await reference(page).fill('2026-09-21')
  await select(page, 'Pogled rokov', 'all')
  await table(page)
  for (const record of records) {
    const row = page.locator(`[data-task-id="${record.id}"]`)
    await expect(row.getByRole('link')).toContainText(record.title)
    await expect(row.locator('time')).toHaveAttribute('datetime', record.dueDate)
  }
  await readonly(page, writes)
})
