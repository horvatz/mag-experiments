import { test, expect, type Page } from '@playwright/test'
import { deadlineGroup, deadlineOverview, type DeadlineFilter } from '../../src/deadlines.ts'
import { mount, makeTask, expectIds, board, table, select, project, readonly, summary } from '../development/helpers.ts'

const groups = ['overdue', 'today', 'week', 'later', 'done'] as const
const records = [
  makeTask('z-ž', { dueDate: '2026-09-20' }),
  makeTask('q-8', { dueDate: '2025-01-01', status: 'done' }),
  makeTask('alpha', { dueDate: '2026-09-21', status: 'in_progress' }),
  makeTask('u-7', { dueDate: '2026-09-28' }),
  makeTask('beta', { dueDate: '2026-09-29' }),
  makeTask('r-1', { dueDate: '2026-09-22', status: 'in_progress' }),
  makeTask('k-9', { dueDate: '2028-02-29', status: 'done' }),
  makeTask('m-0', { dueDate: '2025-12-31', status: 'in_progress' }),
  makeTask('n-2', { dueDate: '2026-10-01' }),
  makeTask('y-3', { dueDate: '2026-09-21' }),
  makeTask('c-4', { dueDate: '2026-09-27' }),
  makeTask('b-5', { dueDate: '2026-09-21', status: 'done' }),
  makeTask('s-6', { dueDate: '2026-09-23', status: 'in_progress' }),
].map(t => ({ ...t, title: 'Enak naslov čšž, "primer"', description: 'Prva vrstica\nDruga vrstica <besedilo> & Ω' }))
const allRecords = [...records, makeTask('launch-only', { projectId: 'launch' })]
const expected: Record<DeadlineFilter, string[]> = {
  all: records.map(t => t.id),
  overdue: ['z-ž', 'm-0'], today: ['alpha', 'y-3'], week: ['u-7', 'r-1', 'c-4', 's-6'], later: ['beta', 'n-2'], done: ['q-8', 'k-9', 'b-5'],
}
const dateField = (page: Page) => page.getByLabel('Referenčni datum', { exact: true })
async function counts(page: Page, values: number[]) {
  for (const [i, key] of groups.entries()) await expect(page.getByLabel(`Število rokov ${key}`, { exact: true })).toHaveText(String(values[i]))
}

// Expected outcomes are explicit calendar examples, independent of the implementation.
test('A01: calendar boundaries, done priority and complete immutable partition', () => {
  const cases: [string, string, 'overdue' | 'today' | 'week' | 'later'][] = [
    ['2026-09-21', '2026-09-20', 'overdue'], ['2026-09-21', '2026-09-21', 'today'],
    ['2026-09-21', '2026-09-22', 'week'], ['2026-09-21', '2026-09-28', 'week'], ['2026-09-21', '2026-09-29', 'later'],
    ['2026-01-28', '2026-02-04', 'week'], ['2026-01-28', '2026-02-05', 'later'],
    ['2026-12-28', '2027-01-04', 'week'], ['2026-12-28', '2027-01-05', 'later'],
    ['2028-02-23', '2028-02-29', 'week'], ['2028-02-23', '2028-03-01', 'week'], ['2028-02-23', '2028-03-02', 'later'],
    ['2100-02-23', '2100-03-02', 'week'], ['2000-02-23', '2000-03-01', 'week'],
    ['2026-03-25', '2026-04-01', 'week'], ['2026-10-21', '2026-10-28', 'week'],
    ['0099-12-28', '0100-01-04', 'week'],
  ]
  for (const [reference, dueDate, group] of cases) {
    for (const status of ['todo', 'in_progress'] as const) expect(deadlineGroup(makeTask('edge', { dueDate, status }), reference)).toBe(group)
    expect(deadlineGroup(makeTask('done', { dueDate, status: 'done' }), reference)).toBe('done')
  }
  const frozen = records.map(t => Object.freeze({ ...t }))
  const original = JSON.stringify(frozen)
  const union: string[] = []
  for (const filter of groups) {
    const result = deadlineOverview(frozen, '2026-09-21', filter)
    expect(result.visibleTasks.map(t => t.id)).toEqual(expected[filter])
    expect(result.counts).toEqual({ overdue: 2, today: 2, week: 4, later: 2, done: 3 })
    union.push(...result.visibleTasks.map(t => t.id))
  }
  expect(new Set(union).size).toBe(records.length)
  expect(union.sort()).toEqual([...expected.all].sort())
  expect(JSON.stringify(frozen)).toBe(original)
})

test('A02: fixed start, every filter, global counters and identical board IDs', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2040-01-02T12:00:00Z'))
  const writes = await mount(page, allRecords)
  await expect(dateField(page)).toHaveValue('2026-09-21')
  await expect(dateField(page)).toHaveAttribute('type', 'date')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov' }).locator('option')).toHaveText(['Vsa opravila', 'Zapadlo', 'Danes', 'Naslednjih 7 dni', 'Pozneje', 'Končano'])
  for (const filter of ['all', ...groups] as const) {
    await select(page, 'Pogled rokov', filter)
    await expectIds(page, expected[filter])
    await counts(page, [2, 2, 4, 2, 3])
    await summary(page, [6, 4, 3])
    await board(page)
    await expectIds(page, expected[filter], false)
    for (const [status, label] of [['todo', 'Pripravljeno'], ['in_progress', 'V delu'], ['done', 'Končano']]) {
      const ids = records.filter(t => t.status === status && expected[filter].includes(t.id)).map(t => t.id)
      await expect(page.getByRole('region', { name: label, exact: true }).locator('[data-task-id]').evaluateAll(nodes => nodes.map(n => n.getAttribute('data-task-id')))).resolves.toEqual(ids)
    }
    await table(page)
  }
  await readonly(page, writes)
})

test('A03: draft state across views, recovery, project switch and reload', async ({ page }) => {
  const writes = await mount(page, allRecords)
  const initialStorage = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage }, cookies: document.cookie }))
  await select(page, 'Pogled rokov', 'week')
  await dateField(page).fill('2026-09-28')
  await expectIds(page, ['beta', 'n-2'])
  await counts(page, [7, 1, 2, 0, 3])
  await dateField(page).fill('')
  await expect(page.getByRole('alert')).toHaveText('Vnesi veljaven referenčni datum.')
  await board(page)
  await expect(dateField(page)).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov' })).toHaveValue('week')
  await expectIds(page, ['beta', 'n-2'], false)
  await counts(page, [7, 1, 2, 0, 3])
  await table(page)
  await expect(dateField(page)).toHaveValue('')
  await dateField(page).fill('2026-09-29')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expectIds(page, ['n-2'])
  expect(page.url()).toMatch(/#\/projects\/web$/)
  expect(await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage }, cookies: document.cookie }))).toEqual(initialStorage)
  await project(page, 'launch')
  await expect(dateField(page)).toHaveValue('2026-09-21')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov' })).toHaveValue('all')
  await expectIds(page, ['launch-only'])
  await project(page, 'web')
  await expectIds(page, expected.all)
  await expect(dateField(page)).toHaveValue('2026-09-21')
  await dateField(page).fill('2028-02-29')
  await select(page, 'Pogled rokov', 'done')
  await page.reload()
  await expect(dateField(page)).toHaveValue('2026-09-21')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov' })).toHaveValue('all')
  await expectIds(page, expected.all)
  await readonly(page, writes)
})

test('A04: both empty projects retain zero counters and usable views', async ({ page }) => {
  await mount(page, [])
  for (const id of ['web', 'launch'] as const) {
    await project(page, id)
    await counts(page, [0, 0, 0, 0, 0])
    await select(page, 'Pogled rokov', 'week')
    await expectIds(page, [])
    await board(page)
    await counts(page, [0, 0, 0, 0, 0])
    await select(page, 'Pogled rokov', 'all')
    await table(page)
    await expect(page.getByText('V tem projektu še ni opravil')).toBeVisible()
  }
})

test('A05: one task, empty group recovery, read-only details and mobile Folio', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const task = makeTask('unique-ž', { title: 'Enako <besedilo> Ω', description: 'Prva\nDruga, "vrstica"', dueDate: '2028-02-29' })
  const writes = await mount(page, [task])
  await counts(page, [0, 0, 0, 1, 0])
  for (const view of ['table', 'board']) {
    if (view === 'board') await board(page)
    await select(page, 'Pogled rokov', 'today')
    await expect(page.getByText('Ni opravil v izbrani skupini.', { exact: true })).toBeVisible()
    await expectIds(page, [])
    await select(page, 'Pogled rokov', 'all')
    await expectIds(page, ['unique-ž'])
    const entry = page.locator('[data-task-id="unique-ž"]')
    await expect(entry.locator('time')).toHaveAttribute('datetime', '2028-02-29')
    await entry.getByRole('link').click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('dialog').getByRole('heading', { name: task.title, exact: true })).toBeVisible()
    await expect(page.getByRole('dialog').getByText(task.description, { exact: true })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await readonly(page, writes)
  }
  await dateField(page).focus()
  await page.keyboard.press('Tab')
  const focus = await page.evaluate(() => {
    const style = getComputedStyle(document.activeElement!)
    return { width: style.outlineWidth, style: style.outlineStyle }
  })
  expect(focus.width).not.toBe('0px')
  expect(focus.style).not.toBe('none')
})

for (const timezoneId of ['Europe/Ljubljana', 'America/New_York']) {
  test.describe(timezoneId, () => {
    test.use({ timezoneId })
    test('A06: browser calendar boundaries across DST and leap day', async ({ page }) => {
      const dates = ['2026-04-01', '2026-04-02', '2026-03-12', '2026-03-13', '2026-10-28', '2026-10-29', '2026-11-04', '2026-11-05', '2028-02-29', '2028-03-01', '2028-03-02', '2027-01-04', '2027-01-05']
      await mount(page, dates.map((dueDate, i) => makeTask(`cal-${i}`, { dueDate })))
      await select(page, 'Pogled rokov', 'week')
      for (const [reference, ids] of [
        ['2026-03-25', ['cal-0']], ['2026-03-05', ['cal-2']],
        ['2026-10-21', ['cal-4']], ['2026-10-28', ['cal-5', 'cal-6']],
        ['2028-02-23', ['cal-8', 'cal-9']], ['2026-12-28', ['cal-11']],
      ] as [string, string[]][]) {
        await dateField(page).fill(reference)
        await expectIds(page, ids)
      }
    })
  })
}
