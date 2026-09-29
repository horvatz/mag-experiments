import { test, expect, mount, expectIds, examples, select, click, board, table, project } from '../development/helpers.ts'

test('P09: literal accent-insensitive phrase and stable title ordering', async ({ page }) => {
  await mount(page)
  await page.getByRole('searchbox', { name: 'Iskanje v povezavi' }).fill(' čšž ')
  await click(page, 'Uporabi pogled')
  await expectIds(page, ['web-06'])
  await expect(page.getByRole('status', { name: 'Rezultati povezave' })).toHaveText('Prikazano: 1 od 8.')

  await page.goto('/#/projects/web?order=title-asc')
  await expectIds(page, ['web-07', 'web-04', 'web-05', 'web-01', 'web-08', 'web-02', 'web-03', 'web-06'])
  await page.goto('/#/projects/web?order=title-desc')
  await expectIds(page, ['web-06', 'web-02', 'web-03', 'web-08', 'web-01', 'web-05', 'web-04', 'web-07'])
})

test('P09: phrase matches each supported field and intersects with status', async ({ page }) => {
  await mount(page)
  const cases: [string, string[]][] = [
    ['q=Čas%20za', ['web-01']],
    ['q=Prva%20vrstica', ['web-06']],
    ['q=Luka%20Kovač', ['web-02']],
    ['q=web-06', ['web-06']],
    ['q=Pregled%20vsebine&status=done', ['web-03']],
    ['q=Pregled%20vsebine%20Luka', []],
    ['q=web-0%5B1%5D', []],
  ]
  for (const [query, ids] of cases) {
    await page.goto(`/#/projects/web?${query}`)
    await expectIds(page, ids)
  }
})

test('P09: confirmation canonicalizes without adding history for unchanged state', async ({ page }) => {
  await mount(page, undefined, '#/projects/web?view=board&x=remove&status=all&order=original&q=%20pregled%20')
  const before = await page.evaluate(() => history.length)
  await click(page, 'Uporabi pogled')
  await expect.poll(() => page.evaluate(() => location.hash)).toBe('#/projects/web?view=board&q=pregled')
  expect(await page.evaluate(() => history.length)).toBe(before)

  await select(page, 'Stanje v povezavi', 'done')
  await click(page, 'Uporabi pogled')
  await expect.poll(() => page.evaluate(() => location.hash)).toBe('#/projects/web?view=board&q=pregled&status=done')
  const committed = await page.evaluate(() => history.length)
  await click(page, 'Uporabi pogled')
  expect(await page.evaluate(() => history.length)).toBe(committed)
})

test('P09: first query value wins and parsing leaves the URL untouched', async ({ page }) => {
  const initial = '#/projects/web?status=invalid&status=done&order=nope&order=title-desc&x=ignored'
  await mount(page, undefined, initial)
  await expectIds(page, examples.filter((task) => task.projectId === 'web').map((task) => task.id))
  await expect(page.getByRole('combobox', { name: 'Stanje v povezavi' })).toHaveValue('all')
  expect(await page.evaluate(() => window.location.hash)).toBe(initial)
})

test('P09: browser history restores confirmed filters and discards the draft', async ({ page }) => {
  await mount(page)
  await select(page, 'Stanje v povezavi', 'done')
  await click(page, 'Uporabi pogled')
  await expectIds(page, ['web-03', 'web-06'])
  await page.getByRole('searchbox', { name: 'Iskanje v povezavi' }).fill('neuporabljeno')
  await board(page)
  await expect(page).toHaveURL(/status=done/)
  await expect(page).not.toHaveURL(/neuporabljeno/)
  await page.goBack()
  await table(page)
  await expect(page.getByRole('combobox', { name: 'Stanje v povezavi' })).toHaveValue('done')
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('')
  await expectIds(page, ['web-03', 'web-06'])
  await page.goForward()
  await board(page)
  await expectIds(page, ['web-03', 'web-06'])
})

test('P09: detail close and project navigation preserve only intended state', async ({ page }) => {
  await mount(page, undefined, '#/projects/web?view=board&status=done')
  await expectIds(page, ['web-03', 'web-06'])
  await page.locator('[data-task-id="web-03"] a').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page).toHaveURL(/view=board.*status=done/)
  await page.getByRole('button', { name: 'Zapri podrobnosti' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page).toHaveURL(/view=board.*status=done/)
  await project(page, 'launch')
  await expect(page).toHaveURL(/#\/projects\/launch\?view=board$/)
  await expect(page.getByRole('combobox', { name: 'Stanje v povezavi' })).toHaveValue('all')
  await expectIds(page, ['launch-01', 'launch-02'])
  await page.goto('/#/projects/launch?status=done')
  await expect(page.getByRole('combobox', { name: 'Stanje v povezavi' })).toHaveValue('done')
  await expectIds(page, ['launch-02'])
})

test('P09: reset has no writes and filter controls fit a narrow viewport', async ({ page }) => {
  const writes = await mount(page, undefined, '#/projects/web?view=board&q=does-not-exist')
  await expect(page.getByText('Ni zadetkov.')).toBeVisible()
  await expect(page.getByRole('status', { name: 'Rezultati povezave' })).toHaveText('Prikazano: 0 od 8.')
  await click(page, 'Ponastavi pogled')
  await expectIds(page, examples.filter((task) => task.projectId === 'web').map((task) => task.id), false)
  await expect(page).toHaveURL(/#\/projects\/web\?view=board$/)
  await expect(page.getByRole('button', { name: 'Tabla' })).toHaveAttribute('aria-pressed', 'true')
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(writes).toEqual([])
})
