import { expect, test, mount, select, downloadCSV, project, makeTask, type Task } from '../development/helpers.ts'

test('A01: R03 - brez izbranih kolon onemogoči izvoz, ponovni izbor omogoči', async ({ page }) => {
  await mount(page)
  const button = page.getByRole('button', { name: 'Izvozi CSV', exact: true })
  await expect(button).toBeEnabled()
  for (const key of ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description']) {
    await page.getByRole('checkbox', { name: 'Stolpec ' + key, exact: true }).uncheck()
  }
  await expect(button).toBeDisabled()
  await page.getByRole('checkbox', { name: 'Stolpec title', exact: true }).check()
  await expect(button).toBeEnabled()
})

test('A02: R04 - prazen filtrirani rezultat onemogoči izvoz', async ({ page }) => {
  await mount(page, undefined, '#/projects/launch')
  const button = page.getByRole('button', { name: 'Izvozi CSV', exact: true })
  await select(page, 'Filter izvoza', 'in_progress')
  await expect(button).toBeDisabled()
  await select(page, 'Filter izvoza', 'todo')
  await expect(button).toBeEnabled()
})

test('A03: R02 - obraten vrstni red klikov ohrani nespremenljiv vrstni red kolon', async ({ page }) => {
  await mount(page)
  const keys = ['description', 'dueDate', 'assignee', 'status', 'title', 'projectId', 'id']
  for (const key of keys) await page.getByRole('checkbox', { name: 'Stolpec ' + key, exact: true }).uncheck()
  for (const key of [...keys].reverse()) await page.getByRole('checkbox', { name: 'Stolpec ' + key, exact: true }).check()
  const file = await downloadCSV(page)
  expect(file.text.startsWith('\uFEFF"id";"projectId";"title";"status";"assignee";"dueDate";"description"\r\n')).toBe(true)
})

test('A04: R08 - nevtralizacija formul za vse podatkovne kolone, glava ostane', async ({ page }) => {
  const records: Task[] = [
    makeTask('web-01', { title: '+plus', description: '-minus' }),
    makeTask('web-02', { title: '@at', description: ' =eq' }),
    makeTask('web-03', { title: '\t+tab', description: 'navaden' }),
  ]
  await mount(page, records)
  const file = await downloadCSV(page)
  expect(file.text.startsWith('\uFEFF"id";')).toBe(true)
  expect(file.text).toContain('"\'+plus"')
  expect(file.text).toContain('"\'-minus"')
  expect(file.text).toContain('"\'@at"')
  expect(file.text).toContain('"\' =eq"')
  expect(file.text).toContain('"\'\t+tab"')
  expect(file.text).toContain('"navaden"')
  expect(file.text).not.toContain('"\'id"')
})

test('A05: R11 - menjava projekta in osvežitev ponastavita nastavitve', async ({ page }) => {
  await mount(page)
  await page.getByRole('checkbox', { name: 'Stolpec description', exact: true }).uncheck()
  await select(page, 'Ločilo CSV', ',')
  await select(page, 'Filter izvoza', 'done')
  await project(page, 'launch')
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(';')
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')
  await expect(page.getByRole('checkbox', { name: 'Stolpec description', exact: true })).toBeChecked()
  const afterSwitch = await downloadCSV(page)
  expect(afterSwitch.text.startsWith('\uFEFF"id";"projectId";"title";"status";"assignee";"dueDate";"description"\r\n')).toBe(true)
  await select(page, 'Filter izvoza', 'done')
  await select(page, 'Ločilo CSV', ',')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Jesenska kampanja', exact: true })).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(';')
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')
})
