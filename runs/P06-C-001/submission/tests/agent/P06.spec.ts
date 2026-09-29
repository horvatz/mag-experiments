import { test, expect, type Page } from '@playwright/test'
import { createCsv, neutralizeFormula } from '../../src/csv.ts'
import { mount, makeTask, examples, board, table, project, select, downloadCSV, expectIds, summary, details, readonly } from '../development/helpers.ts'

const columns = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description'] as const
const checkbox = (page: Page, name: string) => page.getByRole('checkbox', { name: `Stolpec ${name}`, exact: true })
const exportButton = (page: Page) => page.getByRole('button', { name: 'Izvozi CSV', exact: true })

// Expectations are independently specified; downloads never use createCsv as an oracle.
test('A01: formula boundaries preserve the complete original string', () => {
  const prefixes = ['', ' ', '\t', '\r', '\n', ' \t\r\n  ']
  for (const prefix of prefixes) {
    for (const trigger of ['=', '+', '-', '@']) {
      const original = `${prefix}${trigger}čšž";😀`
      expect(neutralizeFormula(original)).toBe("'" + original)
    }
  }
  for (const original of ['', ' \t\r\n', ' čšž ', 'x=1', "'=1", '\u00a0=1', '\v+1', '\f-1']) {
    expect(neutralizeFormula(original)).toBe(original)
  }
})

test('A02: exact CSV bytes, canonical columns and frozen input', () => {
  const task = Object.freeze(makeTask('z-9', { title: ' čšž,"😀" ', description: ' \t\r\n=1;"x"\rY\nZ\r\n' }))
  const tasks = Object.freeze([task])
  const before = JSON.stringify(tasks)
  const expected = '\uFEFF"id";"title";"description"\r\n"z-9";" čšž,""😀"" ";"\' \t\r\n=1;""x""\rY\nZ\r\n"\r\n'
  expect(Buffer.from(createCsv(tasks, ['description', 'title', 'id'], ';', 'all')!)).toEqual(Buffer.from(expected))
  expect(createCsv(tasks, ['id', 'description'], ',', 'all')).toBe('\uFEFF"id","description"\r\n"z-9","\' \t\r\n=1;""x""\rY\nZ\r\n"\r\n')
  expect(createCsv(tasks, [], ';', 'all')).toBeNull()
  expect(createCsv([], columns, ';', 'all')).toBeNull()
  expect(createCsv(tasks, columns, ';', 'done')).toBeNull()
  expect(JSON.stringify(tasks)).toBe(before)
})

test('A03: one-row download has exact bytes for both delimiters and all fields', async ({ page, context }) => {
  const writes = await mount(page, [makeTask('new-17', {
    title: ' čšž,"😀" ', status: 'in_progress', assignee: ' \t+Ana', dueDate: '2032-02-29',
    description: '\r\n@opis;"x"\rY\nZ\r\n',
  })])
  const url = page.url()
  let newPages = 0
  context.on('page', () => { newPages++ })
  for (const column of columns) await expect(checkbox(page, column)).toBeChecked()
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(';')
  for (const delimiter of [';', ',']) {
    await select(page, 'Ločilo CSV', delimiter)
    const file = await downloadCSV(page)
    const header = ['"id"', '"projectId"', '"title"', '"status"', '"assignee"', '"dueDate"', '"description"'].join(delimiter)
    const row = ['"new-17"', '"web"', '" čšž,""😀"" "', '"in_progress"', '"\' \t+Ana"', '"2032-02-29"', '"\'\r\n@opis;""x""\rY\nZ\r\n"'].join(delimiter)
    const bytes = Buffer.from(file.text, 'utf8')
    expect(file.name).toBe('folio-web.csv')
    expect([...bytes.subarray(0, 3)]).toEqual([239, 187, 191])
    expect(bytes).toEqual(Buffer.from('\uFEFF' + header + '\r\n' + row + '\r\n', 'utf8'))
  }
  expect(page.url()).toBe(url)
  expect(newPages).toBe(0)
  await readonly(page, writes)
})

test('A04: all filters preserve source order and full UI for more than ten tasks', async ({ page }) => {
  const ids = ['r-90', 'r-2', 'r-81', 'r-4', 'r-70', 'r-6', 'r-60', 'r-8', 'r-50', 'r-10', 'r-40', 'r-12', 'r-30']
  const statuses = ['todo', 'in_progress', 'done'] as const
  const records = ids.map((id, index) => makeTask(id, { title: 'Enak naslov', status: statuses[index % 3] }))
  const writes = await mount(page, [...records, makeTask('other-1', { projectId: 'launch' })])
  for (const column of columns.slice(1)) await checkbox(page, column).uncheck()
  const expectedIds = {
    all: ids,
    todo: ['r-90', 'r-4', 'r-60', 'r-10', 'r-30'],
    in_progress: ['r-2', 'r-70', 'r-8', 'r-40'],
    done: ['r-81', 'r-6', 'r-50', 'r-12'],
  }
  for (const view of ['table', 'board']) {
    if (view === 'board') await board(page)
    for (const filter of ['all', ...statuses] as const) {
      await select(page, 'Filter izvoza', filter)
      const file = await downloadCSV(page)
      expect(file.text).toBe('\uFEFF"id"\r\n' + expectedIds[filter].map(id => `"${id}"\r\n`).join(''))
      await expectIds(page, ids, view === 'table')
      await summary(page, [5, 4, 4])
    }
  }
  await readonly(page, writes)
})

test('A05: empty selection and missing status block downloads; selection order is canonical', async ({ page }) => {
  await mount(page, [makeTask('solo-1', { description: '' })])
  for (const column of columns) await checkbox(page, column).uncheck()
  let downloads = 0
  page.on('download', () => { downloads++ })
  await expect(exportButton(page)).toBeDisabled()
  await exportButton(page).evaluate((button: HTMLButtonElement) => button.click())
  expect(downloads).toBe(0)
  await select(page, 'Filter izvoza', 'done')
  await checkbox(page, 'description').check()
  await expect(exportButton(page)).toBeDisabled()
  await checkbox(page, 'id').check()
  await select(page, 'Filter izvoza', 'all')
  await expect(exportButton(page)).toBeEnabled()
  expect((await downloadCSV(page)).text).toBe('\uFEFF"id";"description"\r\n"solo-1";""\r\n')
  await expectIds(page, ['solo-1'])
})

test('A06: both empty projects disable export in both views', async ({ page }) => {
  await mount(page, [])
  for (const id of ['web', 'launch'] as const) {
    await project(page, id)
    await table(page)
    await expect(exportButton(page)).toBeDisabled()
    await expectIds(page, [])
    await board(page)
    await expect(exportButton(page)).toBeDisabled()
    await summary(page, [0, 0, 0])
  }
})

test('A07: settings survive views, update successive exports and reset on project/reload', async ({ page }) => {
  const writes = await mount(page)
  const baseline = await downloadCSV(page)
  for (const column of columns.slice(1)) await checkbox(page, column).uncheck()
  await select(page, 'Ločilo CSV', ',')
  await select(page, 'Filter izvoza', 'done')
  const filtered = await downloadCSV(page)
  expect(filtered.text).toBe('\uFEFF"id"\r\n"web-03"\r\n"web-06"\r\n')
  await board(page)
  for (const column of columns) await expect(checkbox(page, column)).toBeChecked({ checked: column === 'id' })
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(',')
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('done')
  expect(await downloadCSV(page)).toEqual(filtered)
  await details(page, 'web-06')
  await table(page)
  expect(await downloadCSV(page)).toEqual(filtered)
  await checkbox(page, 'status').check()
  expect((await downloadCSV(page)).text).toBe('\uFEFF"id","status"\r\n"web-03","done"\r\n"web-06","done"\r\n')
  await project(page, 'launch')
  for (const column of columns) await expect(checkbox(page, column)).toBeChecked()
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(';')
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')
  const other = await downloadCSV(page)
  expect(other.name).toBe('folio-launch.csv')
  expect(other.text).toContain('"launch-01";"launch";')
  expect(other.text).not.toContain('web-')
  await project(page, 'web')
  expect(await downloadCSV(page)).toEqual(baseline)
  await checkbox(page, 'id').uncheck()
  await select(page, 'Ločilo CSV', ',')
  await select(page, 'Filter izvoza', 'todo')
  await page.reload()
  for (const column of columns) await expect(checkbox(page, column)).toBeChecked()
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(';')
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')
  expect(await downloadCSV(page)).toEqual(baseline)
  await readonly(page, writes)
})

test('A08: Folio controls and keyboard focus fit 390px in both views', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page)
  await expect(page.getByRole('checkbox')).toHaveCount(7)
  await expect(page.locator('select')).toHaveCount(2)
  await checkbox(page, 'id').focus()
  await page.keyboard.press('Space')
  await expect(checkbox(page, 'id')).not.toBeChecked()
  await page.keyboard.press('Space')
  await page.keyboard.press('Tab')
  await expect(checkbox(page, 'projectId')).toBeFocused()
  expect(await checkbox(page, 'projectId').evaluate(node => getComputedStyle(node).outlineStyle)).not.toBe('none')
  await expectIds(page, examples.filter(task => task.projectId === 'web').map(task => task.id))
  await readonly(page, writes)
  await page.screenshot({ path: 'docs/agent/P06/mobile-table.png', fullPage: true })
  await board(page)
  await select(page, 'Filter izvoza', 'done')
  await expectIds(page, examples.filter(task => task.projectId === 'web').map(task => task.id), false)
  await readonly(page, writes)
  await page.screenshot({ path: 'docs/agent/P06/mobile-board.png', fullPage: true })
})
