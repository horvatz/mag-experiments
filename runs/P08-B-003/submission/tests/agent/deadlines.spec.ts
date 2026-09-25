import { test, expect, type Page } from '@playwright/test'
import { board, columnIds, expectIds, makeTask, mount, project, readonly, select, table, type Task } from '../development/helpers.ts'

const groups = ['overdue', 'today', 'week', 'later', 'done'] as const
const records: Task[] = [
  makeTask('future-8', { dueDate: '2026-09-29' }),
  makeTask('done-old', { status: 'done', dueDate: '2020-01-01' }),
  makeTask('edge-7', { status: 'in_progress', dueDate: '2026-09-28' }),
  makeTask('today/č', { title: 'Enako, "čšž" <besedilo>', dueDate: '2026-09-21' }),
  makeTask('past', { status: 'in_progress', dueDate: '2026-09-20' }),
  makeTask('day-1', { dueDate: '2026-09-22' }),
  makeTask('done-today', { status: 'done', dueDate: '2026-09-21' }),
  makeTask('done-future', { status: 'done', dueDate: '2028-02-29' }),
  makeTask('past-2', { dueDate: '2025-12-31' }),
  makeTask('day-4', { status: 'in_progress', dueDate: '2026-09-25' }),
  makeTask('future-2', { status: 'in_progress', dueDate: '2026-10-01' }),
  makeTask('day-7b', { dueDate: '2026-09-28' }),
  makeTask('future-3', { title: 'Enako, "čšž" <besedilo>', dueDate: '2028-02-29' }),
]
const expectedGroups = {
  overdue: ['past', 'past-2'], today: ['today/č'], week: ['edge-7', 'day-1', 'day-4', 'day-7b'],
  later: ['future-8', 'future-2', 'future-3'], done: ['done-old', 'done-today', 'done-future'],
}

async function counts(page: Page, expected: number[]) {
  for (const [index, group] of groups.entries()) await expect(page.getByLabel(`Število rokov ${group}`, { exact: true })).toHaveText(String(expected[index]))
}

test('A01: all groups, stable IDs, global counts, read-only details and board parity', async ({ page }) => {
  const writes = await mount(page, records)
  const controls: string[] = []
  page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/__test/')) controls.push(request.url()) })
  await expectIds(page, records.map(task => task.id))
  await counts(page, [2, 1, 4, 3, 3])
  for (const group of groups) {
    await select(page, 'Pogled rokov', group)
    await expectIds(page, expectedGroups[group])
    await counts(page, [2, 1, 4, 3, 3])
    await board(page)
    await expectIds(page, expectedGroups[group], false)
    for (const [status, name] of [['todo', 'Pripravljeno'], ['in_progress', 'V delu'], ['done', 'Končano']]) {
      await columnIds(page, name, records.filter(task => task.status === status && expectedGroups[group].includes(task.id)).map(task => task.id))
    }
    await table(page)
  }
  await select(page, 'Pogled rokov', 'today')
  await page.locator('[data-task-id="today/č"]').getByRole('link').click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: 'Enako, "čšž" <besedilo>', exact: true })).toBeVisible()
  await expect(dialog).toContainText('Opis opravila today/č')
  await expect(dialog).toContainText('Ana Novak')
  await expect(dialog.locator('time')).toHaveAttribute('datetime', '2026-09-21')
  await page.keyboard.press('Escape')
  await expect(page.getByLabel('Pogled rokov')).toHaveValue('today')
  await select(page, 'Pogled rokov', 'all')
  await expectIds(page, records.map(task => task.id))
  expect(controls).toEqual([])
  await readonly(page, writes)
  await page.evaluate(() => { window.scrollTo(0, 0); if (document.activeElement instanceof HTMLElement) document.activeElement.blur() })
  await page.screenshot({ path: 'test-results/agent-desktop.png', fullPage: true })
})

test('A02: last valid date and filter survive empty draft and view switches', async ({ page }) => {
  await mount(page, records)
  const date = page.getByLabel('Referenčni datum', { exact: true })
  await select(page, 'Pogled rokov', 'today')
  await date.fill('2026-09-28')
  await expectIds(page, ['edge-7', 'day-7b'])
  await counts(page, [5, 2, 2, 1, 3])
  await date.fill('')
  await expect(page.getByRole('alert')).toHaveText('Vnesi veljaven referenčni datum.')
  await expect(date).toHaveAttribute('aria-invalid', 'true')
  await board(page)
  await expectIds(page, ['edge-7', 'day-7b'], false)
  await expect(date).toHaveValue('')
  await expect(page.getByLabel('Pogled rokov')).toHaveValue('today')
  await select(page, 'Pogled rokov', 'week')
  await expectIds(page, ['future-8', 'future-2'], false)
  await table(page)
  await expect(date).toHaveValue('')
  await expectIds(page, ['future-8', 'future-2'])
  await date.fill('2026-09-21')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.getByLabel('Pogled rokov')).toHaveValue('week')
  await expectIds(page, expectedGroups.week)
})

test('A03: fixed initial date, project reset, reload in both views and no persistent filter', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2034-05-16T12:00:00Z'))
  await mount(page, [...records, makeTask('launch-one', { projectId: 'launch' })])
  const date = page.getByLabel('Referenčni datum', { exact: true })
  const filter = page.getByLabel('Pogled rokov', { exact: true })
  const storage = () => page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }))
  const originalStorage = await storage()
  await expect(date).toHaveValue('2026-09-21')
  await expect(filter).toHaveValue('all')
  await date.fill('2028-02-29')
  await select(page, 'Pogled rokov', 'later')
  await board(page)
  expect(await storage()).toEqual(originalStorage)
  expect(new URL(page.url()).hash).toBe('#/projects/web?view=board')
  await project(page, 'launch')
  await expect(date).toHaveValue('2026-09-21')
  await expect(filter).toHaveValue('all')
  await project(page, 'web')
  await expect(date).toHaveValue('2026-09-21')
  await expect(filter).toHaveValue('all')
  for (const view of ['board', 'table']) {
    if (view === 'table') await table(page)
    await date.fill('')
    await select(page, 'Pogled rokov', 'done')
    await page.reload()
    await expect(date).toHaveValue('2026-09-21')
    await expect(filter).toHaveValue('all')
    await expect(page.getByRole('alert')).toHaveCount(0)
    await expectIds(page, records.map(task => task.id), view === 'table')
  }
})

test('A04: empty project, single task, empty group and mobile containment', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mount(page, [makeTask('single')])
  await counts(page, [0, 1, 0, 0, 0])
  await select(page, 'Pogled rokov', 'week')
  await expect(page.getByText('Ni opravil v izbrani skupini.', { exact: true })).toBeVisible()
  await expectIds(page, [])
  await board(page)
  await expect(page.getByText('Ni opravil v izbrani skupini.', { exact: true })).toBeVisible()
  await select(page, 'Pogled rokov', 'all')
  await expectIds(page, ['single'])
  await page.screenshot({ path: 'test-results/agent-mobile-board.png', fullPage: true })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  await table(page)
  await page.screenshot({ path: 'test-results/agent-mobile-table.png', fullPage: true })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  await project(page, 'launch')
  await counts(page, [0, 0, 0, 0, 0])
  await expect(page.getByText('V tem projektu še ni opravil')).toBeVisible()
  await board(page)
  for (const name of ['Pripravljeno', 'V delu', 'Končano']) await columnIds(page, name, [])
  await select(page, 'Pogled rokov', 'done')
  await counts(page, [0, 0, 0, 0, 0])
})

for (const timezoneId of ['UTC', 'Europe/Ljubljana', 'America/New_York']) {
  test(`A05: calendar boundaries and DST in ${timezoneId}`, async ({ browser }) => {
    const context = await browser.newContext({ timezoneId, baseURL: 'http://127.0.0.1:5174' })
    try {
      const cases = [
        ['2026-01-28', '2026-01-29', '2026-02-04', '2026-02-05'],
        ['2027-12-28', '2027-12-29', '2028-01-04', '2028-01-05'],
        ['2028-02-28', '2028-02-29', '2028-03-06', '2028-03-07'],
        ['2026-03-26', '2026-03-27', '2026-04-02', '2026-04-03'],
        ['2026-10-23', '2026-10-24', '2026-10-30', '2026-10-31'],
        ['2026-03-05', '2026-03-06', '2026-03-12', '2026-03-13'],
        ['2026-10-29', '2026-10-30', '2026-11-05', '2026-11-06'],
      ]
      for (const [anchor, next, seventh, eighth] of cases) {
        const page = await context.newPage()
        await mount(page, [makeTask('seventh', { dueDate: seventh }), makeTask('eighth', { dueDate: eighth }), makeTask('next', { dueDate: next }), makeTask('anchor', { dueDate: anchor })])
        await page.getByLabel('Referenčni datum', { exact: true }).fill(anchor)
        await counts(page, [0, 1, 2, 1, 0])
        await select(page, 'Pogled rokov', 'week')
        await expectIds(page, ['seventh', 'next'])
        await select(page, 'Pogled rokov', 'later')
        await expectIds(page, ['eighth'])
        await page.close()
      }
    } finally {
      await context.close()
    }
  })
}
