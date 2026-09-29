import { board, details, expect, expectIds, makeTask, mount, project, readonly, select, summary, table, test } from '../development/helpers.ts'

test('R01-R04: normalized literal search and combined filters', async ({ page }) => {
  const tasks = [
    makeTask('Č-42', { title: 'Čas za čaj', description: 'Opis, zvezda a+b[1]', assignee: 'Ana Černa', status: 'done' }),
    makeTask('other', { title: 'foo elsewhere', description: 'Second note', assignee: 'Maja Zupan', status: 'todo' }),
  ]
  await mount(page, tasks)
  const search = page.getByRole('searchbox', { name: 'Išči opravila' })
  for (const term of ['c-42', 'CAS', 'zvezda', 'ana cerna']) {
    await search.fill(term)
    await expectIds(page, ['Č-42'])
  }
  await search.fill('zvezda CAS')
  await expectIds(page, ['Č-42'])
  await search.fill('a+b[1]')
  await expectIds(page, ['Č-42'])
  await search.fill('')
  await select(page, 'Filter stanja', 'done')
  await select(page, 'Filter odgovorne osebe', 'Ana Černa')
  await expectIds(page, ['Č-42'])
})

test('R05-R08, R11: project people options, defaults, refresh and clear', async ({ page }) => {
  const tasks = [
    makeTask('web-a', { assignee: 'Ana Novak' }),
    makeTask('web-b', { assignee: 'Maja Zupan', status: 'done' }),
    makeTask('launch-a', { projectId: 'launch', assignee: 'Berta Zajc' }),
  ]
  await mount(page, tasks)
  const people = page.getByRole('combobox', { name: 'Filter odgovorne osebe' })
  await select(page, 'Filter stanja', 'done')
  const options = await people.locator('option').evaluateAll(nodes => nodes.map(node => (node as HTMLOptionElement).value))
  expect(options).toEqual(['all', 'Ana Novak', 'Maja Zupan'])
  await page.getByRole('searchbox', { name: 'Išči opravila' }).fill('missing')
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Počisti filtre' }).click()
  await expect(page.getByRole('searchbox', { name: 'Išči opravila' })).toHaveValue('')
  await expect(people).toHaveValue('all')
  await project(page, 'launch')
  await expect(page.getByRole('searchbox', { name: 'Išči opravila' })).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Filter stanja' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter odgovorne osebe' })).toHaveValue('all')
  await expectIds(page, ['launch-a'])
  await expect(page.getByRole('combobox', { name: 'Filter odgovorne osebe' }).locator('option')).toHaveText(['Vse osebe', 'Berta Zajc'])
  await page.getByRole('searchbox', { name: 'Išči opravila' }).fill('Berta')
  expect(new URL(page.url()).hash).not.toContain('Berta')
  await page.reload()
  await expect(page.getByRole('searchbox', { name: 'Išči opravila' })).toHaveValue('')
})

test('R06, R09-R10: shared result IDs, counts, no-hit and empty project states', async ({ page }) => {
  const tasks = [makeTask('todo-1'), makeTask('done-1', { status: 'done' })]
  await mount(page, tasks)
  await summary(page, [1, 0, 1])
  await select(page, 'Filter stanja', 'done')
  await expect(page.getByRole('status', { name: 'Rezultati filtriranja' })).toHaveText('Prikazano: 1 od 2.')
  await expectIds(page, ['done-1'])
  await board(page)
  await expectIds(page, ['done-1'])
  await expect(page.locator('.board-column').nth(0).locator('.column-count')).toHaveText('0')
  await expect(page.locator('.board-column').nth(2).locator('.column-count')).toHaveText('1')
  await page.getByRole('searchbox', { name: 'Išči opravila' }).fill('no-match')
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Preglednica' })).toBeVisible()
})

test('R10: empty project retains the usual empty state and 0 of 0 count', async ({ page }) => {
  await mount(page, [])
  await expect(page.getByText('Prikazano: 0 od 0.')).toBeVisible()
  await expect(page.getByText('V tem projektu še ni opravil')).toBeVisible()
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toHaveCount(0)
})

test('R12: navigation and details remain read-only and fit a narrow viewport', async ({ page }) => {
  const writes = await mount(page, [makeTask('detail-1')])
  await details(page, 'detail-1')
  await page.setViewportSize({ width: 390, height: 844 })
  await select(page, 'Filter stanja', 'todo')
  await expectIds(page, ['detail-1'])
  await readonly(page, writes)
  await table(page)
})
