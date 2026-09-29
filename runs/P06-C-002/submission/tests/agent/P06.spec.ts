import { test, expect, type Page } from '@playwright/test'
import type { Task } from '../../shared/types.ts'
import { createCsv, csvColumns, type CsvColumn } from '../../src/csv.ts'
import { mount, makeTask, select, downloadCSV, board, table, project, expectIds, summary, details, readonly } from '../development/helpers.ts'

const columns: CsvColumn[] = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description']

for (const delimiter of [';', ','] as const) {
  test(`A01: exact CSV bytes and immutable input (${delimiter})`, () => {
    const task = Object.freeze(makeTask('z-19', { title: ' Čšž, "🚀"; ', description: 'A\rB\nC\r\nD', status: 'in_progress', dueDate: '2028-02-29', assignee: '' }))
    const input = Object.freeze([task])
    const expected = '\uFEFF' + ['"id"', '"projectId"', '"title"', '"status"', '"assignee"', '"dueDate"', '"description"'].join(delimiter) + '\r\n'
      + ['"z-19"', '"web"', '" Čšž, ""🚀""; "', '"in_progress"', '""', '"2028-02-29"', '"A\rB\nC\r\nD"'].join(delimiter) + '\r\n'
    const before = JSON.stringify(input)
    const actual = createCsv(input, [...columns].reverse(), delimiter, 'all')
    expect(Buffer.from(actual)).toEqual(Buffer.from(expected))
    expect([...Buffer.from(actual).subarray(0, 3)]).toEqual([239, 187, 191])
    expect(JSON.stringify(input)).toBe(before)
  })
}

test('A02: formula prefixes and safe lookalikes across data columns', () => {
  const prefixes = ['', ' ', '\t', '\r', '\n', ' \t\r\n  \t']
  for (const column of columns) {
    // Serializer contract is tested independently of the narrower API domain of status/date/IDs.
    for (const prefix of prefixes) {
      for (const trigger of ['=', '+', '-', '@']) {
        const value = prefix + trigger + 'X"Y'
        const task = { ...makeTask('safe'), [column]: value } as Task
        expect(createCsv([task], [column], ';', 'all')).toBe(`\uFEFF"${column}"\r\n"'${prefix}${trigger}X""Y"\r\n`)
      }
    }
    for (const value of ['', ' ', '\t\r\n', "'=X", 'x=Y', '\u00a0=Y', '\v+Y', '\f-Y', '  običajno ']) {
      const task = { ...makeTask('safe'), [column]: value } as Task
      expect(createCsv([task], [column], ',', 'all')).toBe(`\uFEFF"${column}"\r\n"${value}"\r\n`)
    }
  }
})

test('A03: stable filtering, canonical selection and empty guards', () => {
  const tasks = Object.freeze([
    Object.freeze(makeTask('z-9', { status: 'done', title: 'Enako' })),
    Object.freeze(makeTask('a-2', { status: 'todo', title: 'Enako' })),
    Object.freeze(makeTask('m-1', { status: 'done', title: 'Enako' })),
  ])
  expect(createCsv(tasks, ['title', 'id'], ';', 'done')).toBe('\uFEFF"id";"title"\r\n"z-9";"Enako"\r\n"m-1";"Enako"\r\n')
  expect(createCsv(tasks, [], ';', 'all')).toBe('')
  expect(createCsv([], columns, ';', 'all')).toBe('')
  expect(createCsv(tasks, columns, ';', 'in_progress')).toBe('')
  expect(tasks.map(t => t.id)).toEqual(['z-9', 'a-2', 'm-1'])
  expect(csvColumns).toEqual(columns)
})

async function chooseColumns(page: Page, selected: string[]) {
  for (const column of columns) await page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true }).setChecked(selected.includes(column))
}

async function expectDefaults(page: Page) {
  for (const column of columns) await expect(page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true })).toBeChecked()
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(';')
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')
}

test('A04: all rows, empty columns, all filters and unchanged read views', async ({ page, context }) => {
  const statuses = ['todo', 'in_progress', 'done'] as const
  const records = Array.from({ length: 13 }, (_, i) => makeTask(`custom-${30-i}`, { title: 'Enak naslov', status: statuses[i % 3] }))
  records.push(makeTask('elsewhere', { projectId: 'launch' }))
  const writes = await mount(page, records)
  const extraPages: Page[] = []
  const requests: string[] = []
  context.on('page', p => extraPages.push(p))
  page.on('request', r => { if (!['GET', 'HEAD', 'OPTIONS'].includes(r.method())) requests.push(r.method() + ' ' + r.url()) })
  await expectDefaults(page)
  const initial = await downloadCSV(page)
  expect(initial.name).toBe('folio-web.csv')
  expect(initial.text.startsWith('\uFEFF"id";"projectId";"title";"status";"assignee";"dueDate";"description"\r\n')).toBe(true)
  expect(initial.text.match(/"custom-\d+"/g)).toEqual(records.slice(0,13).map(t => `"${t.id}"`))
  await chooseColumns(page, [])
  const downloads: string[] = []
  page.on('download', d => downloads.push(d.suggestedFilename()))
  const button = page.getByRole('button', { name: 'Izvozi CSV', exact: true })
  await expect(button).toBeDisabled()
  await button.evaluate((element: HTMLButtonElement) => element.click())
  await page.getByRole('checkbox', { name: 'Stolpec title', exact: true }).check()
  await page.getByRole('checkbox', { name: 'Stolpec id', exact: true }).check()
  expect(downloads).toEqual([])
  await expect(button).toBeEnabled()
  const projected = await downloadCSV(page)
  expect(projected.text.startsWith('\uFEFF"id";"title"\r\n')).toBe(true)
  await chooseColumns(page, ['id'])
  for (const filter of ['all', ...statuses] as const) {
    await select(page, 'Filter izvoza', filter)
    const expectedIds = records.slice(0,13).filter(t => filter === 'all' || t.status === filter).map(t => t.id)
    const file = await downloadCSV(page)
    expect(file.text).toBe('\uFEFF"id"\r\n' + expectedIds.map(id => `"${id}"\r\n`).join(''))
    await expectIds(page, records.slice(0,13).map(t => t.id))
    await summary(page, [5,4,4])
  }
  await board(page)
  await expectIds(page, records.slice(0,13).map(t => t.id), false)
  await summary(page, [5,4,4])
  await details(page, 'custom-30')
  expect(extraPages).toEqual([])
  expect(requests).toEqual([])
  await readonly(page, writes)
})

test('A05: empty project and empty filter keep export disabled', async ({ page }) => {
  await mount(page, [makeTask('only-one', { status: 'todo' })])
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeEnabled()
  await select(page, 'Filter izvoza', 'done')
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeDisabled()
  await chooseColumns(page, [])
  await page.getByRole('checkbox', { name: 'Stolpec id', exact: true }).check()
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeDisabled()
  await select(page, 'Filter izvoza', 'todo')
  expect((await downloadCSV(page)).text).toBe('\uFEFF"id"\r\n"only-one"\r\n')
  await project(page, 'launch')
  await expectDefaults(page)
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeDisabled()
  await board(page)
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeDisabled()
  await expect(page.locator('[data-task-id]')).toHaveCount(0)
})

test('A06: view byte parity, current settings, project and refresh resets', async ({ page }) => {
  await mount(page)
  await chooseColumns(page, ['id', 'status'])
  await select(page, 'Ločilo CSV', ',')
  await select(page, 'Filter izvoza', 'done')
  const first = await downloadCSV(page)
  expect(first.text).toBe('\uFEFF"id","status"\r\n"web-03","done"\r\n"web-06","done"\r\n')
  await board(page)
  expect(await downloadCSV(page)).toEqual(first)
  await table(page)
  expect(await downloadCSV(page)).toEqual(first)
  await select(page, 'Ločilo CSV', ';')
  await select(page, 'Filter izvoza', 'in_progress')
  expect((await downloadCSV(page)).text).toBe('\uFEFF"id";"status"\r\n"web-01";"in_progress"\r\n"web-05";"in_progress"\r\n')
  await project(page, 'launch')
  await expectDefaults(page)
  expect((await downloadCSV(page)).name).toBe('folio-launch.csv')
  await chooseColumns(page, ['title'])
  await select(page, 'Ločilo CSV', ',')
  await select(page, 'Filter izvoza', 'todo')
  await project(page, 'web')
  await expectDefaults(page)
  await chooseColumns(page, ['description'])
  await select(page, 'Ločilo CSV', ',')
  await select(page, 'Filter izvoza', 'done')
  await page.reload()
  await expectDefaults(page)
})

test('A07: exact downloaded Unicode and formula bytes with both delimiters', async ({ page }) => {
  await mount(page, [makeTask('edge-99', { title: ' \t\r\n+"Čšž"', description: 'A\rB\nC\r\n🚀; ,', assignee: '@Ana', dueDate: '2028-02-29', status: 'done' })])
  await chooseColumns(page, ['title', 'assignee', 'dueDate', 'description'])
  for (const delimiter of [';', ',']) {
    await select(page, 'Ločilo CSV', delimiter)
    const file = await downloadCSV(page)
    const expected = '\uFEFF' + ['"title"','"assignee"','"dueDate"','"description"'].join(delimiter) + '\r\n'
      + ['"\' \t\r\n+""Čšž"""','"\'@Ana"','"2028-02-29"','"A\rB\nC\r\n🚀; ,"'].join(delimiter) + '\r\n'
    expect(Buffer.from(file.text)).toEqual(Buffer.from(expected))
  }
})

test('A08: accessible controls and Folio at 390 pixels in both views', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page)
  await expectDefaults(page)
  await page.getByRole('checkbox', { name: 'Stolpec id', exact: true }).focus()
  await page.keyboard.press('Space')
  await expect(page.getByRole('checkbox', { name: 'Stolpec id', exact: true })).not.toBeChecked()
  await page.keyboard.press('Space')
  await downloadCSV(page)
  await readonly(page, writes)
  await expect(page.getByRole('columnheader', { name: 'Opravilo', exact: true })).toBeVisible()
  await board(page)
  await expect(page.getByRole('region', { name: 'Pripravljeno', exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'V delu', exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Končano', exact: true })).toBeVisible()
  await downloadCSV(page)
  await readonly(page, writes)
})
