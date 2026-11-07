import { board, downloadCSV, expect, makeTask, mount, project, readonly, select, test } from '../development/helpers.ts'

const header = '"id";"projectId";"title";"status";"assignee";"dueDate";"description"'

test('exports exact CSV framing, quoting, Unicode and formula neutralization', async ({ page }) => {
  await mount(page, [
    makeTask('csv-01', {
      title: 'Zapis, "citat"',
      description: 'Prva vrstica\r\nDruga; čšž',
      assignee: 'Črt Žůzek',
      status: 'done',
    }),
    makeTask('csv-02', { title: ' \t\r\n=SUM(A1)', status: 'todo' }),
  ])

  const file = await downloadCSV(page)
  expect(file.name).toBe('folio-web.csv')
  expect(file.text).toBe(
    '\uFEFF' + header + '\r\n' +
    '"csv-01";"web";"Zapis, ""citat""";"done";"Črt Žůzek";"2026-09-21";"Prva vrstica\r\nDruga; čšž"\r\n' +
    '"csv-02";"web";"\' \t\r\n=SUM(A1)";"todo";"Ana Novak";"2026-09-21";"Opis opravila csv-02"\r\n',
  )
})

test('empty results disable export while views remain available', async ({ page }) => {
  await mount(page, [makeTask('launch-01', { projectId: 'launch' })])
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeDisabled()
  await expect(page.getByText('V tem projektu še ni opravil')).toBeVisible()
})

test('view parity, project reset, reload reset and no writes', async ({ page }) => {
  const writes = await mount(page)
  await select(page, 'Filter izvoza', 'done')
  await select(page, 'Ločilo CSV', ',')
  for (const column of ['projectId', 'title', 'status', 'assignee', 'dueDate', 'description']) {
    await page.getByRole('checkbox', { name: 'Stolpec ' + column, exact: true }).uncheck()
  }
  const tableFile = await downloadCSV(page)
  await board(page)
  const boardFile = await downloadCSV(page)
  expect(boardFile.text).toEqual(tableFile.text)

  await project(page, 'launch')
  await expect(page.getByRole('checkbox', { name: 'Stolpec id', exact: true })).toBeChecked()
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(';')

  await project(page, 'web')
  await select(page, 'Filter izvoza', 'done')
  await select(page, 'Ločilo CSV', ',')
  await page.getByRole('checkbox', { name: 'Stolpec id', exact: true }).uncheck()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Spletna prenova', exact: true })).toBeVisible()
  await expect(page.getByRole('checkbox', { name: 'Stolpec id', exact: true })).toBeChecked()
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(';')
  await page.setViewportSize({ width: 390, height: 844 })
  await readonly(page, writes)
})

test('disables export without columns or matching rows', async ({ page }) => {
  await mount(page, [
    makeTask('web-01', { status: 'done' }),
    makeTask('web-02', { status: 'todo' }),
  ])

  for (const column of ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description']) {
    await page.getByRole('checkbox', { name: 'Stolpec ' + column, exact: true }).uncheck()
  }
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeDisabled()
  await page.getByRole('checkbox', { name: 'Stolpec id', exact: true }).check()
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeEnabled()

  await select(page, 'Filter izvoza', 'in_progress')
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeDisabled()
  await select(page, 'Filter izvoza', 'done')
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeEnabled()
})
