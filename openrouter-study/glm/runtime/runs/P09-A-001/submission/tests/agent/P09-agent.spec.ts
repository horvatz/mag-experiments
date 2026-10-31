import { expect, mount, makeTask, select, click, board, readonly, ids, test } from '../development/helpers.ts'

const records = [
  makeTask('web-01', { title: 'Češnja', description: 'Zadnji pregled', status: 'todo', assignee: 'Ana Novak' }),
  makeTask('web-02', { title: 'češnja', description: 'Prvi pregled', status: 'done', assignee: 'Luka Kovač' }),
  makeTask('web-03', { title: 'Zapis, "citat"', description: 'Opis; čšž', status: 'in_progress', assignee: 'Živa Kovač' }),
  makeTask('launch-01', { projectId: 'launch', title: 'Drugi projekt', status: 'done', assignee: 'Maja Zupan' }),
  makeTask('launch-02', { projectId: 'launch', title: 'Drugi projekt', description: 'Pregled', status: 'in_progress', assignee: 'Črt Novak' }),
]

test('A01: direct URL applies defaults, first values, search normalization and order', async ({ page }) => {
  const hash = '#/projects/web?unknown=value&q=%20%C4%8Ce%C5%A1nja%20&status=done&status=todo&order=title-desc&order=title-asc'
  await mount(page, records, hash)
  await expect.poll(() => ids(page)).toEqual(['web-02'])
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('Češnja')
  await expect(page.getByRole('combobox', { name: 'Stanje v povezavi' })).toHaveValue('done')
  await expect(page.getByRole('combobox', { name: 'Vrstni red v povezavi' })).toHaveValue('title-desc')
  expect(page.url()).toContain(hash)
  await expect(page.getByLabel('Rezultati povezave')).toHaveText('Prikazano: 1 od 3.')
})

test('A02: draft, history, URL encoding and reset follow the committed-state rule', async ({ page }) => {
  const writes = await mount(page, records)
  const historyLength = async () => page.evaluate(() => history.length)
  const before = await historyLength()
  await page.getByRole('searchbox', { name: 'Iskanje v povezavi' }).fill(' pregled ')
  await select(page, 'Stanje v povezavi', 'done')
  await select(page, 'Vrstni red v povezavi', 'title-asc')
  await expect.poll(() => ids(page)).toEqual(['web-01', 'web-02', 'web-03'])
  expect(page.url().split('#')[1]).toBe('/projects/web')

  await click(page, 'Uporabi pogled')
  await expect.poll(() => ids(page)).toEqual(['web-02'])
  const committedUrl = page.url()
  expect(new URL(committedUrl).hash).toContain('q=pregled&status=done&order=title-asc')
  await click(page, 'Uporabi pogled')
  expect(await historyLength()).toBe(before + 1)

  await page.goBack()
  await expect.poll(() => ids(page)).toEqual(['web-01', 'web-02', 'web-03'])
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('')
  await page.goForward()
  await expect.poll(() => ids(page)).toEqual(['web-02'])
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('pregled')

  await page.getByRole('searchbox', { name: 'Iskanje v povezavi' }).fill('ignored draft')
  await click(page, 'Ponastavi pogled')
  await expect.poll(() => ids(page)).toEqual(['web-01', 'web-02', 'web-03'])
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('')
  expect(new URL(page.url()).hash).toBe('#/projects/web')
  await readonly(page, writes)
})

test('A03: view, project and detail navigation preserve or discard the correct state', async ({ page }) => {
  const writes = await mount(page, records, '#/projects/web?view=board&q=zapis&status=in_progress&order=title-desc')
  await expect.poll(() => ids(page)).toEqual(['web-03'])
  await page.getByRole('searchbox', { name: 'Iskanje v povezavi' }).fill('ignored draft')
  await page.getByRole('button', { name: 'Preglednica', exact: true }).click()
  await expect.poll(() => ids(page)).toEqual(['web-03'])
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('zapis')
  await board(page)
  await expect.poll(() => ids(page)).toEqual(['web-03'])

  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja' }).click()
  await expect(page.getByRole('heading', { name: 'Jesenska kampanja', exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Tabla opravil' })).toBeVisible()
  await expect.poll(() => ids(page).then((value) => value.sort())).toEqual(['launch-01', 'launch-02'])
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Stanje v povezavi' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Vrstni red v povezavi' })).toHaveValue('original')

  await page.getByRole('searchbox', { name: 'Iskanje v povezavi' }).fill('drugi')
  await click(page, 'Uporabi pogled')
  await expect.poll(() => ids(page)).toEqual(['launch-02', 'launch-01'])
  await page.locator('[data-task-id="launch-01"]').getByRole('link').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  expect(new URL(page.url()).hash).toContain('q=drugi')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('region', { name: 'Tabla opravil' })).toBeVisible()
  await expect.poll(() => ids(page)).toEqual(['launch-02', 'launch-01'])
  await readonly(page, writes)
})

test('A04: no matches, board reset and mobile width remain usable', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'This suite is configured for the shared Chromium endpoint')
  const writes = await mount(page, records, '#/projects/web?view=board&q=missing')
  await expect(page.getByText('Ni zadetkov')).toBeVisible()
  await expect(page.getByLabel('Rezultati povezave')).toHaveText('Prikazano: 0 od 3.')
  await page.getByRole('button', { name: 'Ponastavi pogled', exact: true }).click()
  await expect.poll(() => ids(page).then((value) => value.sort())).toEqual(['web-01', 'web-02', 'web-03'])
  expect(new URL(page.url()).hash).toBe('#/projects/web?view=board')
  await page.getByRole('button', { name: 'Preglednica', exact: true }).click()
  await expect(page.getByRole('table')).toBeVisible()
  await readonly(page, writes)
})
