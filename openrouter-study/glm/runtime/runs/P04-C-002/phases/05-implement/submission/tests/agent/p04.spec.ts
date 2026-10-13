import { expect, test } from '@playwright/test'
import { board, click, columnIds, details, expectIds, makeTask, mount, project, readonly, select, summary, webIds, type Task } from '../development/helpers.ts'

const expectDefaults = async (page: Parameters<typeof select>[0]) => {
  await expect(page.getByRole('combobox', { name: 'Primarni ključ', exact: true })).toHaveValue('original')
  await expect(page.getByRole('combobox', { name: 'Primarna smer', exact: true })).toHaveValue('asc')
  await expect(page.getByRole('combobox', { name: 'Sekundarni ključ', exact: true })).toHaveValue('none')
  await expect(page.getByRole('combobox', { name: 'Sekundarna smer', exact: true })).toHaveValue('asc')
}

test('R01: default controls preserve received order', async ({ page }) => {
  await mount(page)
  await expectDefaults(page)
  await expectIds(page, webIds())
})

test('R02: normalized title and assignee comparison uses UTF-16', async ({ page }) => {
  const records: Task[] = [
    makeTask('z', { title: 'Z' }),
    makeTask('u-low', { title: '\u{10000}' }),
    makeTask('u-high', { title: '\u{10FFFF}' }),
    makeTask('a-c', { title: 'Č', assignee: 'Črt' }),
    makeTask('a-base', { title: 'C', assignee: 'Crt' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, ['a-c', 'a-base', 'z', 'u-low', 'u-high'])
  await select(page, 'Primarni ključ', 'assignee')
  await expectIds(page, ['z', 'u-low', 'u-high', 'a-c', 'a-base'])
})

test('R03: status and valid dates use domain order', async ({ page }) => {
  const records: Task[] = [
    makeTask('d3', { status: 'done', dueDate: '2026-03-01' }),
    makeTask('d1', { status: 'todo', dueDate: '2026-01-02' }),
    makeTask('d2', { status: 'in_progress', dueDate: '2026-01-10' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'status')
  await expectIds(page, ['d1', 'd2', 'd3'])
  await select(page, 'Primarni ključ', 'dueDate')
  await expectIds(page, ['d1', 'd2', 'd3'])
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['d3', 'd2', 'd1'])
})

test('R04: direction changes comparison result, not the whole projection', async ({ page }) => {
  const records: Task[] = [
    makeTask('e2', { title: 'B' }),
    makeTask('e1', { title: 'B' }),
    makeTask('e3', { title: 'A' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, ['e3', 'e2', 'e1'])
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['e2', 'e1', 'e3'])
})

test('R05: secondary key applies only on primary equality with its own direction', async ({ page }) => {
  const records: Task[] = [
    makeTask('s3', { title: 'A', dueDate: '2026-01-03' }),
    makeTask('s1', { title: 'B', dueDate: '2026-01-01' }),
    makeTask('s2', { title: 'B', dueDate: '2026-01-02' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await expectIds(page, ['s3', 's1', 's2'])
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['s3', 's2', 's1'])
})

test('R06: equal keys stay stable and original ignores all controls', async ({ page }) => {
  const records: Task[] = [
    makeTask('t1', { title: 'B' }),
    makeTask('t2', { title: 'A' }),
    makeTask('t3', { title: 'A' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['t1', 't2', 't3'])
  await select(page, 'Primarni ključ', 'original')
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['t1', 't2', 't3'])
})

test('R07: board columns are fixed and preserve relative sorted order', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'dueDate')
  await board(page)
  await columnIds(page, 'Pripravljeno', ['web-07', 'web-02', 'web-04', 'web-08'])
  await columnIds(page, 'V delu', ['web-01', 'web-05'])
  await columnIds(page, 'Končano', ['web-03', 'web-06'])
})

test('R08: view switch and details preserve all four controls', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await board(page)
  await details(page, 'web-02')
  await expect(page.getByRole('combobox', { name: 'Primarni ključ', exact: true })).toHaveValue('status')
  await expect(page.getByRole('combobox', { name: 'Primarna smer', exact: true })).toHaveValue('desc')
  await expect(page.getByRole('combobox', { name: 'Sekundarni ključ', exact: true })).toHaveValue('dueDate')
  await expect(page.getByRole('combobox', { name: 'Sekundarna smer', exact: true })).toHaveValue('desc')
})

test('R09: project switch and refresh reset without persistence', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'status')
  await select(page, 'Sekundarna smer', 'desc')
  await project(page, 'launch')
  await expectDefaults(page)
  await expectIds(page, ['launch-01', 'launch-02'])
  await page.reload()
  await expectDefaults(page)
  await expectIds(page, ['launch-01', 'launch-02'])
  expect(page.url()).not.toContain('sort')
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
})

const primaryValues = ['original', 'title', 'assignee', 'status', 'dueDate']
const secondaryValues = ['none', 'title', 'assignee', 'status', 'dueDate']
const directions = ['asc', 'desc']

test('R10: reset returns every control to defaults', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'assignee')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'status')
  await select(page, 'Sekundarna smer', 'desc')
  await click(page, 'Izvorni vrstni red')
  await expectDefaults(page)
  await expectIds(page, webIds())
})

test('R10: an empty project supports every key and direction', async ({ page }) => {
  await mount(page, [])
  for (const primary of primaryValues) await select(page, 'Primarni ključ', primary)
  for (const direction of directions) await select(page, 'Primarna smer', direction)
  for (const secondary of secondaryValues) await select(page, 'Sekundarni ključ', secondary)
  for (const direction of directions) await select(page, 'Sekundarna smer', direction)
  await click(page, 'Izvorni vrstni red')
  await expectIds(page, [])
})

test('R10: a one-task project supports every key and direction', async ({ page }) => {
  await mount(page, [makeTask('only', { title: 'Samo', assignee: 'Oseba', dueDate: '2026-05-05' })])
  for (const primary of primaryValues) await select(page, 'Primarni ključ', primary)
  for (const direction of directions) await select(page, 'Primarna smer', direction)
  for (const secondary of secondaryValues) await select(page, 'Sekundarni ključ', secondary)
  for (const direction of directions) await select(page, 'Sekundarna smer', direction)
  await click(page, 'Izvorni vrstni red')
  await expectIds(page, ['only'])
})

test('R11: sorting is a read-only projection', async ({ page }) => {
  const writes = await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'assignee')
  await select(page, 'Sekundarna smer', 'desc')
  await summary(page, [4, 2, 2])
  await expectIds(page, webIds(), false)
  await readonly(page, writes)
})

test('R12: IDs remain unique and open the correct details at 390 pixels', async ({ page }) => {
  const writes = await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await page.setViewportSize({ width: 390, height: 844 })
  await expectIds(page, webIds(), false)
  await details(page, 'web-02')
  await details(page, 'web-03')
  await expect(page.locator('[aria-label="Pregled stanj opravil"]')).toBeVisible()
  await readonly(page, writes)
})
