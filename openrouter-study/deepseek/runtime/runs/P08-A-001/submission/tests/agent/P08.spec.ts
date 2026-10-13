import type { Page } from '@playwright/test'
import { test, expect, mount, select, expectIds, board, table, ids, makeTask, readonly } from '../development/helpers.ts'

const GROUPS = ['overdue', 'today', 'week', 'later', 'done'] as const

const countOf = (page: Page, key: string) => page.getByLabel(`Število rokov ${key}`, { exact: true })

async function readCounts(page: Page) {
  const values: string[] = []
  for (const key of GROUPS) values.push((await countOf(page, key).textContent()) ?? '')
  return values
}

test('R01: the reference date is explicitly 2026-09-21 even when the device clock differs', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2031-05-05T10:00:00Z'))
  await mount(page)
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov', exact: true })).toHaveValue('all')
  await expectIds(page, ['web-01', 'web-02', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
})

test('R02: done tasks never count into the four open groups', async ({ page }) => {
  const records = [
    makeTask('d-past', { status: 'done', dueDate: '2020-01-01' }),
    makeTask('d-future', { status: 'done', dueDate: '2030-01-01' }),
    makeTask('open-past', { dueDate: '2026-09-18' }),
  ]
  await mount(page, records)
  await expect(countOf(page, 'done')).toHaveText('2')
  await expect(countOf(page, 'overdue')).toHaveText('1')
  for (const key of ['today', 'week', 'later']) await expect(countOf(page, key)).toHaveText('0')
  await select(page, 'Pogled rokov', 'overdue')
  await expectIds(page, ['open-past'])
  await select(page, 'Pogled rokov', 'done')
  await expectIds(page, ['d-past', 'd-future'])
})

test('R03/R04: group boundaries are inclusive, ordered and disjoint', async ({ page }) => {
  const records = [
    makeTask('o', { dueDate: '2026-09-20' }),
    makeTask('t', { dueDate: '2026-09-21' }),
    makeTask('w1', { dueDate: '2026-09-22' }),
    makeTask('w7', { dueDate: '2026-09-28' }),
    makeTask('l', { dueDate: '2026-09-29' }),
    makeTask('d', { status: 'done', dueDate: '2026-09-25' }),
  ]
  await mount(page, records)
  await expect(countOf(page, 'overdue')).toHaveText('1')
  await expect(countOf(page, 'today')).toHaveText('1')
  await expect(countOf(page, 'week')).toHaveText('2')
  await expect(countOf(page, 'later')).toHaveText('1')
  await expect(countOf(page, 'done')).toHaveText('1')
  for (const [group, expected] of [['overdue', ['o']], ['today', ['t']], ['week', ['w1', 'w7']], ['later', ['l']], ['done', ['d']]] as const) {
    await select(page, 'Pogled rokov', group)
    await expectIds(page, [...expected])
  }
  await select(page, 'Pogled rokov', 'all')
  await expectIds(page, ['o', 't', 'w1', 'w7', 'l', 'd'])
})

test('R05: calendar arithmetic crosses month, year and leap-day boundaries', async ({ page }) => {
  const records = [
    makeTask('p1', { dueDate: '2024-02-29' }),
    makeTask('p2', { dueDate: '2024-03-06' }),
    makeTask('p3', { dueDate: '2024-03-07' }),
    makeTask('y1', { dueDate: '2026-01-01' }),
    makeTask('y2', { dueDate: '2026-01-07' }),
    makeTask('y3', { dueDate: '2026-01-08' }),
  ]
  await mount(page, records)
  const input = page.getByLabel('Referenčni datum', { exact: true })
  await input.fill('2024-02-28')
  await select(page, 'Pogled rokov', 'week')
  await expectIds(page, ['p1', 'p2'])
  await select(page, 'Pogled rokov', 'later')
  await expectIds(page, ['p3', 'y1', 'y2', 'y3'])
  await input.fill('2025-12-31')
  await select(page, 'Pogled rokov', 'week')
  await expectIds(page, ['y1', 'y2'])
  await input.fill('2026-01-07')
  await select(page, 'Pogled rokov', 'today')
  await expectIds(page, ['y2'])
})

test('R06: the five counters describe the whole project and ignore the active filter', async ({ page }) => {
  const records = [
    makeTask('o', { dueDate: '2026-09-20' }),
    makeTask('t', { dueDate: '2026-09-21' }),
    makeTask('w', { dueDate: '2026-09-23' }),
    makeTask('l', { dueDate: '2026-10-20' }),
    makeTask('d', { status: 'done', dueDate: '2026-09-01' }),
  ]
  await mount(page, records)
  const before = await readCounts(page)
  expect(before).toEqual(['1', '1', '1', '1', '1'])
  await select(page, 'Pogled rokov', 'done')
  expect(await readCounts(page)).toEqual(before)
  await select(page, 'Pogled rokov', 'later')
  expect(await readCounts(page)).toEqual(before)
  for (const key of GROUPS) await expect(countOf(page, key)).toHaveText(/^\d+$/)
})

test('R07: the selector shows each group in source order without writing', async ({ page }) => {
  const records = [
    makeTask('c', { dueDate: '2026-09-23' }),
    makeTask('a', { dueDate: '2026-09-19' }),
    makeTask('b', { dueDate: '2026-09-22' }),
  ]
  const writes = await mount(page, records)
  const chooser = page.getByRole('combobox', { name: 'Pogled rokov', exact: true })
  for (const value of ['all', 'overdue', 'today', 'week', 'later', 'done']) await expect(chooser.locator(`option[value="${value}"]`)).toHaveCount(1)
  await select(page, 'Pogled rokov', 'week')
  await expectIds(page, ['c', 'b'])
  await select(page, 'Pogled rokov', 'overdue')
  await expectIds(page, ['a'])
  await select(page, 'Pogled rokov', 'all')
  await expectIds(page, ['c', 'a', 'b'])
  await readonly(page, writes)
})

test('R08: an empty date warns, keeps the last valid calculation and recovers', async ({ page }) => {
  await mount(page)
  const input = page.getByLabel('Referenčni datum', { exact: true })
  await select(page, 'Pogled rokov', 'overdue')
  await input.fill('')
  await expect(page.getByRole('alert')).toHaveText('Vnesi veljaven referenčni datum.')
  await expectIds(page, ['web-01', 'web-07'])
  await expect(page.getByRole('combobox', { name: 'Pogled rokov', exact: true })).toHaveValue('overdue')
  await input.fill('2026-09-19')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expectIds(page, ['web-01'])
  await expect(page.getByRole('combobox', { name: 'Pogled rokov', exact: true })).toHaveValue('overdue')
})

test('R09: table and board show the same filtered IDs and keep the filter state', async ({ page }) => {
  const records = [
    makeTask('o', { dueDate: '2026-09-20' }),
    makeTask('t', { dueDate: '2026-09-21' }),
    makeTask('w', { dueDate: '2026-09-24' }),
    makeTask('l', { dueDate: '2026-10-10' }),
    makeTask('d', { status: 'done', dueDate: '2026-09-02' }),
  ]
  await mount(page, records)
  const input = page.getByLabel('Referenčni datum', { exact: true })
  const chooser = page.getByRole('combobox', { name: 'Pogled rokov', exact: true })
  await input.fill('2026-09-21')
  for (const group of ['all', 'overdue', 'today', 'week', 'later', 'done']) {
    await select(page, 'Pogled rokov', group)
    const expected = (await ids(page)).sort()
    await board(page)
    expect((await ids(page)).sort()).toEqual(expected)
    await expect(input).toHaveValue('2026-09-21')
    await expect(chooser).toHaveValue(group)
    await table(page)
    await expect(chooser).toHaveValue(group)
  }
})

test('R10: project change and refresh reset date and group, with no URL or storage state', async ({ page }) => {
  await mount(page)
  const input = page.getByLabel('Referenčni datum', { exact: true })
  const chooser = page.getByRole('combobox', { name: 'Pogled rokov', exact: true })
  await input.fill('2026-09-25')
  await select(page, 'Pogled rokov', 'later')
  expect(page.url()).not.toContain('2026-09-25')
  expect(page.url()).not.toContain('later')
  expect(await page.evaluate(() => Object.keys(localStorage).length)).toBe(0)
  await page.reload()
  await expect(input).toHaveValue('2026-09-21')
  await expect(chooser).toHaveValue('all')
  await input.fill('2026-09-25')
  await select(page, 'Pogled rokov', 'later')
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Jesenska kampanja', exact: true })).toBeVisible()
  await expect(input).toHaveValue('2026-09-21')
  await expect(chooser).toHaveValue('all')
})

test('R11: an empty project shows five zeros and an empty group stays switchable', async ({ page }) => {
  await mount(page, [])
  for (const key of GROUPS) await expect(countOf(page, key)).toHaveText('0')
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
  await select(page, 'Pogled rokov', 'done')
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
  await select(page, 'Pogled rokov', 'all')
})

test('R11: an empty group in a non-empty project explains the state and stays switchable', async ({ page }) => {
  await mount(page, [makeTask('only-today', { dueDate: '2026-09-21' })])
  await select(page, 'Pogled rokov', 'later')
  await expect(page.getByRole('heading', { name: 'Ni opravil v izbrani skupini.' })).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Pogled rokov', exact: true })).toBeEnabled()
  await select(page, 'Pogled rokov', 'all')
  await expectIds(page, ['only-today'])
})

test('R12: at 390 px the page does not overflow and task rows keep their IDs', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page)
  const noPageOverflow = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
  expect(await noPageOverflow()).toBe(true)
  await select(page, 'Pogled rokov', 'overdue')
  expect(await noPageOverflow()).toBe(true)
  await expectIds(page, ['web-01', 'web-07'])
  await board(page)
  await expectIds(page, ['web-01', 'web-07'], false)
  expect(await noPageOverflow()).toBe(true)
  await readonly(page, writes)
})
