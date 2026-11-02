import { expect, test, mount, makeTask, expectIds, select, click } from '../development/helpers.ts'

const customTasks = () => [
  makeTask('web-01', { title: 'Čafe', description: 'Opis', assignee: 'Žan Čž' }),
  makeTask('web-02', { title: 'Alpha beta', description: 'Gamma delta', assignee: 'Ana Novak' }),
  makeTask('web-03', { title: 'Alpha gamma', description: 'Delta epsilon', assignee: 'Maja Zupan' }),
  makeTask('web-04', { title: '😀A', description: 'Surrogat', assignee: 'Luka Kovač' }),
  makeTask('web-05', { title: 'Cafe', description: 'Enaka normalizacija', assignee: 'Živa Kovač' }),
  makeTask('launch-01', { projectId: 'launch', title: 'Drugi projekt' }),
]

test('A01: search uses normalization, exact whole phrase and task fields', async ({ page }) => {
  await mount(page, customTasks(), '#/projects/web?order=title-asc')

  await page.goto('/#/projects/web?q=%C4%8Dafe&order=title-asc')
  await expectIds(page, ['web-01', 'web-05'])
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('čafe')

  await page.goto('/#/projects/web?q=alpha+gamma&order=title-asc')
  await expectIds(page, ['web-03'])

  await page.goto('/#/projects/web?q=web-04&order=title-asc')
  await expectIds(page, ['web-04'])

  await page.goto('/#/projects/web?q=%C5%BEan+%C4%8D%C5%BE&order=title-asc')
  await expectIds(page, ['web-01'])
})

test('A02: title ordering is UTF-16 based and stable for equal normalized titles', async ({ page }) => {
  await mount(page, customTasks(), '#/projects/web?order=title-asc')
  expect(new URL(page.url()).hash).toBe('#/projects/web?order=title-asc')
  await expectIds(page, ['web-02', 'web-03', 'web-01', 'web-05', 'web-04'])

  await page.goto('/#/projects/web?order=title-desc')
  await expectIds(page, ['web-04', 'web-01', 'web-05', 'web-03', 'web-02'])
})

test('A03: invalid repeated and unknown URL parameters do not rewrite the location', async ({ page }) => {
  const hash = '#/projects/web?q=ignored&status=invalid&status=done&order=invalid&order=title-desc&unknown=value'
  await mount(page, customTasks(), hash)

  expect(new URL(page.url()).hash).toBe(hash)
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('ignored')
  await expect(page.getByRole('combobox', { name: 'Stanje v povezavi' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Vrstni red v povezavi' })).toHaveValue('original')

  const historyLength = await page.evaluate(() => history.length)
  await click(page, 'Uporabi pogled')
  expect(new URL(page.url()).hash).toBe('#/projects/web?q=ignored')
  expect(await page.evaluate(() => history.length)).toBe(historyLength)
})

test('A04: confirmation trims values, creates one history entry and restores drafts', async ({ page }) => {
  await mount(page)
  const historyLength = await page.evaluate(() => history.length)

  await page.getByRole('searchbox', { name: 'Iskanje v povezavi' }).fill('  pregled vsebine  ')
  await select(page, 'Stanje v povezavi', 'done')
  await select(page, 'Vrstni red v povezavi', 'title-desc')
  const hashBefore = new URL(page.url()).hash
  await expect(page.locator('[data-task-id="web-01"]')).toBeVisible()

  await click(page, 'Uporabi pogled')
  await expectIds(page, ['web-03'])
  expect(new URL(page.url()).hash).toBe('#/projects/web?q=pregled+vsebine&status=done&order=title-desc')
  expect(await page.evaluate(() => history.length)).toBe(historyLength + 1)

  await click(page, 'Uporabi pogled')
  expect(await page.evaluate(() => history.length)).toBe(historyLength + 1)

  await page.goBack()
  await expectIds(page, ['web-01', 'web-02', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('')
  expect(new URL(page.url()).hash).toBe(hashBefore)

  await page.goForward()
  await expectIds(page, ['web-03'])
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('pregled vsebine')
  await expect(page.getByRole('combobox', { name: 'Stanje v povezavi' })).toHaveValue('done')
  await expect(page.getByRole('combobox', { name: 'Vrstni red v povezavi' })).toHaveValue('title-desc')
})

test('A05: reset clears a draft and shows the full result count', async ({ page }) => {
  const writes = await mount(page, undefined, '#/projects/web?q=neobstojeci')
  await expectIds(page, [])
  await expect(page.getByRole('heading', { name: 'Ni zadetkov' })).toBeVisible()
  await expect(page.getByRole('status', { name: 'Rezultati povezave' })).toHaveText('Prikazano: 0 od 8.')

  await page.getByRole('searchbox', { name: 'Iskanje v povezavi' }).fill('nepotrjeni osnutek')
  await select(page, 'Stanje v povezavi', 'todo')
  await click(page, 'Ponastavi pogled')
  await expectIds(page, ['web-01', 'web-02', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
  await expect(page.getByRole('status', { name: 'Rezultati povezave' })).toHaveText('Prikazano: 8 od 8.')
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('')
  expect(new URL(page.url()).hash).toBe('#/projects/web')
  expect(writes).toEqual([])
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
})

test('A06: view, details and project navigation preserve committed state and discard drafts', async ({ page }) => {
  await mount(page, undefined, '#/projects/web?status=done&order=title-desc')
  await expectIds(page, ['web-06', 'web-03'])

  await page.getByRole('searchbox', { name: 'Iskanje v povezavi' }).fill('nepotrjeni osnutek')
  await click(page, 'Tabla')
  await expectIds(page, ['web-06', 'web-03'])
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('')
  expect(new URL(page.url()).hash).toBe('#/projects/web?view=board&status=done&order=title-desc')

  await page.locator('[data-task-id="web-03"]').getByRole('link').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  expect(new URL(page.url()).hash).toBe('#/projects/web?view=board&status=done&order=title-desc')

  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja' }).click()
  await expectIds(page, ['launch-01', 'launch-02'])
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('')
  expect(new URL(page.url()).hash).toBe('#/projects/launch?view=board')

  await page.goto('/#/projects/launch?q=drugi&status=todo')
  await expectIds(page, ['launch-01'])
})

test('A07: filtered board keeps all columns and stays read-only at mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page, undefined, '#/projects/web?view=board&status=done')
  const board = page.getByRole('region', { name: 'Tabla opravil' })

  await expect(board.getByRole('region', { name: 'Pripravljeno' })).toBeVisible()
  await expect(board.getByRole('region', { name: 'Pripravljeno' })).toHaveText(/Ni opravil v tem stanju/)
  await expect(board.getByRole('region', { name: 'V delu' })).toHaveText(/Ni opravil v tem stanju/)
  await expect(board.locator('[data-task-id]')).toHaveCount(2)
  await expect(page.getByRole('status', { name: 'Rezultati povezave' })).toHaveText('Prikazano: 2 od 8.')
  await page.getByRole('searchbox', { name: 'Iskanje v povezavi' }).fill('neobstojeci')
  await click(page, 'Uporabi pogled')
  await expect(page.getByRole('heading', { name: 'Ni zadetkov' })).toBeVisible()
  await expect(page.getByRole('status', { name: 'Rezultati povezave' })).toHaveText('Prikazano: 0 od 8.')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(writes).toEqual([])
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
})
