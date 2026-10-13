import { test, expect, mount, downloadCSV, select, board, makeTask, webIds } from '../development/helpers.ts'

test('L01 reverse click order keeps canonical column order (R02)', async ({ page }) => {
  await mount(page)
  for (const key of ['projectId','title','status','assignee','dueDate','description']) await page.getByRole('checkbox', { name: 'Stolpec '+key, exact: true }).uncheck()
  await page.getByRole('checkbox', { name: 'Stolpec description', exact: true }).check()
  await page.getByRole('checkbox', { name: 'Stolpec title', exact: true }).check()
  expect((await downloadCSV(page)).text.split('\r\n')[0]).toBe('\uFEFF"id";"title";"description"')
})

test('L02 empty selection disables export; reselect enables (R03)', async ({ page }) => {
  await mount(page)
  for (const key of ['id','projectId','title','status','assignee','dueDate','description']) await page.getByRole('checkbox', { name: 'Stolpec '+key, exact: true }).uncheck()
  const button = page.getByRole('button', { name: 'Izvozi CSV', exact: true })
  await expect(button).toBeDisabled()
  let downloads = 0; page.on('download', () => { downloads += 1 })
  await page.evaluate(() => document.querySelector('button.export-button')?.click())
  await page.waitForTimeout(200)
  expect(downloads).toBe(0)
  await page.getByRole('checkbox', { name: 'Stolpec title', exact: true }).check()
  await expect(button).toBeEnabled()
  await downloadCSV(page)
  expect(downloads).toBe(1)
})

test('L03 empty project and empty filtered result disable export, list intact (R04)', async ({ page }) => {
  await mount(page, [], '#/projects/web')
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeDisabled()
  await expect(page.getByText('V tem projektu še ni opravil')).toBeVisible()
  await mount(page, [makeTask('web-01', { title: 'Ena' })], '#/projects/web')
  await select(page, 'Filter izvoza', 'done')
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeDisabled()
  await expect(page.locator('[data-task-id="web-01"]')).toBeVisible()
})

test('L04 neutralization, CRLF, unicode, internal status/date (R07, R08, R09)', async ({ page }) => {
  const records = [
    makeTask('web-01', { title: '+plus', description: '\t=tab' }),
    makeTask('web-02', { title: '-minus' }),
    makeTask('web-03', { title: '@at' }),
    makeTask('web-04', { title: '\r\n=crlf' }),
    makeTask('web-05', { title: ' navaden' }),
    makeTask('web-06', { title: '=ena "citat"', description: 'Prva\nDruga; čšž', status: 'done', dueDate: '2026-12-31' }),
  ]
  await mount(page, records, '#/projects/web')
  const file = await downloadCSV(page)
  expect(file.text).toContain('"\'+plus"')
  expect(file.text).toContain('"\'\t=tab"')
  expect(file.text).toContain('"\'-minus"')
  expect(file.text).toContain('"\'@at"')
  expect(file.text).toContain('"\'\r\n=crlf"')
  expect(file.text).toContain('" navaden"')
  expect(file.text).toContain('"\'=ena ""citat"""')
  expect(file.text).toContain('Prva\nDruga; čšž')
  expect(file.text).toContain('"done"')
  expect(file.text).toContain('"2026-12-31"')
  expect(file.text.endsWith('\r\n')).toBe(true)
})

test('L05 view switch keeps settings; project change and reload reset (R10, R11)', async ({ page }) => {
  await mount(page)
  await page.getByRole('checkbox', { name: 'Stolpec description', exact: true }).uncheck()
  await select(page, 'Ločilo CSV', ',')
  const first = await downloadCSV(page)
  await board(page)
  expect(await downloadCSV(page)).toEqual(first)
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(',')
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Jesenska kampanja', exact: true })).toBeVisible()
  await expect(page.getByRole('checkbox', { name: 'Stolpec description', exact: true })).toBeChecked()
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(';')
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Spletna prenova', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Spletna prenova', exact: true })).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Spletna prenova', exact: true })).toBeVisible()
  await expect(page.getByRole('checkbox', { name: 'Stolpec description', exact: true })).toBeChecked()
})

test('L06 default export keeps API order, name and BOM, no writes (R01, R05, R12)', async ({ page }) => {
  const writes = await mount(page)
  const file = await downloadCSV(page)
  expect(file.name).toBe('folio-web.csv')
  expect(file.text.charCodeAt(0)).toBe(0xFEFF)
  const ids = file.text.slice(1).trimEnd().split('\r\n').map((line) => line.split(';')[0].replaceAll('"', ''))
  expect(ids).toEqual(webIds())
  expect(writes).toEqual([])
})
