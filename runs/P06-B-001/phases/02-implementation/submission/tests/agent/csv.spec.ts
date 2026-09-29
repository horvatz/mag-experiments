import { test, expect } from '@playwright/test'
import { csvColumns, serializeCsv } from '../../src/csv.ts'
import { board, details, downloadCSV, expectIds, makeTask, mount, project, readonly, select, summary, table } from '../development/helpers.ts'

test('S4: exact UTF-8 bytes, both separators, quotes and preserved Unicode/newlines', () => {
  const task = Object.freeze(makeTask('z-17', {
    title: '  Čšž, "😀"; e\u0301  ', assignee: 'Živa', status: 'in_progress',
    dueDate: '2028-02-29', description: 'LF\nCR\rCRLF\r\nend;',
  }))
  const tasks = Object.freeze([task])
  const snapshot = JSON.stringify(tasks)
  const expected = '\uFEFF"id";"projectId";"title";"status";"assignee";"dueDate";"description"\r\n"z-17";"web";"  Čšž, ""😀""; e\u0301  ";"in_progress";"Živa";"2028-02-29";"LF\nCR\rCRLF\r\nend;"\r\n'
  expect(Buffer.from(serializeCsv(tasks, csvColumns, ';', 'all')!)).toEqual(Buffer.from(expected))
  expect(serializeCsv(tasks, ['description', 'title'], ',', 'all')).toBe('\uFEFF"title","description"\r\n"  Čšž, ""😀""; e\u0301  ","LF\nCR\rCRLF\r\nend;"\r\n')
  expect(serializeCsv([makeTask('empty', { title: '', description: '' })], ['description', 'title'], ';', 'all')).toBe('\uFEFF"title";"description"\r\n"";""\r\n')
  expect(JSON.stringify(tasks)).toBe(snapshot)
})

test('S5: formula prefixes and safe counterexamples retain every original character', () => {
  const cases = [
    ['=1', "'=1"], ['+1', "'+1"], ['-1', "'-1"], ['@x', "'@x"],
    [' \t\r\n=1', "' \t\r\n=1"], ['\n \r\t+1', "'\n \r\t+1"],
    ['\r\n\t -1', "'\r\n\t -1"], ['\t \n\r@x', "'\t \n\r@x"],
    ['', ''], [' \t\r\n', ' \t\r\n'], ['abc=1', 'abc=1'],
    ["'=1", "'=1"], ['\u00a0=1', '\u00a0=1'], ['\v=1', '\v=1'], ['x +1', 'x +1'],
  ]
  for (const [value, expected] of cases) {
    const task = Object.freeze(makeTask(value, { title: value, assignee: value, description: value }))
    expect(serializeCsv([task], ['id', 'title', 'assignee', 'description'], ';', 'all')).toBe(`\uFEFF"id";"title";"assignee";"description"\r\n"${expected}";"${expected}";"${expected}";"${expected}"\r\n`)
  }
  expect(serializeCsv([makeTask('a', { projectId: '-project' })], ['projectId'], ';', 'all')).toBe('\uFEFF"projectId"\r\n"\'-project"\r\n')
  expect(serializeCsv([makeTask('a', { title: ' ="x"' })], ['title'], ';', 'all')).toBe('\uFEFF"title"\r\n"\' =""x"""\r\n')
})

test('S1/S2: source order beyond ten rows, fixed columns, empty selection and local download', async ({ page }) => {
  const records = [19, 2, 40, 1, 99, 3, 12, 8, 7, 6, 15, 11, 10].map((n) => makeTask(`custom-${n}`, { title: 'Enak naslov' }))
  const writes = await mount(page, records)
  const startUrl = page.url()
  const startPages = page.context().pages().length
  const network: string[] = []
  page.on('request', (request) => network.push(request.url()))
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(';')
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')
  for (const column of csvColumns) await expect(page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true })).toBeChecked()
  let downloads = 0
  page.on('download', () => downloads++)
  for (const column of csvColumns) await page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true }).uncheck()
  await expect(page.getByRole('button', { name: 'Izvozi CSV' })).toBeDisabled()
  await page.getByRole('button', { name: 'Izvozi CSV' }).evaluate((button: HTMLButtonElement) => button.click())
  expect(downloads).toBe(0)
  for (const column of ['description', 'id', 'title']) await page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true }).check()
  const file = await downloadCSV(page)
  expect(file.name).toBe('folio-web.csv')
  expect([...Buffer.from(file.text).subarray(0, 3)]).toEqual([239, 187, 191])
  expect(file.text).toBe('\uFEFF"id";"title";"description"\r\n' + records.map((record) => `"${record.id}";"Enak naslov";"Opis opravila ${record.id}"\r\n`).join(''))
  expect(downloads).toBe(1)
  expect(page.url()).toBe(startUrl)
  expect(page.context().pages()).toHaveLength(startPages)
  expect(network).toEqual([])
  await expectIds(page, records.map((record) => record.id))
  await readonly(page, writes)
})

test('S3: every filter leaves all rows and summaries visible; zero matches stay disabled', async ({ page }) => {
  const records = [makeTask('z', { status: 'done' }), makeTask('a'), makeTask('p', { status: 'in_progress' })]
  const writes = await mount(page, records)
  for (const column of csvColumns.filter((column) => column !== 'id')) await page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true }).uncheck()
  for (const [filter, ids] of [['all', ['z', 'a', 'p']], ['todo', ['a']], ['in_progress', ['p']], ['done', ['z']]] as const) {
    await select(page, 'Filter izvoza', filter)
    expect((await downloadCSV(page)).text).toBe('\uFEFF"id"\r\n' + ids.map((id) => `"${id}"\r\n`).join(''))
    await expectIds(page, ['z', 'a', 'p'])
    await summary(page, [1, 1, 1])
  }
  await details(page, 'a')
  await readonly(page, writes)
})

test('S3: empty projects and missing state prevent download in both views', async ({ page }) => {
  await mount(page, [makeTask('only')])
  await select(page, 'Filter izvoza', 'done')
  await expect(page.getByRole('button', { name: 'Izvozi CSV' })).toBeDisabled()
  for (const column of csvColumns) await page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true }).uncheck()
  await page.getByRole('checkbox', { name: 'Stolpec id', exact: true }).check()
  await expect(page.getByRole('button', { name: 'Izvozi CSV' })).toBeDisabled()
  await select(page, 'Filter izvoza', 'todo')
  expect((await downloadCSV(page)).text).toBe('\uFEFF"id"\r\n"only"\r\n')
  await project(page, 'launch')
  await expect(page.getByRole('button', { name: 'Izvozi CSV' })).toBeDisabled()
  await board(page)
  await expect(page.getByRole('button', { name: 'Izvozi CSV' })).toBeDisabled()
  await page.reload()
  await expect(page.getByRole('checkbox', { name: 'Stolpec description', exact: true })).toBeChecked()
  await expect(page.getByRole('button', { name: 'Izvozi CSV' })).toBeDisabled()
  expect(serializeCsv([], csvColumns, ';', 'all')).toBeNull()
  expect(serializeCsv([makeTask('x')], [], ';', 'all')).toBeNull()
})

test('S6: view parity, successive changes, project roundtrip and reload reset defaults', async ({ page }) => {
  const writes = await mount(page)
  await page.getByRole('checkbox', { name: 'Stolpec description', exact: true }).uncheck()
  await select(page, 'Ločilo CSV', ',')
  await select(page, 'Filter izvoza', 'in_progress')
  const first = await downloadCSV(page)
  await board(page)
  expect(await downloadCSV(page)).toEqual(first)
  await expect(page.getByRole('checkbox', { name: 'Stolpec description', exact: true })).not.toBeChecked()
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(',')
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('in_progress')
  await table(page)
  expect(await downloadCSV(page)).toEqual(first)
  await page.getByRole('checkbox', { name: 'Stolpec description', exact: true }).check()
  expect((await downloadCSV(page)).text).not.toBe(first.text)
  await select(page, 'Ločilo CSV', ';')
  const changed = await downloadCSV(page)
  expect(changed.text).toContain('"id";"projectId"')
  await select(page, 'Filter izvoza', 'done')
  expect((await downloadCSV(page)).text).not.toBe(changed.text)
  for (const destination of ['launch', 'web'] as const) {
    await project(page, destination)
    await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(';')
    await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')
    for (const column of csvColumns) await expect(page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true })).toBeChecked()
    expect((await downloadCSV(page)).name).toBe(`folio-${destination}.csv`)
    await select(page, 'Ločilo CSV', ',')
    await select(page, 'Filter izvoza', 'done')
    await page.getByRole('checkbox', { name: 'Stolpec title', exact: true }).uncheck()
  }
  for (const view of ['board', 'table']) {
    if (view === 'board') await board(page)
    else await table(page)
    await select(page, 'Ločilo CSV', ',')
    await select(page, 'Filter izvoza', 'todo')
    await page.getByRole('checkbox', { name: 'Stolpec id', exact: true }).uncheck()
    await page.reload()
    await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(';')
    await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')
    for (const column of csvColumns) await expect(page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true })).toBeChecked()
  }
  await readonly(page, writes)
})

test('S7: 390px layout, keyboard controls and board details remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page)
  const checkbox = page.getByRole('checkbox', { name: 'Stolpec title', exact: true })
  await checkbox.focus()
  await page.keyboard.press('Space')
  await expect(checkbox).not.toBeChecked()
  await page.keyboard.press('Space')
  await expect(checkbox).toBeChecked()
  await expect(checkbox).toBeFocused()
  await readonly(page, writes)
  await board(page)
  await select(page, 'Filter izvoza', 'done')
  await expectIds(page, ['web-01', 'web-02', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'], false)
  await details(page, 'web-03')
  await downloadCSV(page)
  await readonly(page, writes)
})
