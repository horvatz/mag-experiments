import { expect, test } from '@playwright/test'
import { board, click, expectIds, ids, makeTask, mount, project, select, table } from '../development/helpers.ts'

const records = [
  makeTask('web-01', { title: 'Čas za pregled', description: 'Končni zapis vsebine', assignee: 'Ana Novak' }),
  makeTask('web-02', { title: 'Vsebina', description: 'Rok je september', status: 'in_progress', assignee: 'Luka Kovač' }),
  makeTask('web-03', { title: 'Zapis', description: 'Opis vsebine', status: 'done', assignee: 'Ana Novak' }),
  makeTask('web-04', { title: 'Dodatni zapis', description: 'Pomožni opis', status: 'done', assignee: 'Črt' }),
  makeTask('launch-01', { projectId: 'launch', title: 'Jesenski zapis', assignee: 'Ana Novak' }),
  makeTask('launch-02', { projectId: 'launch', title: 'Kampanja', status: 'done', assignee: 'Luka Kovač' }),
]

test('A01: normalized search, combined filters, counts, and clear', async ({ page }) => {
  await mount(page, records)
  const search = page.getByRole('searchbox', { name: 'Išči opravila' })
  const status = page.getByRole('status', { name: 'Rezultati filtriranja' })

  await search.fill('ČRT zapis')
  await expectIds(page, ['web-04'])
  await expect(status).toHaveText('Prikazano: 1 od 4.')

  await select(page, 'Filter stanja', 'done')
  await select(page, 'Filter odgovorne osebe', 'Črt')
  await expectIds(page, ['web-04'])
  await expect(page.locator('[aria-label="Pregled stanj opravil"] strong')).toHaveText(['0', '0', '1'])

  await board(page)
  await expectIds(page, ['web-04'])
  await table(page)
  await expectIds(page, ['web-04'])

  await click(page, 'Počisti filtre')
  await expect(search).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Filter stanja' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter odgovorne osebe' })).toHaveValue('all')
  await expectIds(page, ['web-01', 'web-02', 'web-03', 'web-04'])
  await expect(status).toHaveText('Prikazano: 4 od 4.')
})

test('A02: project switch resets filters and uses current assignees', async ({ page }) => {
  await mount(page, records)
  await page.getByRole('searchbox', { name: 'Išči opravila' }).fill('zapis')
  await select(page, 'Filter stanja', 'done')
  await select(page, 'Filter odgovorne osebe', 'Luka Kovač')

  await project(page, 'launch')
  const assignee = page.getByRole('combobox', { name: 'Filter odgovorne osebe' })
  await expect(page.getByRole('searchbox', { name: 'Išči opravila' })).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Filter stanja' })).toHaveValue('all')
  await expect(assignee).toHaveValue('all')
  await expect(assignee.locator('option')).toHaveText(['Vse osebe', 'Ana Novak', 'Luka Kovač'])
  await expect(page.getByRole('status', { name: 'Rezultati filtriranja' })).toHaveText('Prikazano: 2 od 2.')
})

test('A03: reload starts with defaults and does not persist filters', async ({ page }) => {
  await mount(page, records)
  await page.getByRole('searchbox', { name: 'Išči opravila' }).fill('kampanja')
  await select(page, 'Filter stanja', 'done')
  await select(page, 'Filter odgovorne osebe', 'Ana Novak')
  await expect(page.getByRole('status', { name: 'Rezultati filtriranja' })).toHaveText('Prikazano: 0 od 4.')

  await page.reload()
  await expect(page.getByRole('searchbox', { name: 'Išči opravila' })).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Filter stanja' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter odgovorne osebe' })).toHaveValue('all')
  await expectIds(page, ['web-01', 'web-02', 'web-03', 'web-04'])
})

test('A04: empty project and no-result states stay usable', async ({ page }) => {
  await mount(page, [records[0]], '#/projects/web')
  await page.getByRole('searchbox', { name: 'Išči opravila' }).fill('neobstoječe')
  await expect(page.getByRole('status', { name: 'Rezultati filtriranja' })).toHaveText('Prikazano: 0 od 1.')
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await board(page)
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await click(page, 'Počisti filtre')
  await expectIds(page, ['web-01'])

  await mount(page, [], '#/projects/launch')
  await expect(page.getByRole('status', { name: 'Rezultati filtriranja' })).toHaveText('Prikazano: 0 od 0.')
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
})

test('A05: details remain reachable while filters are active', async ({ page }) => {
  const writes = await mount(page, records)
  await select(page, 'Filter stanja', 'done')
  await expectIds(page, ['web-03', 'web-04'])

  await page.locator('[data-task-id="web-04"]').getByRole('link').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog').getByText('Dodatni zapis')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expectIds(page, ['web-03', 'web-04'])
  await expect(await ids(page)).toEqual(['web-03', 'web-04'])
  expect(writes).toEqual([])
})
