import { test, expect, mount, select, expectIds, board, table, makeTask, readonly } from '../development/helpers.ts'

test('P08 calendar groups include their boundaries, done tasks, and leap day', async ({ page }) => {
  const records = [
    makeTask('old', { dueDate: '2024-02-26' }),
    makeTask('same-day', { dueDate: '2024-02-27' }),
    makeTask('leap-day', { dueDate: '2024-02-29' }),
    makeTask('week-edge', { dueDate: '2024-03-05', status: 'in_progress' }),
    makeTask('after-week', { dueDate: '2024-03-06' }),
    makeTask('done-old', { dueDate: '2020-01-01', status: 'done' }),
    makeTask('done-future', { dueDate: '2030-01-01', status: 'done' }),
  ]
  const writes = await mount(page, records)
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2024-02-27')

  for (const [group, count] of [['overdue', '1'], ['today', '1'], ['week', '2'], ['later', '1'], ['done', '2']]) {
    await expect(page.getByLabel(`Število rokov ${group}`, { exact: true })).toHaveText(count)
  }

  await select(page, 'Pogled rokov', 'week')
  await expectIds(page, ['leap-day', 'week-edge'])
  await board(page)
  await expectIds(page, ['leap-day', 'week-edge'], false)
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2024-02-27')
  await expect(page.getByLabel('Pogled rokov', { exact: true })).toHaveValue('week')
  await expect(page.getByLabel('Število rokov week', { exact: true })).toHaveText('2')
  await table(page)
  await expectIds(page, ['leap-day', 'week-edge'])
  await page.locator('[data-task-id="leap-day"]').getByRole('link').click()
  const detail = page.getByRole('dialog')
  await expect(detail.locator('time')).toHaveAttribute('datetime', '2024-02-29')
  await page.getByRole('button', { name: 'Zapri podrobnosti' }).click()
  await readonly(page, writes)
})

test('P08 calendar arithmetic crosses a year boundary', async ({ page }) => {
  const records = [
    makeTask('before-year-edge', { dueDate: '2024-12-24' }),
    makeTask('year-edge-first', { dueDate: '2024-12-31' }),
    makeTask('year-edge-last', { dueDate: '2025-01-01' }),
    makeTask('year-edge-later', { dueDate: '2025-01-02' }),
  ]
  await mount(page, records)
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2024-12-25')
  await expect(page.getByLabel('Število rokov overdue', { exact: true })).toHaveText('1')
  await expect(page.getByLabel('Število rokov week', { exact: true })).toHaveText('2')
  await expect(page.getByLabel('Število rokov later', { exact: true })).toHaveText('1')
  await select(page, 'Pogled rokov', 'week')
  await expectIds(page, ['year-edge-first', 'year-edge-last'])
})

test('P08 empty reference date preserves the last calculation and filter', async ({ page }) => {
  await mount(page)
  await select(page, 'Pogled rokov', 'overdue')
  await page.getByLabel('Referenčni datum', { exact: true }).fill('')
  await expect(page.getByRole('alert')).toHaveText('Vnesi veljaven referenčni datum.')
  await expectIds(page, ['web-01', 'web-07'])
  await board(page)
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('')
  await expect(page.getByRole('alert')).toHaveText('Vnesi veljaven referenčni datum.')
  await expectIds(page, ['web-01', 'web-07'], false)
  await table(page)

  await page.getByLabel('Referenčni datum', { exact: true }).fill('2026-09-20')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.getByLabel('Pogled rokov', { exact: true })).toHaveValue('overdue')
  await expectIds(page, ['web-01'])
})

test('P08 project changes and reload reset the local filter state', async ({ page }) => {
  await mount(page)
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2026-10-03')
  await select(page, 'Pogled rokov', 'done')
  await expect(page).toHaveURL(/\/projects\/web(?:\?view=board)?$/)
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja', exact: true }).click()
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(page.getByLabel('Pogled rokov', { exact: true })).toHaveValue('all')

  await page.getByLabel('Referenčni datum', { exact: true }).fill('2026-10-03')
  await select(page, 'Pogled rokov', 'today')
  await page.reload()
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(page.getByLabel('Pogled rokov', { exact: true })).toHaveValue('all')
  expect(await page.evaluate(() => ({ search: location.search, storage: Object.keys(localStorage).concat(Object.keys(sessionStorage)) }))).toEqual({ search: '', storage: [] })
})

test('P08 empty groups and empty projects keep their controls and all five counts', async ({ page }) => {
  await mount(page, [makeTask('only-open', { dueDate: '2026-09-21' })])
  await select(page, 'Pogled rokov', 'done')
  await expect(page.getByText('Ni opravil v izbrani skupini.', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Pogled rokov', { exact: true })).toHaveValue('done')
  await select(page, 'Pogled rokov', 'all')
  await expectIds(page, ['only-open'])
})

test('P08 empty projects show zero counters', async ({ page }) => {
  await mount(page, [])
  for (const group of ['overdue', 'today', 'week', 'later', 'done']) {
    await expect(page.getByLabel(`Število rokov ${group}`, { exact: true })).toHaveText('0')
  }
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
})

test('P08 remains read-only and fits a 390 pixel viewport', async ({ page }) => {
  const writes = await mount(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await select(page, 'Pogled rokov', 'all')
  await board(page)
  await expectIds(page, ['web-01', 'web-02', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'], false)
  await readonly(page, writes)
})
