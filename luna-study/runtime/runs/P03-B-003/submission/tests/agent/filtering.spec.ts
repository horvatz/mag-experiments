import { test, expect, mount, makeTask, expectIds, select, board, table, click, project } from '../development/helpers.ts'

test('filtering uses normalized literal terms across all searchable fields', async ({ page }) => {
  const records = [
    makeTask('custom-1', { title: 'Črka & Alfa', description: 'Meta.* slog', assignee: 'Črt' }),
    makeTask('custom-2', { title: 'Alfa', description: 'Samo drugi', assignee: 'Ana' }),
    makeTask('custom-3', { title: 'Meta.*', description: 'Dodaten opis', assignee: 'Zed' }),
  ]
  await mount(page, records)
  await expectIds(page, records.map((task) => task.id))

  const search = page.getByRole('searchbox', { name: 'Išči opravila' })
  await search.fill('META.* c\u030crka')
  await expectIds(page, ['custom-1'])
  await search.fill('custom-3')
  await expectIds(page, ['custom-3'])
  await search.fill('samo drugi')
  await expectIds(page, ['custom-2'])
  await search.fill('CRT')
  await expectIds(page, ['custom-1'])
  await search.fill('.*')
  await expectIds(page, ['custom-1', 'custom-3'])
  await expect(page).toHaveURL(/#\/projects\/web$/)
  await page.reload()
  await expect(search).toHaveValue('')
  await expectIds(page, records.map((task) => task.id))
})

test('assignee options use the whole project and filters combine across views', async ({ page }) => {
  const records = [
    makeTask('web-a', { title: 'Prvi', status: 'done', assignee: 'Ana Novak' }),
    makeTask('web-b', { title: 'Drugi', status: 'todo', assignee: 'Ana Novak' }),
    makeTask('web-c', { title: 'Skrit', status: 'done', assignee: 'Živa Kovač' }),
  ]
  await mount(page, records)
  await select(page, 'Filter stanja', 'todo')
  await expectIds(page, ['web-b'])
  const assigneeSelect = page.getByRole('combobox', { name: 'Filter odgovorne osebe' })
  await expect(assigneeSelect.locator('option')).toHaveText(['Vse osebe', 'Ana Novak', 'Živa Kovač'])
  await assigneeSelect.selectOption('Živa Kovač')
  await expectIds(page, [])
  await expect(page.getByRole('status', { name: 'Rezultati filtriranja' })).toHaveText('Prikazano: 0 od 3.')
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await board(page)
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await expectIds(page, [])
  await click(page, 'Počisti filtre')
  await expect(page.getByRole('searchbox', { name: 'Išči opravila' })).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Filter stanja' })).toHaveValue('all')
  await expect(assigneeSelect).toHaveValue('all')
  await expectIds(page, ['web-a', 'web-b', 'web-c'], false)
  await table(page)
  await expectIds(page, ['web-a', 'web-b', 'web-c'])
})

test('project changes reset local filters and people options', async ({ page }) => {
  const records = [
    makeTask('web-a', { assignee: 'Ana Novak' }),
    makeTask('launch-a', { projectId: 'launch', assignee: 'Maja Zupan' }),
  ]
  await mount(page, records)
  await page.getByRole('searchbox', { name: 'Išči opravila' }).fill('web-a')
  await select(page, 'Filter stanja', 'todo')
  await select(page, 'Filter odgovorne osebe', 'Ana Novak')
  await project(page, 'launch')
  await expect(page.getByRole('searchbox', { name: 'Išči opravila' })).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Filter stanja' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter odgovorne osebe' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter odgovorne osebe' }).locator('option')).toHaveText(['Vse osebe', 'Maja Zupan'])
  await expectIds(page, ['launch-a'])
  await page.setViewportSize({ width: 800, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await board(page)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('empty projects keep their ordinary empty state and zero count', async ({ page }) => {
  await mount(page, [])
  await expect(page.getByRole('status', { name: 'Rezultati filtriranja' })).toHaveText('Prikazano: 0 od 0.')
  await expect(page.getByText('V tem projektu še ni opravil', { exact: true })).toBeVisible()
  await board(page)
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toHaveCount(0)
  await expect(page.getByRole('region', { name: 'Tabla opravil' })).toBeVisible()
})
