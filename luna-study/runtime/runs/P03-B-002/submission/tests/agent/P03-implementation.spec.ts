import { test, expect, mount, makeTask, examples, project, board, table, select } from '../development/helpers.ts'

test('P03: Unicode whole-word-set search uses literal text and counts matching records', async ({ page }) => {
  const records = [
    makeTask('alpha.1', { title: 'Alpha + (one)', description: 'ČAS in [kvadrat]', status: 'done', assignee: 'Živa Kovač' }),
    makeTask('beta-2', { title: 'Drugo opravilo', description: 'Navadno besedilo', assignee: 'Maja Zupan' }),
  ]
  await mount(page, records)
  await expect(page.getByRole('status', { name: 'Rezultati filtriranja' })).toHaveText('Prikazano: 2 od 2.')
  await page.getByRole('searchbox', { name: 'Išči opravila' }).fill('KOVAC [KVADRAT] alpha +')
  await expect(page.locator('[data-task-id]')).toHaveAttribute('data-task-id', 'alpha.1')
  await expect(page.getByRole('status', { name: 'Rezultati filtriranja' })).toHaveText('Prikazano: 1 od 2.')
  await page.getByRole('searchbox', { name: 'Išči opravila' }).fill('[kvadra]')
  await expect(page.locator('[data-task-id]')).toHaveCount(0)
})

test('P03: people options use the whole project and switching project resets filters', async ({ page }) => {
  await mount(page, examples)
  await select(page, 'Filter stanja', 'done')
  const people = page.getByRole('combobox', { name: 'Filter odgovorne osebe' })
  await expect(people.locator('option')).toHaveText(['Vse osebe', 'Ana Novak', 'Luka Kovač', 'Maja Zupan', 'Živa Kovač', 'Črt'])
  await select(page, 'Filter odgovorne osebe', 'Ana Novak')
  await expect(page.locator('[data-task-id]')).toHaveAttribute('data-task-id', 'web-03')
  await project(page, 'launch')
  await expect(page.getByRole('searchbox', { name: 'Išči opravila' })).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Filter stanja' })).toHaveValue('all')
  await expect(people).toHaveValue('all')
  await expect(page.getByRole('status', { name: 'Rezultati filtriranja' })).toHaveText('Prikazano: 2 od 2.')
  await select(page, 'Filter stanja', 'todo')
  await board(page)
  await expect(page.locator('[data-task-id]')).toHaveAttribute('data-task-id', 'launch-01')
  await table(page)
  await expect(page.getByRole('combobox', { name: 'Filter stanja' })).toHaveValue('todo')
  await page.getByRole('searchbox', { name: 'Išči opravila' }).fill('Drugi')
  await select(page, 'Filter stanja', 'done')
  await select(page, 'Filter odgovorne osebe', 'Luka Kovač')
  await expect(page.locator('[data-task-id]')).toHaveAttribute('data-task-id', 'launch-02')
  await page.getByRole('button', { name: 'Počisti filtre' }).click()
  await expect(page.getByRole('searchbox', { name: 'Išči opravila' })).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Filter stanja' })).toHaveValue('all')
  await expect(people).toHaveValue('all')
  await expect(page.locator('[data-task-id]')).toHaveCount(2)
  await page.getByRole('searchbox', { name: 'Išči opravila' }).fill('neobstojece')
  await select(page, 'Filter stanja', 'done')
  await select(page, 'Filter odgovorne osebe', 'Luka Kovač')
  await page.reload()
  await expect(page.getByRole('searchbox', { name: 'Išči opravila' })).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Filter stanja' })).toHaveValue('all')
  await expect(people).toHaveValue('all')
  await expect(page.getByRole('status', { name: 'Rezultati filtriranja' })).toHaveText('Prikazano: 2 od 2.')
})

test('P03: empty projects keep their ordinary empty state and zero result count', async ({ page }) => {
  await mount(page, [])
  await expect(page.getByRole('status', { name: 'Rezultati filtriranja' })).toHaveText('Prikazano: 0 od 0.')
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
})
