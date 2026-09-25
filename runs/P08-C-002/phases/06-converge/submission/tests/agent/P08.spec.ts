import { test, expect, type Page } from '@playwright/test'
import { mount, makeTask, select, expectIds, board, table, project, readonly, examples, webIds } from '../development/helpers.ts'

const keys = ['overdue', 'today', 'week', 'later', 'done'] as const
const anchor = (page: Page) => page.getByLabel('Referenčni datum', { exact: true })
const filter = (page: Page) => page.getByRole('combobox', { name: 'Pogled rokov', exact: true })
async function counts(page: Page, values: number[]) {
  for (const [i, key] of keys.entries()) await expect(page.getByLabel(`Število rokov ${key}`, { exact: true })).toHaveText(String(values[i]))
}

const mixed = [
  makeTask('z-later', { dueDate: '2026-09-29' }),
  makeTask('done-past', { dueDate: '2000-01-01', status: 'done' }),
  makeTask('a-today', { status: 'in_progress' }),
  makeTask('u-seven', { dueDate: '2026-09-28' }),
  makeTask('y-overdue', { dueDate: '2026-09-20' }),
  makeTask('m-next', { dueDate: '2026-09-22', status: 'in_progress' }),
  makeTask('done-today', { status: 'done' }),
  makeTask('x-overdue', { dueDate: '2019-12-31' }),
  makeTask('b-today'),
  makeTask('f-later', { dueDate: '2030-01-01', status: 'in_progress' }),
  makeTask('done-future', { dueDate: '2031-01-01', status: 'done' }),
  makeTask('q-week', { dueDate: '2026-09-25' }),
].map(t => ({ ...t, title: 'Enak naslov; čšž "Folio"' }))

test('A01: fixed date, complete disjoint groups, stable order and full counts', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2042-07-04T12:00:00Z'))
  const writes = await mount(page, mixed)
  await expect(anchor(page)).toHaveValue('2026-09-21')
  await expect(filter(page)).toHaveValue('all')
  await expectIds(page, webIds(mixed))
  const before = await page.locator('tbody tr').allTextContents()
  const groups = {
    overdue: ['y-overdue', 'x-overdue'], today: ['a-today', 'b-today'],
    week: ['u-seven', 'm-next', 'q-week'], later: ['z-later', 'f-later'],
    done: ['done-past', 'done-today', 'done-future'],
  }
  const seen: string[] = []
  for (const key of keys) {
    await select(page, 'Pogled rokov', key)
    await expectIds(page, groups[key])
    await counts(page, [2, 2, 3, 2, 3])
    seen.push(...groups[key])
    await board(page)
    await expectIds(page, groups[key], false)
    for (const status of ['todo', 'in_progress', 'done']) {
      const expected = mixed.filter(t => groups[key].includes(t.id) && t.status === status).map(t => t.id)
      await expect(page.locator(`.board-${status} [data-task-id]`)).toHaveCount(expected.length)
      expect(await page.locator(`.board-${status} [data-task-id]`).evaluateAll(nodes => nodes.map(n => n.getAttribute('data-task-id')))).toEqual(expected)
    }
    await table(page)
  }
  expect(new Set(seen).size).toBe(mixed.length)
  expect(seen.sort()).toEqual(webIds(mixed).sort())
  await select(page, 'Pogled rokov', 'all')
  await expectIds(page, webIds(mixed))
  expect(await page.locator('tbody tr').allTextContents()).toEqual(before)
  await readonly(page, writes)
})

for (const timezoneId of ['America/Los_Angeles', 'Europe/Ljubljana', 'Pacific/Kiritimati']) {
  test.describe(timezoneId, () => {
    test.use({ timezoneId })
    test('A02: calendar boundaries across month, year, leap February and DST', async ({ page }) => {
      const cases = [
        ['2026-04-29', '2026-04-30', '2026-05-06', '2026-05-07'],
        ['2026-12-28', '2026-12-29', '2027-01-04', '2027-01-05'],
        ['2028-02-23', '2028-02-29', '2028-03-01', '2028-03-02'],
        ['2026-03-25', '2026-03-29', '2026-04-01', '2026-04-02'],
        ['2026-03-04', '2026-03-08', '2026-03-11', '2026-03-12'],
      ]
      for (const [reference, inside, seventh, eighth] of cases) {
        // A same-hash navigation does not reload the previous fixture's data.
        await page.goto('about:blank')
        await mount(page, [
          makeTask('eighth', { dueDate: eighth }), makeTask('inside', { dueDate: inside }),
          makeTask('seventh', { dueDate: seventh }), makeTask('today', { dueDate: reference }),
        ])
        await anchor(page).fill(reference)
        await counts(page, [0, 1, 2, 1, 0])
        await select(page, 'Pogled rokov', 'week')
        await expectIds(page, ['inside', 'seventh'])
        await select(page, 'Pogled rokov', 'later')
        await expectIds(page, ['eighth'])
      }
    })
  })
}

test('A03: valid and empty dates retain active filter across both views', async ({ page }) => {
  const writes = await mount(page)
  await select(page, 'Pogled rokov', 'week')
  await anchor(page).fill('2026-09-28')
  await expect(filter(page)).toHaveValue('week')
  await expectIds(page, ['web-05', 'web-08'])
  await counts(page, [3, 1, 2, 0, 2])
  await anchor(page).fill('')
  await expect(page.getByRole('alert')).toHaveText('Vnesi veljaven referenčni datum.')
  await board(page)
  await expectIds(page, ['web-05', 'web-08'], false)
  await expect(anchor(page)).toHaveValue('')
  await expect(filter(page)).toHaveValue('week')
  await counts(page, [3, 1, 2, 0, 2])
  await table(page)
  await expectIds(page, ['web-05', 'web-08'])
  await expect(anchor(page)).toHaveValue('')
  await anchor(page).fill('2026-09-20')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(filter(page)).toHaveValue('week')
  await expectIds(page, ['web-02'])
  await board(page)
  await expect(anchor(page)).toHaveValue('2026-09-20')
  await expectIds(page, ['web-02'])
  await readonly(page, writes)
})

test('A04: project changes and reload reset filters without storage or URL state', async ({ page }) => {
  await mount(page)
  await anchor(page).fill('2028-02-29')
  await select(page, 'Pogled rokov', 'done')
  await board(page)
  await expect(page).toHaveURL(/#\/projects\/web\?view=board$/)
  expect(await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }))).toEqual({ local: {}, session: {} })
  await project(page, 'launch')
  await expect(anchor(page)).toHaveValue('2026-09-21')
  await expect(filter(page)).toHaveValue('all')
  await expectIds(page, ['launch-01', 'launch-02'], false)
  await counts(page, [0, 0, 1, 0, 1])
  await project(page, 'web')
  await expect(anchor(page)).toHaveValue('2026-09-21')
  await expect(filter(page)).toHaveValue('all')
  await anchor(page).fill('')
  await select(page, 'Pogled rokov', 'done')
  await page.reload()
  await expect(anchor(page)).toHaveValue('2026-09-21')
  await expect(filter(page)).toHaveValue('all')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expectIds(page, webIds(), false)
})

test('A05: empty projects and single-task empty groups stay usable in both views', async ({ page }) => {
  await mount(page, [])
  await counts(page, [0, 0, 0, 0, 0])
  await expectIds(page, [])
  await board(page)
  await counts(page, [0, 0, 0, 0, 0])
  await project(page, 'launch')
  await counts(page, [0, 0, 0, 0, 0])
  await mount(page, [makeTask('only', { dueDate: '2026-09-21' })])
  await counts(page, [0, 1, 0, 0, 0])
  await select(page, 'Pogled rokov', 'overdue')
  await expectIds(page, [])
  await expect(page.getByText('Ni opravil v izbrani skupini.', { exact: true })).toBeVisible()
  await board(page)
  await expect(page.getByText('Ni opravil v izbrani skupini.', { exact: true })).toBeVisible()
  await select(page, 'Pogled rokov', 'all')
  await expectIds(page, ['only'])
  await expect(page.getByText('Ni opravil v izbrani skupini.', { exact: true })).toHaveCount(0)
  await table(page)
  await expectIds(page, ['only'])
})

test('A06: 390px Folio, Unicode details, accessible controls and no writes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const record = makeTask('unicode-ž', { title: 'Čšž, "citat" <besedilo>', description: 'Prva vrstica\nDruga vrstica; čšž & <p>', assignee: 'Živa Črt', dueDate: '2028-02-29' })
  const writes = await mount(page, [record, ...examples])
  await expect(anchor(page)).toHaveAttribute('type', 'date')
  expect(await filter(page).locator('option').evaluateAll(nodes => nodes.map(n => (n as HTMLOptionElement).value))).toEqual(['all', ...keys])
  await expect(page.getByLabel('Pregled stanj opravil', { exact: true })).toBeVisible()
  await select(page, 'Pogled rokov', 'later')
  await readonly(page, writes)
  await page.screenshot({ path: 'docs/agent/P08/mobile-table.png', fullPage: true })
  await board(page)
  await readonly(page, writes)
  await page.screenshot({ path: 'docs/agent/P08/mobile-board.png', fullPage: true })
  await page.locator('[data-task-id="unicode-ž"]').getByRole('link').click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('heading', { name: record.title, exact: true })).toBeVisible()
  await expect(dialog.locator('.description p')).toHaveText(record.description)
  await expect(dialog.locator('time')).toHaveAttribute('datetime', '2028-02-29')
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(filter(page)).toHaveValue('later')
  await readonly(page, writes)
})
