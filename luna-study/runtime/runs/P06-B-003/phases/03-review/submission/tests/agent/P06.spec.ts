import { test, expect, mount, select, downloadCSV, project, makeTask } from '../development/helpers.ts'

test('CSV availability follows the selected columns and matching rows without filtering the view', async ({ page }) => {
  const record = makeTask('web-only-done', { status: 'done' })
  await mount(page, [record])
  const exportButton = page.getByRole('button', { name: 'Izvozi CSV', exact: true })

  for (const checkbox of await page.getByRole('checkbox').all()) await checkbox.uncheck()
  await expect(exportButton).toBeDisabled()
  await page.getByRole('checkbox', { name: 'Stolpec title', exact: true }).check()
  await select(page, 'Filter izvoza', 'todo')
  await expect(exportButton).toBeDisabled()
  await expect(page.locator('[data-task-id="web-only-done"]')).toHaveCount(1)

  await select(page, 'Filter izvoza', 'done')
  await expect(exportButton).toBeEnabled()
  const file = await downloadCSV(page)
  expect(file.text).toBe('\uFEFF"title"\r\n"Opravilo web-only-done"\r\n')
})

test('changing projects restores the default CSV settings', async ({ page }) => {
  await mount(page)
  await page.getByRole('checkbox', { name: 'Stolpec title', exact: true }).uncheck()
  await select(page, 'Ločilo CSV', ',')
  await select(page, 'Filter izvoza', 'done')
  await project(page, 'launch')

  for (const checkbox of await page.getByRole('checkbox').all()) await expect(checkbox).toBeChecked()
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(';')
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')
  expect((await downloadCSV(page)).name).toBe('folio-launch.csv')
})

test('CSV preserves CR and LF inside quoted cells while neutralizing formula prefixes', async ({ page }) => {
  const record = makeTask('\t=1', {
    title: '\r\n+SUM(1,2)',
    assignee: ' @Ana',
    description: '\n- opis\r\nv nadaljevanju',
  })
  await mount(page, [record])
  const file = await downloadCSV(page)

  expect(file.text).toContain('"\'\t=1"')
  expect(file.text).toContain('"\'\r\n+SUM(1,2)"')
  expect(file.text).toContain('"\' @Ana"')
  expect(file.text).toContain('"\'\n- opis\r\nv nadaljevanju"')
})
