import { test, expect, mount, downloadCSV, select, board, project, table, ids } from '../development/helpers.ts'
import { makeTask } from '../development/helpers.ts'

test('CSV quotes fields, preserves embedded line breaks and neutralizes formulas after leading whitespace', async ({ page }) => {
  const records = [makeTask('web-1', {
    title: ' \t=SUM("A1")',
    assignee: '\r+cmd',
    description: '\n@payload, čšž',
  }), makeTask('web-2', { title: '-1+2', description: 'Prva\r\nDruga; "citat"' })]
  await mount(page, records)
  for (const key of ['id', 'projectId', 'status', 'dueDate']) {
    await page.getByRole('checkbox', { name: `Stolpec ${key}`, exact: true }).uncheck()
  }
  await select(page, 'Ločilo CSV', ',')

  const pageUrl = page.url()
  const file = await downloadCSV(page)
  expect(page.url()).toBe(pageUrl)
  expect(page.context().pages()).toHaveLength(1)
  expect(file.text).toBe('\uFEFF"title","assignee","description"\r\n"\' \t=SUM(""A1"")","\'\r+cmd","\'\n@payload, čšž"\r\n"\'-1+2","Ana Novak","Prva\r\nDruga; ""citat"""\r\n')
})

test('empty columns disable export and a remaining selected column restores it', async ({ page }) => {
  await mount(page)
  for (const key of ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description']) {
    await page.getByRole('checkbox', { name: `Stolpec ${key}`, exact: true }).uncheck()
  }
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeDisabled()
  for (const key of ['description', 'status', 'id', 'dueDate']) {
    await page.getByRole('checkbox', { name: `Stolpec ${key}`, exact: true }).check()
  }
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeEnabled()
  expect((await downloadCSV(page)).text).toContain('"id";"status";"dueDate";"description"\r\n"web-01";"in_progress";"2026-09-18";"Končni zapis vsebine"')
})

test('empty project disables export', async ({ page }) => {
  await mount(page, [])
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeDisabled()
})

test('an empty filtered result disables export without hiding visible tasks', async ({ page }) => {
  await mount(page, [makeTask('web-only', { status: 'done' })])
  await select(page, 'Filter izvoza', 'todo')
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeDisabled()
  expect(await ids(page)).toEqual(['web-only'])
})

test('filter leaves the project view intact and settings persist across views but reset for another project and refresh', async ({ page }) => {
  await mount(page)
  const before = await ids(page)
  await select(page, 'Filter izvoza', 'done')
  await select(page, 'Ločilo CSV', ',')
  for (const key of ['projectId', 'title', 'status', 'assignee', 'dueDate', 'description']) {
    await page.getByRole('checkbox', { name: `Stolpec ${key}`, exact: true }).uncheck()
  }
  const filtered = await downloadCSV(page)
  expect(filtered.text).toContain('"web-03"')
  expect(filtered.text).not.toContain('"web-01"')
  expect(await ids(page)).toEqual(before)

  await board(page)
  expect(await downloadCSV(page)).toEqual(filtered)
  await table(page)
  await project(page, 'launch')
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(';')
  await expect(page.getByRole('checkbox', { name: 'Stolpec description', exact: true })).toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Stolpec title', exact: true })).toBeChecked()

  await select(page, 'Filter izvoza', 'todo')
  await select(page, 'Ločilo CSV', ',')
  await page.getByRole('checkbox', { name: 'Stolpec title', exact: true }).uncheck()
  await page.reload()
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(';')
  await expect(page.getByRole('checkbox', { name: 'Stolpec title', exact: true })).toBeChecked()
})
