import { test, expect, mount, expectIds, webIds, examples } from '../development/helpers.ts'

test('R01-R03: direct URL applies phrase, filters and stable ordering', async ({ page }) => {
  await mount(page, examples, '#/projects/web?q=%C4%8Cas%20za%20pregled&status=in_progress&order=title-asc')
  await expectIds(page, ['web-01'])
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('Čas za pregled')
  await expect(page.getByRole('status', { name: 'Rezultati povezave' })).toHaveText('Prikazano: 1 od 8.')

  await mount(page, examples, '#/projects/web?status=all&order=title-desc')
  await expectIds(page, ['web-06', 'web-02', 'web-03', 'web-08', 'web-01', 'web-05', 'web-04', 'web-07'])
})

test('R02-R04: normalization, repeated params and unknown values are safe', async ({ page }) => {
  const hash = '#/projects/web?q=alfa&status=bad&status=done&order=bad&order=title-desc&ignored=yes'
  await mount(page, examples, hash)
  await expectIds(page, ['web-04', 'web-05'])
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('alfa')
  await expect(page.getByRole('combobox', { name: 'Stanje v povezavi' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Vrstni red v povezavi' })).toHaveValue('original')
  await expect.poll(() => page.evaluate(() => location.href)).toBe(new URL('/' + hash, page.url()).href)
})

test('R05-R07: confirmation, repeated confirmation and browser history', async ({ page }) => {
  await mount(page, examples, '#/projects/web')
  const initialHistoryLength = await page.evaluate(() => history.length)

  await page.getByRole('searchbox', { name: 'Iskanje v povezavi' }).fill(' citat ')
  await page.getByRole('button', { name: 'Uporabi pogled' }).click()
  await expectIds(page, ['web-06'])
await expect.poll(() => page.evaluate(() => location.hash)).toBe('#/projects/web?q=citat')
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('Zapis')
  expect(await page.evaluate(() => history.length)).toBe(initialHistoryLength + 1)

  await page.getByRole('button', { name: 'Uporabi pogled' }).click()
  expect(await page.evaluate(() => history.length)).toBe(initialHistoryLength + 1)

  await page.goBack()
  await expectIds(page, webIds(examples))
await expect.poll(() => page.evaluate(() => location.hash)).toBe('#/projects/web')
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Stanje v povezavi' })).toHaveValue('all')

  await page.goForward()
  await expectIds(page, ['web-06'])
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('Zapis')
})

test('R06 and R08-R10: navigation preserves committed state and discards drafts', async ({ page }) => {
  await mount(page, examples, '#/projects/web?view=board&q=Pregled&status=todo&extra=ignored')
  await expectIds(page, ['web-02'])
  await page.getByRole('searchbox', { name: 'Iskanje v povezavi' }).fill('Alfa')
  await page.getByRole('combobox', { name: 'Stanje v povezavi' }).selectOption('done')

  await page.getByRole('button', { name: 'Preglednica' }).click()
await expect.poll(() => page.evaluate(() => location.hash)).toBe('#/projects/web?q=Pregled&status=todo')
  await expectIds(page, ['web-02'])
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('Pregled')
  await expect(page.getByRole('combobox', { name: 'Stanje v povezavi' })).toHaveValue('todo')

  await page.getByRole('button', { name: 'Tabla' }).click()
await expect.poll(() => page.evaluate(() => location.hash)).toBe('#/projects/web?view=board&q=Pregled&status=todo')
  await page.locator('[data-task-id="web-02"]').getByRole('link').click()
  await expect(page.getByRole('dialog')).toBeVisible()
await expect.poll(() => page.evaluate(() => location.hash)).toBe('#/projects/web/tasks/web-02?view=board&q=Pregled&status=todo')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
await expect.poll(() => page.evaluate(() => location.hash)).toBe('#/projects/web?view=board&q=Pregled&status=todo')

  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja' }).click()
await expect.poll(() => page.evaluate(() => location.hash)).toBe('#/projects/launch?view=board')
  await expectIds(page, ['launch-01', 'launch-02'])
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Stanje v povezavi' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Vrstni red v povezavi' })).toHaveValue('original')
})

test('R11-R12: empty result, reset and read-only responsive behavior', async ({ page, request }) => {
  const writes = await mount(page, examples, '#/projects/web?q=neobstaja')
  await expectIds(page, [])
  await expect(page.getByText('Ni zadetkov.')).toBeVisible()
  await expect(page.getByRole('status', { name: 'Rezultati povezave' })).toHaveText('Prikazano: 0 od 8.')
  const initialHistoryLength = await page.evaluate(() => history.length)

  await page.getByRole('button', { name: 'Ponastavi pogled' }).click()
  await expectIds(page, webIds(examples))
await expect.poll(() => page.evaluate(() => location.hash)).toBe('#/projects/web')
  await page.getByRole('button', { name: 'Ponastavi pogled' }).click()
  expect(await page.evaluate(() => history.length)).toBe(initialHistoryLength + 1)

  expect(writes).toEqual([])
  const state = await (await request.get('/__test/state')).json() as { saveRequests: number }
  expect(state.saveRequests).toBe(0)
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByRole('button', { name: 'Uporabi pogled' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
})
