import { expect, makeTask, mount, select, downloadCSV, project, test, type Task } from '../development/helpers.ts'

const records: Task[] = [
  makeTask('web-a', {
    title: ' =Šumniki čž, "citat"',
    description: 'Vrstica\nDruga vrstica; čšž',
    status: 'todo',
    assignee: 'Žiga Špaček',
    dueDate: '2026-10-31',
  }),
  makeTask('web-b', {
    title: '-Naloga',
    description: '\t+Formula in @ime',
    status: 'done',
    assignee: 'Ana Žž',
    dueDate: '2026-11-01',
  }),
  makeTask('launch-a', {
    projectId: 'launch',
    title: ' @Jesenski zapis',
    status: 'in_progress',
    assignee: 'Luka Kovač',
    dueDate: '2026-11-02',
  }),
]

test('A01: default export uses exact framing, source order, UTF-8 BOM and no writes', async ({ page }) => {
  const writes = await mount(page, records)
  const file = await downloadCSV(page)

  expect(file.name).toBe('folio-web.csv')
  expect(file.text).toBe([
    '"id";"projectId";"title";"status";"assignee";"dueDate";"description"',
    '"web-a";"web";"\' =Šumniki čž, ""citat""";"todo";"Žiga Špaček";"2026-10-31";"Vrstica\nDruga vrstica; čšž"',
    '"web-b";"web";"\'-Naloga";"done";"Ana Žž";"2026-11-01";"\'\t+Formula in @ime"',
  ].map((line) => line).join('\r\n').replace(/^/, '\uFEFF') + '\r\n')
  expect(writes).toEqual([])
  expect(page.url()).not.toContain('/__test/')
})

test('A02: no columns and empty filtered result disable export; column order is invariant', async ({ page }) => {
  await mount(page, records)

  for (const column of ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description']) {
    await page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true }).uncheck()
  }
  const exportButton = page.getByRole('button', { name: 'Izvozi CSV', exact: true })
  await expect(exportButton).toBeDisabled()

  await page.getByRole('checkbox', { name: 'Stolpec description', exact: true }).check()
  await page.getByRole('checkbox', { name: 'Stolpec id', exact: true }).check()
  await select(page, 'Filter izvoza', 'done')
  await select(page, 'Ločilo CSV', ',')
  const file = await downloadCSV(page)
  expect(file.text).toBe(`\uFEFF"id","description"\r\n"web-b","'\t+Formula in @ime"\r\n`)

  await select(page, 'Filter izvoza', 'in_progress')
  await expect(exportButton).toBeDisabled()
})

test('A03: empty project disables export', async ({ page }) => {
  await mount(page, records.filter((task) => task.projectId !== 'launch'), '#/projects/launch')
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeDisabled()
})

test('A04: view switch keeps settings and produces identical CSV bytes', async ({ page }) => {
  await mount(page, records)
  await page.getByRole('checkbox', { name: 'Stolpec projectId', exact: true }).uncheck()
  await select(page, 'Filter izvoza', 'todo')
  await select(page, 'Ločilo CSV', ',')
  const first = await downloadCSV(page)

  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Tabla opravil' })).toBeVisible()
  await expect(page.locator('#csv-separator')).toHaveValue(',')
  await expect(page.locator('#export-filter')).toHaveValue('todo')
  await expect(page.getByRole('checkbox', { name: 'Stolpec projectId', exact: true })).not.toBeChecked()
  const second = await downloadCSV(page)
  expect(second).toEqual(first)
})

test('A05: project change resets settings and sequential exports reflect current settings', async ({ page }) => {
  await mount(page, records)
  await select(page, 'Filter izvoza', 'done')
  await select(page, 'Ločilo CSV', ',')
  await page.getByRole('checkbox', { name: 'Stolpec title', exact: true }).uncheck()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Spletna prenova', exact: true })).toBeVisible()
  await expect(page.locator('#csv-separator')).toHaveValue(';')
  await expect(page.locator('#export-filter')).toHaveValue('all')
  await expect(page.getByRole('checkbox', { name: 'Stolpec title', exact: true })).toBeChecked()
  await project(page, 'launch')

  await expect(page.locator('#csv-separator')).toHaveValue(';')
  await expect(page.locator('#export-filter')).toHaveValue('all')
  for (const column of ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description']) {
    await expect(page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true })).toBeChecked()
  }
  const defaultFile = await downloadCSV(page)
  expect(defaultFile.name).toBe('folio-launch.csv')
  expect(defaultFile.text).toContain('"launch-a";"launch";"\' @Jesenski zapis"')

  await select(page, 'Filter izvoza', 'in_progress')
  await page.getByRole('checkbox', { name: 'Stolpec description', exact: true }).uncheck()
  const changedFile = await downloadCSV(page)
  const repeatedFile = await downloadCSV(page)
  expect(changedFile.text).toBe(repeatedFile.text)
  expect(changedFile.text).not.toBe(defaultFile.text)
})
