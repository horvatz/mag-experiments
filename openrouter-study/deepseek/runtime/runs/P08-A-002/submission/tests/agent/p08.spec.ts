import { test, expect, mount, select, expectIds, board, table, readonly, makeTask, webIds, project } from '../development/helpers.ts'
import { classifyTask, countGroups, filterTasks, parseCalendarDate, REFERENCE_DATE, type DeadlineGroup } from '../../src/deadlines.ts'

const counter = (page: import('@playwright/test').Page, key: DeadlineGroup) => page.getByLabel(`Število rokov ${key}`, { exact: true })
const dateInput = (page: import('@playwright/test').Page) => page.getByLabel('Referenčni datum', { exact: true })
const groupSelect = (page: import('@playwright/test').Page) => page.getByRole('combobox', { name: 'Pogled rokov', exact: true })

test('A00: koledarska logika prek meja meseca, leta in prestopnega februarja', async () => {
  expect(REFERENCE_DATE).toBe('2026-09-21')
  expect(parseCalendarDate('2026-09-21')).not.toBeNull()
  expect(parseCalendarDate('')).toBeNull()
  expect(parseCalendarDate('2026-02-30')).toBeNull()
  expect(parseCalendarDate('2026-13-01')).toBeNull()
  expect(parseCalendarDate('2027-02-29')).toBeNull()
  expect(parseCalendarDate('2028-02-29')).not.toBeNull()
  expect(parseCalendarDate('2028-03-01')! - parseCalendarDate('2028-02-28')!).toBe(2)
  expect(parseCalendarDate('2027-01-01')! - parseCalendarDate('2026-12-31')!).toBe(1)

  const ref = '2028-02-25'
  const at = (dueDate: string) => classifyTask(makeTask('x', { dueDate }), ref)
  expect(at('2028-02-24')).toBe('overdue')
  expect(at('2028-02-25')).toBe('today')
  expect(at('2028-02-26')).toBe('week')
  expect(at('2028-02-29')).toBe('week')
  expect(at('2028-03-03')).toBe('week')
  expect(at('2028-03-04')).toBe('later')
  expect(classifyTask(makeTask('d', { dueDate: '2028-02-24', status: 'done' }), ref)).toBe('done')
  expect(classifyTask(makeTask('d', { dueDate: '2028-03-30', status: 'done' }), ref)).toBe('done')

  const yearRef = '2026-12-28'
  const yearAt = (dueDate: string) => classifyTask(makeTask('x', { dueDate }), yearRef)
  expect(yearAt('2026-12-27')).toBe('overdue')
  expect(yearAt('2026-12-28')).toBe('today')
  expect(yearAt('2027-01-04')).toBe('week')
  expect(yearAt('2027-01-05')).toBe('later')
})

test('A01: začetni datum, privzeti pogled all in izvorni vrstni red', async ({ page }) => {
  await mount(page)
  await expect(dateInput(page)).toHaveValue('2026-09-21')
  await expect(groupSelect(page)).toHaveValue('all')
  await expectIds(page, webIds())
  for (const key of ['overdue', 'today', 'week', 'later', 'done'] as DeadlineGroup[]) await expect(counter(page, key)).toBeVisible()
})

test('A02: meje skupin, pet števcev, done in brez zapisov', async ({ page }) => {
  const writes = await mount(page)
  await expect(counter(page, 'overdue')).toHaveText('2')
  await expect(counter(page, 'today')).toHaveText('0')
  await expect(counter(page, 'week')).toHaveText('2')
  await expect(counter(page, 'later')).toHaveText('2')
  await expect(counter(page, 'done')).toHaveText('2')
  await select(page, 'Pogled rokov', 'week')
  await expectIds(page, ['web-02', 'web-04'])
  await select(page, 'Pogled rokov', 'overdue')
  await expectIds(page, ['web-01', 'web-07'])
  await select(page, 'Pogled rokov', 'done')
  await expectIds(page, ['web-03', 'web-06'])
  await expect(counter(page, 'overdue')).toHaveText('2')
  await expect(counter(page, 'week')).toHaveText('2')
  await readonly(page, writes)
})

test('A03: prestopni februar in meja leta skozi vmesnik', async ({ page }) => {
  await mount(page, [
    makeTask('a', { dueDate: '2028-02-24' }),
    makeTask('b', { dueDate: '2028-02-25' }),
    makeTask('c', { dueDate: '2028-02-29' }),
    makeTask('d', { dueDate: '2028-03-03' }),
    makeTask('e', { dueDate: '2028-03-04' }),
    makeTask('y1', { dueDate: '2026-12-31' }),
    makeTask('y2', { dueDate: '2027-01-04' }),
    makeTask('y3', { dueDate: '2027-01-05' }),
    makeTask('y4', { dueDate: '2026-12-28' }),
  ])
  await dateInput(page).fill('2028-02-25')
  await expect(counter(page, 'overdue')).toHaveText('5')
  await expect(counter(page, 'today')).toHaveText('1')
  await expect(counter(page, 'week')).toHaveText('2')
  await expect(counter(page, 'later')).toHaveText('1')
  await select(page, 'Pogled rokov', 'week')
  await expectIds(page, ['c', 'd'])
  await dateInput(page).fill('2026-12-28')
  await expect(counter(page, 'today')).toHaveText('1')
  await expect(counter(page, 'week')).toHaveText('2')
  await expectIds(page, ['y1', 'y2'])
})

test('A04: prazno polje ohrani zadnji izračun in filter', async ({ page }) => {
  await mount(page)
  await select(page, 'Pogled rokov', 'overdue')
  await dateInput(page).fill('')
  await expect(page.getByRole('alert')).toContainText('Vnesi veljaven referenčni datum.')
  await expectIds(page, ['web-01', 'web-07'])
  await expect(groupSelect(page)).toHaveValue('overdue')
  await dateInput(page).fill('2026-09-20')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expectIds(page, ['web-01'])
  await expect(counter(page, 'today')).toHaveText('1')
  await expect(counter(page, 'later')).toHaveText('3')
})

test('A05: preglednica in tabla prikažeta iste filtrirane ID-je ter ohranita stanje', async ({ page }) => {
  await mount(page)
  await select(page, 'Pogled rokov', 'week')
  await expectIds(page, ['web-02', 'web-04'])
  await board(page)
  await expectIds(page, ['web-02', 'web-04'])
  await expect(dateInput(page)).toHaveValue('2026-09-21')
  await expect(groupSelect(page)).toHaveValue('week')
  await dateInput(page).fill('2026-09-19')
  await expectIds(page, ['web-02', 'web-07'])
  await table(page)
  await expectIds(page, ['web-02', 'web-07'])
  await expect(dateInput(page)).toHaveValue('2026-09-19')
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('A06: menjava projekta in osvežitev ponastavita datum in skupino', async ({ page }) => {
  await mount(page)
  await dateInput(page).fill('2026-09-25')
  await select(page, 'Pogled rokov', 'done')
  await project(page, 'launch')
  await expect(dateInput(page)).toHaveValue('2026-09-21')
  await expect(groupSelect(page)).toHaveValue('all')
  await expectIds(page, ['launch-01', 'launch-02'])
  await project(page, 'web')
  await expect(dateInput(page)).toHaveValue('2026-09-21')
  await dateInput(page).fill('2026-09-20')
  await select(page, 'Pogled rokov', 'today')
  await page.reload()
  await expect(dateInput(page)).toHaveValue('2026-09-21')
  await expect(groupSelect(page)).toHaveValue('all')
  expect(page.url()).not.toContain('2026-09-20')
  expect(page.url()).not.toContain('today')
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0)
})

test('A07: prazen projekt da pet ničel in prazen prikaz', async ({ page }) => {
  await mount(page, [])
  for (const key of ['overdue', 'today', 'week', 'later', 'done'] as DeadlineGroup[]) await expect(counter(page, key)).toHaveText('0')
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
})

test('A08: prazna skupina v nepraznem projektu pokaže sporočilo in omogoči preklop', async ({ page }) => {
  await mount(page)
  await select(page, 'Pogled rokov', 'today')
  await expect(page.getByRole('heading', { name: 'Ni opravil v izbrani skupini.' })).toBeVisible()
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Ni opravil v izbrani skupini.' })).toBeVisible()
  await page.getByRole('button', { name: 'Prikaži vse roke' }).click()
  await page.getByRole('button', { name: 'Preglednica', exact: true }).click()
  await expectIds(page, webIds())
})

test('A09: countGroups in filterTasks sta disjunktna in pokrijeta vsa opravila', async () => {
  const tasks = [
    makeTask('1', { dueDate: '2026-09-20' }),
    makeTask('2', { dueDate: '2026-09-21' }),
    makeTask('3', { dueDate: '2026-09-28' }),
    makeTask('4', { dueDate: '2026-09-29' }),
    makeTask('5', { dueDate: '2026-09-21', status: 'done' }),
  ]
  const counts = countGroups(tasks, REFERENCE_DATE)
  expect(counts).toEqual({ overdue: 1, today: 1, week: 1, later: 1, done: 1 })
  const all = filterTasks(tasks, REFERENCE_DATE, 'all')
  expect(all).toHaveLength(5)
  const union = (['overdue', 'today', 'week', 'later', 'done'] as DeadlineGroup[]).flatMap((group) => filterTasks(tasks, REFERENCE_DATE, group))
  expect(union).toHaveLength(5)
  expect(new Set(union.map((task) => task.id)).size).toBe(5)
})
