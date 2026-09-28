import { test, expect, mount, select, downloadCSV, project, examples, makeTask } from '../development/helpers.ts'

test('empty selection and empty result disable CSV export while the project stays visible', async ({ page }) => {
  const records = [examples[0]]
  await mount(page, records)
  const exportButton = page.getByRole('button', { name: 'Izvozi CSV', exact: true })
  for (const key of ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description']) {
    await page.getByRole('checkbox', { name: `Stolpec ${key}`, exact: true }).uncheck()
  }
  await expect(exportButton).toBeDisabled()
  await page.getByRole('checkbox', { name: 'Stolpec title', exact: true }).check()
  await expect(exportButton).toBeEnabled()

  await select(page, 'Filter izvoza', 'todo')
  await expect(exportButton).toBeDisabled()
  await expect(page.locator('[data-task-id]')).toHaveCount(records.length)
  await select(page, 'Filter izvoza', 'all')
  await expect(exportButton).toBeEnabled()
})

test('an empty project cannot be exported', async ({ page }) => {
  await mount(page, [])
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeDisabled()
})

test('status filter changes exported rows but leaves the table intact', async ({ page }) => {
  const records = examples.filter((task) => task.projectId === 'web')
  await mount(page, examples)
  await select(page, 'Filter izvoza', 'done')
  const file = await downloadCSV(page)
  expect(file.text).toContain('"web-03";"web";"Pregled vsebine";"done"')
  expect(file.text).toContain('"web-06";"web";"Zapis, ""citat""";"done"')
  expect(file.text).not.toContain('"web-01"')
  await expect(page.locator('[data-task-id]')).toHaveCount(records.length)
})

test('selected columns follow the fixed field order, not the click order', async ({ page }) => {
  await mount(page)
  for (const key of ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description']) {
    await page.getByRole('checkbox', { name: `Stolpec ${key}`, exact: true }).uncheck()
  }
  for (const key of ['status', 'title', 'id']) {
    await page.getByRole('checkbox', { name: `Stolpec ${key}`, exact: true }).check()
  }
  const file = await downloadCSV(page)
  expect(file.text.startsWith('\uFEFF"id";"title";"status"\r\n')).toBe(true)
  expect(file.text).toContain('"web-06";"Zapis, ""citat""";"done"')
  expect(file.text.indexOf('"web-01"')).toBeLessThan(file.text.indexOf('"web-08"'))
  expect(file.text.endsWith('\r\n')).toBe(true)
})

test('formula neutralization applies after leading whitespace and preserves the original value', async ({ page }) => {
  const record = makeTask('\n=task-id', {
    title: '\t+SUM(1,2)',
    assignee: '  -4+5',
    description: '\r@command "quoted"\nnext;line',
  })
  await mount(page, [record])
  const file = await downloadCSV(page)
  expect(file.text.startsWith('\uFEFF"id";"projectId";"title";"status";"assignee";"dueDate";"description"\r\n')).toBe(true)
  expect(file.text).toContain('"\'\n=task-id"')
  expect(file.text).toContain('"\'\t+SUM(1,2)"')
  expect(file.text).toContain('"\'  -4+5"')
  expect(file.text).toContain('"\'\r@command ""quoted""\nnext;line"')
  expect(file.text).toContain('"2026-09-21"')
  expect(page.context().pages()).toHaveLength(1)
  expect(file.text.endsWith('\r\n')).toBe(true)
})

test('project change and document refresh restore default export settings', async ({ page }) => {
  await mount(page)
  await page.getByRole('checkbox', { name: 'Stolpec id', exact: true }).uncheck()
  await select(page, 'Ločilo CSV', ',')
  await select(page, 'Filter izvoza', 'done')

  await project(page, 'launch')
  await expect(page.getByRole('checkbox', { name: 'Stolpec id', exact: true })).toBeChecked()
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(';')
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')

  await page.getByRole('checkbox', { name: 'Stolpec description', exact: true }).uncheck()
  await select(page, 'Ločilo CSV', ',')
  await select(page, 'Filter izvoza', 'todo')
  await page.reload()
  await expect(page.getByRole('checkbox', { name: 'Stolpec description', exact: true })).toBeChecked()
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(';')
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')
})
