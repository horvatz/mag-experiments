import { test, expect, type Page } from '@playwright/test'
import { calendarDay, groupDeadlines, type DeadlineGroup } from '../../src/deadlines.ts'
import { board, columnIds, expectIds, makeTask, mount, project, readonly, select, summary, table, type Task } from '../development/helpers.ts'

const keys: DeadlineGroup[] = ['overdue', 'today', 'week', 'later', 'done']
const records: Task[] = [
  makeTask('rok-ζ', { dueDate: '2026-09-29' }),
  makeTask('isti-b', { status: 'in_progress' }),
  makeTask('koncano-staro', { status: 'done', dueDate: '2024-02-29' }),
  makeTask('z-7', { status: 'in_progress', dueDate: '2026-09-28' }),
  makeTask('prej-2', { dueDate: '2026-09-20' }),
  makeTask('koncano-danes', { status: 'done' }),
  makeTask('z-1', { dueDate: '2026-09-22' }),
  makeTask('prej-1', { status: 'in_progress', dueDate: '2000-02-29' }),
  makeTask('z-6', { dueDate: '2026-09-27' }),
  makeTask('danes-2'),
  makeTask('koncano-pozneje', { status: 'done', dueDate: '2032-02-29' }),
  makeTask('pozneje-2', { dueDate: '2027-01-01' }),
  makeTask('koncano-teden', { status: 'done', dueDate: '2026-09-24' }),
  makeTask('prej-3', { dueDate: '2026-09-19' }),
  makeTask('z-2', { status: 'in_progress', dueDate: '2026-09-23' }),
].map(task => ({ ...task, title: 'Enak naslov — čšž, "<zapis>"', description: 'Prva vrstica\nDruga vrstica; <b>navadno besedilo</b> 🌿', assignee: 'Živa Črt' }))

const expectedGroups: Record<DeadlineGroup, string[]> = {
  overdue: ['prej-2', 'prej-1', 'prej-3'],
  today: ['isti-b', 'danes-2'],
  week: ['z-7', 'z-1', 'z-6', 'z-2'],
  later: ['rok-ζ', 'pozneje-2'],
  done: ['koncano-staro', 'koncano-danes', 'koncano-pozneje', 'koncano-teden'],
}

async function expectCounts(page: Page, counts: number[]) {
  for (const [index, key] of keys.entries()) {
    await expect(page.getByLabel(`Število rokov ${key}`, { exact: true })).toHaveText(String(counts[index]))
  }
}

test('A01: calendar boundaries, leap centuries and disjoint complete groups', () => {
  const examples = [
    ['2026-09-21', '2026-09-20', '2026-09-21', '2026-09-22', '2026-09-28', '2026-09-29'],
    ['2026-01-28', '2026-01-27', '2026-01-28', '2026-01-29', '2026-02-04', '2026-02-05'],
    ['2026-12-28', '2026-12-27', '2026-12-28', '2026-12-29', '2027-01-04', '2027-01-05'],
    ['2024-02-23', '2024-02-22', '2024-02-23', '2024-02-24', '2024-03-01', '2024-03-02'],
    ['2024-02-29', '2024-02-28', '2024-02-29', '2024-03-01', '2024-03-07', '2024-03-08'],
    ['1900-02-23', '1900-02-22', '1900-02-23', '1900-02-24', '1900-03-02', '1900-03-03'],
    ['2000-02-23', '2000-02-22', '2000-02-23', '2000-02-24', '2000-03-01', '2000-03-02'],
    ['0099-12-28', '0099-12-27', '0099-12-28', '0099-12-29', '0100-01-04', '0100-01-05'],
  ]
  for (const [reference, ...dates] of examples) {
    const tasks = dates.flatMap((dueDate, index) => [
      makeTask(`open-${index}`, { dueDate, status: index % 2 ? 'todo' : 'in_progress' }),
      makeTask(`done-${index}`, { dueDate, status: 'done' }),
    ])
    const groups = groupDeadlines(tasks, reference)
    expect(Object.fromEntries(keys.map(key => [key, groups[key].map(task => task.id)]))).toEqual({
      overdue: ['open-0'], today: ['open-1'], week: ['open-2', 'open-3'], later: ['open-4'],
      done: ['done-0', 'done-1', 'done-2', 'done-3', 'done-4'],
    })
    expect(new Set(Object.values(groups).flat().map(task => task.id)).size).toBe(tasks.length)
    expect(Object.values(groups).flat()).toHaveLength(tasks.length)
  }
  for (const value of ['', '2026-02-29', '1900-02-29', '2026-04-31', '2026-13-01', '2026-2-01', '0000-01-01']) expect(calendarDay(value)).toBeNull()
  for (const value of ['2024-02-29', '2000-02-29', '0001-01-01', '9999-12-31']) expect(calendarDay(value)).not.toBeNull()
  expect(calendarDay('2024-03-01')! - calendarDay('2024-02-28')!).toBe(2)
})

test('A02: all groups preserve IDs, source order, project counts and read-only details', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2042-01-17T12:00:00Z'))
  const writes = await mount(page, records)
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov' })).toHaveValue('all')
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveAttribute('type', 'date')
  await expectIds(page, records.map(task => task.id))
  const baselineData = structuredClone(records)
  for (const key of keys) {
    await select(page, 'Pogled rokov', key)
    await expectIds(page, expectedGroups[key])
    await expectCounts(page, [3, 2, 4, 2, 4])
    await summary(page, [7, 4, 4])
    await board(page)
    await expectIds(page, expectedGroups[key], false)
    for (const [status, name] of [['todo', 'Pripravljeno'], ['in_progress', 'V delu'], ['done', 'Končano']]) {
      await columnIds(page, name, records.filter(task => task.status === status && expectedGroups[key].includes(task.id)).map(task => task.id))
    }
    await expectCounts(page, [3, 2, 4, 2, 4])
    await table(page)
  }
  await select(page, 'Pogled rokov', 'later')
  const link = page.locator('[data-task-id="rok-ζ"]').getByRole('link')
  await link.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: records[0].title })).toBeVisible()
  await expect(dialog.locator('.description p')).toHaveText(records[0].description)
  await expect(dialog.locator('time')).toHaveAttribute('datetime', '2026-09-29')
  await expect(dialog.getByText('Živa Črt', { exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(link).toBeFocused()
  await expect(page.getByRole('combobox', { name: 'Pogled rokov' })).toHaveValue('later')
  await select(page, 'Pogled rokov', 'all')
  await expectIds(page, records.map(task => task.id))
  expect(await page.locator('tbody time').evaluateAll(nodes => nodes.map(node => node.getAttribute('datetime')))).toEqual(records.map(task => task.dueDate))
  expect(records).toEqual(baselineData)
  await readonly(page, writes)
})

test('A03: changed anchor and empty draft survive views while counters retain last valid result', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page, records)
  const date = page.getByLabel('Referenčni datum', { exact: true })
  await select(page, 'Pogled rokov', 'week')
  await date.fill('2026-09-22')
  await expectIds(page, ['rok-ζ', 'z-7', 'z-6', 'z-2'])
  await expectCounts(page, [5, 1, 4, 1, 4])
  await date.fill('')
  await expect(page.getByRole('alert')).toHaveText('Vnesi veljaven referenčni datum.')
  await expect(date).toHaveAttribute('aria-invalid', 'true')
  await expect(date).toHaveAttribute('aria-describedby', 'reference-date-error')
  await board(page)
  await expect(date).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov' })).toHaveValue('week')
  await expectIds(page, ['rok-ζ', 'z-7', 'z-6', 'z-2'], false)
  await expectCounts(page, [5, 1, 4, 1, 4])
  await readonly(page, writes)
  await select(page, 'Pogled rokov', 'today')
  await expectIds(page, ['z-1'])
  await table(page)
  await expect(date).toHaveValue('')
  await expect(page.getByRole('alert')).toBeVisible()
  await expectIds(page, ['z-1'])
  await date.fill('2026-09-28')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(date).toHaveAttribute('aria-invalid', 'false')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov' })).toHaveValue('today')
  await expectIds(page, ['z-7'])
  await expectCounts(page, [8, 1, 1, 1, 4])
  await readonly(page, writes)
})

test('A04: both empty projects have zero counts and both views recover from empty groups', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page, [])
  for (const id of ['web', 'launch'] as const) {
    await project(page, id)
    for (const filter of ['all', ...keys]) {
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
  await readonly(page, writes)
  await mount(page, [makeTask('edino-č', { status: 'done', dueDate: '2024-02-29' })])
  await select(page, 'Pogled rokov', 'overdue')
  await expect(page.getByText('Ni opravil v izbrani skupini.', { exact: true })).toBeVisible()
  await expectCounts(page, [0, 0, 0, 0, 1])
  await expectIds(page, [])
  await board(page)
  await expect(page.getByText('Ni opravil v izbrani skupini.', { exact: true })).toBeVisible()
  await expectIds(page, [])
  await select(page, 'Pogled rokov', 'done')
  await expectIds(page, ['edino-č'])
  await expect(page.getByText('Ni opravil v izbrani skupini.', { exact: true })).toHaveCount(0)
  await table(page)
  await select(page, 'Pogled rokov', 'today')
  await expect(page.getByText('Ni opravil v izbrani skupini.', { exact: true })).toBeVisible()
  await select(page, 'Pogled rokov', 'all')
  await expectIds(page, ['edino-č'])
  await readonly(page, writes)
})

test('A05: navigation and reload reset local date/filter without persistence', async ({ page }) => {
  const writes = await mount(page, [...records, makeTask('drug-id', { projectId: 'launch' })])
  const initialStorage = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }))
  const initialUrl = page.url()
  const date = page.getByLabel('Referenčni datum', { exact: true })
  const filter = page.getByRole('combobox', { name: 'Pogled rokov' })
  await date.fill('2000-02-29')
  await select(page, 'Pogled rokov', 'later')
  expect(page.url()).toBe(initialUrl)
  await board(page)
  await expect(date).toHaveValue('2000-02-29')
  await project(page, 'launch')
  await expect(date).toHaveValue('2026-09-21')
  await expect(filter).toHaveValue('all')
  await expectCounts(page, [0, 1, 0, 0, 0])
  await date.fill('')
  await select(page, 'Pogled rokov', 'done')
  await expect(page.getByRole('alert')).toBeVisible()
  await project(page, 'web')
  await expect(date).toHaveValue('2026-09-21')
  await expect(filter).toHaveValue('all')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await date.fill('2024-02-29')
  await select(page, 'Pogled rokov', 'overdue')
  await date.fill('')
  await page.reload()
  await expect(date).toHaveValue('2026-09-21')
  await expect(filter).toHaveValue('all')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.getByRole('region', { name: 'Tabla opravil' })).toBeVisible()
  await expectIds(page, records.map(task => task.id), false)
  expect(new URL(page.url()).hash).toBe('#/projects/web?view=board')
  expect(await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }))).toEqual(initialStorage)
  await readonly(page, writes)
})

for (const timezoneId of ['America/Los_Angeles', 'Europe/Ljubljana', 'Pacific/Kiritimati']) {
  test(`A06: calendar boundaries across DST in ${timezoneId}`, async ({ browser }) => {
    const context = await browser.newContext({ timezoneId, viewport: { width: 390, height: 844 } })
    const page = await context.newPage()
    try {
      const cases = [
        ['2026-03-07', '2026-03-08', '2026-03-14', '2026-03-15'],
        ['2026-03-28', '2026-03-29', '2026-04-04', '2026-04-05'],
        ['2026-10-24', '2026-10-25', '2026-10-31', '2026-11-01'],
        ['2026-10-31', '2026-11-01', '2026-11-07', '2026-11-08'],
        ['2024-02-23', '2024-02-24', '2024-03-01', '2024-03-02'],
        ['2026-12-28', '2026-12-29', '2027-01-04', '2027-01-05'],
      ]
      const tasks = cases.flatMap(([anchor, next, seventh, eighth], index) => [
        makeTask(`today-${index}`, { dueDate: anchor }),
        makeTask(`next-${index}`, { dueDate: next }),
        makeTask(`seventh-${index}`, { dueDate: seventh }),
        makeTask(`eighth-${index}`, { dueDate: eighth }),
      ])
      const writes = await mount(page, tasks)
      await select(page, 'Pogled rokov', 'week')
      for (const [index, [anchor]] of cases.entries()) {
        await page.getByLabel('Referenčni datum', { exact: true }).fill(anchor)
        // The autumn cases overlap: the second anchor is also the first seventh day.
        const expected = index === 2 ? ['next-2', 'seventh-2', 'today-3'] : index === 3 ? ['eighth-2', 'next-3', 'seventh-3'] : [`next-${index}`, `seventh-${index}`]
        await expectIds(page, expected)
        await board(page)
        await expectIds(page, expected)
        await table(page)
      }
      await readonly(page, writes)
    } finally {
      await context.close()
    }
  })
}
