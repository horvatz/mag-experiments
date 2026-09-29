import { test, expect, mount, downloadCSV, board, project, select, examples, makeTask } from '../development/helpers.ts'

test('CSV uses canonical columns, source order, raw status/date, and formula protection', async ({ page }) => {
  const tasks = [
    makeTask('web-a', { title: ' 	=1,2', description: 'Opis, "citat"\r\ndruga vrstica čšž', status: 'in_progress', dueDate: '2026-09-27' }),
    makeTask('web-b', { title: '\r\n@name', description: 'Navadno besedilo', status: 'done' }),
    makeTask('web-c', { title: '  +varno', status: 'todo' }),
    makeTask('web-d', { title: '-formula', status: 'done' }),
  ]
  await mount(page, tasks)
  for (const key of ['projectId', 'assignee']) await page.getByRole('checkbox', { name: `Stolpec ${key}`, exact: true }).uncheck()
  for (const key of ['description', 'dueDate', 'status', 'title']) await page.getByRole('checkbox', { name: `Stolpec ${key}`, exact: true }).check()
  const file = await downloadCSV(page)
  expect(file.name).toBe('folio-web.csv')
  expect(file.text).toBe('\uFEFF"id";"title";"status";"dueDate";"description"\r\n"web-a";"\' \t=1,2";"in_progress";"2026-09-27";"Opis, ""citat""\r\ndruga vrstica čšž"\r\n"web-b";"\'\r\n@name";"done";"2026-09-21";"Navadno besedilo"\r\n"web-c";"\'  +varno";"todo";"2026-09-21";"Opis opravila web-c"\r\n"web-d";"\'-formula";"done";"2026-09-21";"Opis opravila web-d"\r\n')
  await select(page, 'Ločilo CSV', ',')
  const commaFile = await downloadCSV(page)
  expect(commaFile.text).toContain('\uFEFF"id","title","status","dueDate","description"\r\n')
  expect(commaFile.text).toContain('"web-a","\' \t=1,2","in_progress","2026-09-27","Opis, ""citat""\r\ndruga vrstica čšž"\r\n')
})

test('CSV filter and empty column selection only affect export availability', async ({ page }) => {
  await mount(page)
  for (const key of ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description']) {
    await page.getByRole('checkbox', { name: `Stolpec ${key}`, exact: true }).uncheck()
  }
  const button = page.getByRole('button', { name: 'Izvozi CSV', exact: true })
  await expect(button).toBeDisabled()
  await select(page, 'Ločilo CSV', ',')
  await select(page, 'Filter izvoza', 'in_progress')
  await expect(page.locator('[data-task-id]')).toHaveCount(8)
  await page.getByRole('checkbox', { name: 'Stolpec title', exact: true }).check()
  const filtered = await downloadCSV(page)
  expect(filtered.text).toBe('\uFEFF"title"\r\n"Čas za pregled"\r\n"alfa 2"\r\n')
  await select(page, 'Filter izvoza', 'todo')
  for (const key of ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description']) {
    await page.getByRole('checkbox', { name: `Stolpec ${key}`, exact: true }).uncheck()
  }
  await expect(button).toBeDisabled()
  await page.getByRole('checkbox', { name: 'Stolpec id', exact: true }).check()
  expect((await downloadCSV(page)).text).toContain('"web-02"')
})

test('empty projects keep export disabled while controls remain available', async ({ page }) => {
  await mount(page, [])
  const button = page.getByRole('button', { name: 'Izvozi CSV', exact: true })
  await expect(button).toBeDisabled()
  await expect(page.getByRole('checkbox', { name: 'Stolpec id', exact: true })).toBeVisible()
})

test('an empty filtered result disables export without filtering the project view', async ({ page }) => {
  await mount(page, [makeTask('web-only')])
  const button = page.getByRole('button', { name: 'Izvozi CSV', exact: true })
  await select(page, 'Filter izvoza', 'done')
  await expect(button).toBeDisabled()
  await expect(page.locator('[data-task-id="web-only"]')).toBeVisible()
})

test('settings persist across views and reset after project navigation and refresh', async ({ page }) => {
  await mount(page, examples)
  for (const key of ['projectId', 'title', 'status', 'assignee', 'dueDate', 'description']) {
    await page.getByRole('checkbox', { name: `Stolpec ${key}`, exact: true }).uncheck()
  }
  await select(page, 'Ločilo CSV', ',')
  await select(page, 'Filter izvoza', 'done')
  const first = await downloadCSV(page)
  await board(page)
  expect(await downloadCSV(page)).toEqual(first)

  await project(page, 'launch')
  await expect(page.getByRole('checkbox', { name: 'Stolpec id', exact: true })).toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Stolpec description', exact: true })).toBeChecked()
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV' })).toHaveValue(';')
  await expect(page.getByRole('combobox', { name: 'Filter izvoza' })).toHaveValue('all')
  await page.reload()
  await expect(page.getByRole('checkbox', { name: 'Stolpec id', exact: true })).toBeChecked()
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV' })).toHaveValue(';')
  await expect(page.getByRole('combobox', { name: 'Filter izvoza' })).toHaveValue('all')
})
