import { test, expect, makeTask, mount, expectIds, select, board, project } from '../development/helpers.ts'

test('filtering matches all normalized literal words and combines exact filters', async ({ page }) => {
  const records = [
    makeTask('id-a', { title: 'Čas za pregled', description: 'Končna vsebina zapisa', status: 'done', assignee: 'Ana Novak' }),
    makeTask('id-b', { title: '.* [literal]', status: 'todo', assignee: 'Ana Novak' }),
    makeTask('id-c', { title: 'Vsebina ČAS', status: 'done', assignee: 'ana Novak' }),
  ]
  await mount(page, records)
  const search = page.getByRole('searchbox', { name: 'Išči opravila' })
  await search.fill('vsebina cas')
  await expectIds(page, ['id-a', 'id-c'])
  await expect(page.locator('[aria-label="Pregled stanj opravil"] strong')).toHaveText(['0', '0', '2'])
  await search.fill('.*')
  await expectIds(page, ['id-b'])
  await search.fill('')
  await select(page, 'Filter stanja', 'done')
  await select(page, 'Filter odgovorne osebe', 'Ana Novak')
  await search.fill('ana')
  await expectIds(page, ['id-a'])
  await select(page, 'Filter odgovorne osebe', 'ana Novak')
  await expectIds(page, ['id-c'])
})

test('assignee choices come from the project and project changes reset filters', async ({ page }) => {
  const records = [
    makeTask('web-a', { status: 'todo', assignee: 'Ana Novak' }),
    makeTask('web-b', { status: 'done', assignee: 'Skrita oseba' }),
    makeTask('launch-a', { projectId: 'launch', status: 'done', assignee: 'Luka Kovač' }),
  ]
  await mount(page, records)
  await select(page, 'Filter stanja', 'todo')
  const people = page.getByRole('combobox', { name: 'Filter odgovorne osebe' })
  await expect(people.locator('option')).toHaveText(['Vse osebe', 'Ana Novak', 'Skrita oseba'])
  await select(page, 'Filter odgovorne osebe', 'Ana Novak')
  await page.getByRole('searchbox', { name: 'Išči opravila' }).fill('web-a')
  await project(page, 'launch')
  await expect(page.getByRole('searchbox', { name: 'Išči opravila' })).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Filter stanja' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter odgovorne osebe' })).toHaveValue('all')
  await expectIds(page, ['launch-a'])
})

test('no matches are clearable in both views and an empty project keeps its empty state', async ({ page }) => {
  const records = [makeTask('web-a'), makeTask('launch-a', { projectId: 'launch' })]
  await mount(page, records)
  await page.getByRole('searchbox', { name: 'Išči opravila' }).fill('ne obstaja')
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await expect(page.getByRole('status', { name: 'Rezultati filtriranja' })).toHaveText('Prikazano: 0 od 1.')
  await expectIds(page, [])
  await board(page)
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await expectIds(page, [])
  await page.getByRole('button', { name: 'Počisti filtre' }).click()
  await expectIds(page, ['web-a'])
  await expect(page.locator('[aria-label="Pregled stanj opravil"] strong')).toHaveText(['1', '0', '0'])
  await expect(page.locator('.column-count')).toHaveText(['1', '0', '0'])
})

test('an empty project keeps its usual empty state and count', async ({ page }) => {
  await mount(page, [])
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
  await expect(page.getByRole('status', { name: 'Rezultati filtriranja' })).toHaveText('Prikazano: 0 od 0.')
})

test('refresh resets filters and keeps the existing view in the URL', async ({ page }) => {
  const records = [makeTask('web-a'), makeTask('web-b', { status: 'done' })]
  await mount(page, records)
  await select(page, 'Filter stanja', 'todo')
  await page.getByRole('searchbox', { name: 'Išči opravila' }).fill('web-a')
  await board(page)
  await expectIds(page, ['web-a'])
  await page.reload()
  await expect(page.getByRole('searchbox', { name: 'Išči opravila' })).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Filter stanja' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter odgovorne osebe' })).toHaveValue('all')
  await expect(page).toHaveURL(/#\/projects\/web\?view=board$/)
  await expectIds(page, ['web-a', 'web-b'])
  await expect(page.getByRole('status', { name: 'Rezultati filtriranja' })).toHaveText('Prikazano: 2 od 2.')
})
