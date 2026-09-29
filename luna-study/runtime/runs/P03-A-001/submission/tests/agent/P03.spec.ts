import { test, expect, mount, expectIds, select, board, table, project, makeTask, examples } from '../development/helpers.ts'

test('A01: token search normalizes Unicode and treats punctuation literally across fields', async ({ page }) => {
  const records = [
    makeTask('črt-[1]', { title: 'Črna mačka', description: 'foo.bar + [x]', assignee: 'Živa Novak' }),
    makeTask('other', { title: 'Mačka crna', description: 'fooXbar', assignee: 'Ana Novak' }),
    makeTask('person-case', { title: 'Drugo opravilo', assignee: 'živa Novak' }),
  ]
  await mount(page, records)
  const search = page.getByRole('searchbox', { name: 'Išči opravila' })
  await expect(search).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Filter stanja' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter odgovorne osebe' })).toHaveValue('all')
  await expect(page.getByRole('status', { name: 'Rezultati filtriranja' })).toHaveText('Prikazano: 3 od 3.')

  await search.fill('MACKA ČRNA')
  await expectIds(page, ['črt-[1]', 'other'])
  await search.fill('foo.bar')
  await expectIds(page, ['črt-[1]'])
  await search.fill('ŽIVA')
  await expectIds(page, ['črt-[1]', 'person-case'])
  await search.fill('ČRT')
  await expectIds(page, ['črt-[1]'])
  await search.fill('  ')
  await expectIds(page, ['črt-[1]', 'other', 'person-case'])
  await select(page, 'Filter odgovorne osebe', 'Živa Novak')
  await expectIds(page, ['črt-[1]'])
})

test('A02: assignee options use the full project and project change resets all filters', async ({ page }) => {
  await mount(page)
  const people = page.getByRole('combobox', { name: 'Filter odgovorne osebe' })
  await select(page, 'Filter stanja', 'done')
  await expectIds(page, ['web-03', 'web-06'])
  await expect(people.locator('option')).toHaveText(['Vse osebe', 'Ana Novak', 'Luka Kovač', 'Maja Zupan', 'Živa Kovač', 'Črt'])
  await select(page, 'Filter odgovorne osebe', 'Ana Novak')
  await page.getByRole('searchbox', { name: 'Išči opravila' }).fill('pregled')
  await expectIds(page, ['web-03'])
  await page.getByRole('button', { name: 'Počisti filtre' }).click()
  await expect(page.getByRole('searchbox', { name: 'Išči opravila' })).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Filter stanja' })).toHaveValue('all')
  await expect(people).toHaveValue('all')
  await expectIds(page, ['web-01', 'web-02', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
  await select(page, 'Filter stanja', 'done')
  await select(page, 'Filter odgovorne osebe', 'Živa Kovač')
  await page.getByRole('searchbox', { name: 'Išči opravila' }).fill('zapis')
  await project(page, 'launch')
  await expectIds(page, ['launch-01', 'launch-02'])
  await expect(page.getByRole('searchbox', { name: 'Išči opravila' })).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Filter stanja' })).toHaveValue('all')
  await expect(people).toHaveValue('all')
  await expect(people.locator('option')).toHaveText(['Vse osebe', 'Ana Novak', 'Luka Kovač'])
})

test('A03: refresh restores defaults and no-match message is useful in both views', async ({ page }) => {
  await mount(page)
  await page.getByRole('searchbox', { name: 'Išči opravila' }).fill('ni-zadetka')
  await expectIds(page, [])
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await board(page)
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await expectIds(page, [])
  await table(page)
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await page.reload()
  await expectIds(page, examples.filter((task) => task.projectId === 'web').map((task) => task.id))
  await expect(page.getByRole('searchbox', { name: 'Išči opravila' })).toHaveValue('')
  await expect(page).not.toHaveURL(/ni-zadetka/)
})

test('A04: empty project keeps the ordinary empty state and zero result count', async ({ page }) => {
  await mount(page, [])
  await expect(page.getByRole('status', { name: 'Rezultati filtriranja' })).toHaveText('Prikazano: 0 od 0.')
  await expect(page.getByText('V tem projektu še ni opravil')).toBeVisible()
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toHaveCount(0)
  await board(page)
  await expect(page.getByText('Ni opravil v tem stanju.')).toHaveCount(3)
  await expect(page.getByRole('status', { name: 'Rezultati filtriranja' })).toHaveText('Prikazano: 0 od 0.')
})

test('A05: table and board stay within a narrow page while showing the same filtered tasks', async ({ page }) => {
  await mount(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await select(page, 'Filter stanja', 'in_progress')
  await expectIds(page, ['web-01', 'web-05'])
  await expect(page.locator('[aria-label="Pregled stanj opravil"] strong')).toHaveText(['0', '2', '0'])
  await expect(page.locator('.table-footer')).toContainText('0 / 2 končanih')
  await board(page)
  await expectIds(page, ['web-01', 'web-05'])
  await expect(page.getByRole('region', { name: 'Tabla opravil' }).locator('.column-count')).toHaveText(['0', '2', '0'])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await table(page)
  await expectIds(page, ['web-01', 'web-05'])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('A06: lists more than ten tasks in source order and filters each status', async ({ page }) => {
  const records = Array.from({ length: 12 }, (_, index) => makeTask(`id-${20 - index}`, {
    title: `Ponovljen naslov ${index % 3}`,
    status: (['todo', 'in_progress', 'done'] as const)[index % 3],
    assignee: `Oseba ${index % 4}`,
  }))
  await mount(page, records)
  await expectIds(page, records.map((task) => task.id))
  await expect(page.getByRole('status', { name: 'Rezultati filtriranja' })).toHaveText('Prikazano: 12 od 12.')
  await select(page, 'Filter stanja', 'done')
  const doneIds = records.filter((task) => task.status === 'done').map((task) => task.id)
  await expectIds(page, doneIds)
  await board(page)
  await expectIds(page, doneIds)
})
