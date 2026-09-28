import { expect, test, mount, makeTask, project, board, table, downloadCSV, select, readonly } from '../development/helpers.ts'

test('CSV keeps canonical columns and task order; an empty selection disables export', async ({ page }) => {
  const writes = await mount(page, [
    makeTask('later', { title: 'Najprej' }),
    makeTask('earlier', { title: 'Nato' }),
  ])
  const exportButton = page.getByRole('button', { name: 'Izvozi CSV', exact: true })
  for (const column of ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description']) {
    await page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true }).uncheck()
  }
  await expect(exportButton).toBeDisabled()
  await page.getByRole('checkbox', { name: 'Stolpec title', exact: true }).check()
  await page.getByRole('checkbox', { name: 'Stolpec id', exact: true }).check()
  await page.getByRole('checkbox', { name: 'Stolpec description', exact: true }).check()
  const pageUrl = page.url()
  const file = await downloadCSV(page)
  expect(page.url()).toBe(pageUrl)
  expect(file.text).toBe('\uFEFF"id";"title";"description"\r\n"later";"Najprej";"Opis opravila later"\r\n"earlier";"Nato";"Opis opravila earlier"\r\n')
  await readonly(page, writes)
})

test('CSV exports every record when a project has more than ten tasks', async ({ page }) => {
  const records = Array.from({ length: 13 }, (_, index) => makeTask(`task-${String(index).padStart(2, '0')}`))
  await mount(page, records)
  const file = await downloadCSV(page)
  const ids = file.text.split('\r\n').slice(1, -1).map((row) => row.split(';')[0])
  expect(ids).toEqual(records.map(({ id }) => `"${id}"`))
})

test('CSV quotes every value, preserves Unicode and line breaks, and neutralizes formulas after leading whitespace', async ({ page }) => {
  const records = [
    makeTask('x-1', { title: '\t  +1+1', description: '\t@opomba\r\nPrva\r\ndruga; vejica, "citirano" čšž', assignee: ' Živa Kovač' }),
    makeTask('x-2', { title: '\r-2', description: 'navadno besedilo', assignee: '\t=Ana' }),
    makeTask('x-3', { title: '\n@3' }),
    makeTask('x-4', { title: '  =4' }),
  ]
  await mount(page, records)
  const file = await downloadCSV(page)
  expect(file.text).toBe([
    '\uFEFF"id";"projectId";"title";"status";"assignee";"dueDate";"description"\r\n',
    '"x-1";"web";"\'\t  +1+1";"todo";" Živa Kovač";"2026-09-21";"\'\t@opomba\r\nPrva\r\ndruga; vejica, ""citirano"" čšž"\r\n',
    '"x-2";"web";"\'\r-2";"todo";"\'\t=Ana";"2026-09-21";"navadno besedilo"\r\n',
    '"x-3";"web";"\'\n@3";"todo";"Ana Novak";"2026-09-21";"Opis opravila x-3"\r\n',
    '"x-4";"web";"\'  =4";"todo";"Ana Novak";"2026-09-21";"Opis opravila x-4"\r\n',
  ].join(''))
  expect(file.name).toBe('folio-web.csv')
})

test('filter only changes the export and the current settings survive view switching', async ({ page }) => {
  const writes = await mount(page)
  const initial = await downloadCSV(page)
  await select(page, 'Filter izvoza', 'in_progress')
  await select(page, 'Ločilo CSV', ',')
  await expect(page.locator('[data-task-id]')).toHaveCount(8)
  const tableFile = await downloadCSV(page)
  expect(tableFile).not.toEqual(initial)
  expect(tableFile.text).toContain('"web-01","web"')
  expect(tableFile.text).toContain('"web-05","web"')
  expect(tableFile.text).not.toContain('"web-02","web"')
  await board(page)
  await expect(page.getByRole('combobox', { name: 'Filter izvoza' })).toHaveValue('in_progress')
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV' })).toHaveValue(',')
  expect(await downloadCSV(page)).toEqual(tableFile)
  await table(page)
  expect(await downloadCSV(page)).toEqual(tableFile)
  await readonly(page, writes)
})

test('project navigation and reload restore default export settings; empty results disable export', async ({ page }) => {
  await mount(page)
  await select(page, 'Filter izvoza', 'done')
  await select(page, 'Ločilo CSV', ',')
  await page.getByRole('checkbox', { name: 'Stolpec id', exact: true }).uncheck()
  await project(page, 'launch')
  await expect(page.getByRole('combobox', { name: 'Filter izvoza' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV' })).toHaveValue(';')
  await expect(page.getByRole('checkbox', { name: 'Stolpec id', exact: true })).toBeChecked()
  await select(page, 'Filter izvoza', 'in_progress')
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeDisabled()
  await expect(page.locator('[data-task-id]')).toHaveCount(2)
  await project(page, 'web')
  await select(page, 'Filter izvoza', 'done')
  await select(page, 'Ločilo CSV', ',')
  await page.getByRole('checkbox', { name: 'Stolpec id', exact: true }).uncheck()
  await page.reload()
  await expect(page.getByRole('combobox', { name: 'Filter izvoza' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV' })).toHaveValue(';')
  await expect(page.getByRole('checkbox', { name: 'Stolpec id', exact: true })).toBeChecked()

})

test('empty projects have no enabled export', async ({ page }) => {
  await mount(page, [], '#/projects/web')
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeDisabled()
  await expect(page.locator('[data-task-id]')).toHaveCount(0)
})

test('controls fit a narrow screen without widening the page', async ({ page }) => {
  await mount(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
