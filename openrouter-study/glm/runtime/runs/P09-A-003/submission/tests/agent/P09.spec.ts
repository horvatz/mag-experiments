import { expect, test } from '@playwright/test'
import { examples, expectIds, ids, makeTask, mount } from '../development/helpers.ts'

test('A01: URL parsing, normalization and combined filters', async ({ page }) => {
  const records = [
    makeTask('web-01', { title: 'Žeja', description: 'Prejšnji zapis' }),
    makeTask('web-02', { title: 'Zadnji Zapis', assignee: 'Ana Živković', status: 'in_progress' }),
    makeTask('web-03', { title: 'Drugi Zapis', status: 'done' }),
  ]
  await mount(page, records, '#/projects/web?q=%C5%BEeja&status=all&order=original&unknown=value')
  await expectIds(page, ['web-01'])
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('žeja')
  expect(page.url()).toContain('#/projects/web?q=%C5%BEeja&status=all&order=original&unknown=value')

  await page.goto('/#/projects/web?q=web-02&q=web-03&status=invalid&status=todo&order=unknown&order=title-desc')
  await expectIds(page, ['web-02'])
  await expect(page.getByRole('combobox', { name: 'Stanje v povezavi' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Vrstni red v povezavi' })).toHaveValue('original')

  await page.goto('/#/projects/web?q=Zapis&status=done&order=title-asc')
  await expectIds(page, ['web-03'])
  await page.getByRole('combobox', { name: 'Vrstni red v povezavi' }).selectOption('title-desc')
  await page.getByRole('button', { name: 'Uporabi pogled' }).click()
  await expectIds(page, ['web-03'])
})

test('A02: draft, one history entry and back/forward', async ({ page }) => {
  const writes = await mount(page, examples)
  const initialHistory = await page.evaluate(() => history.length)
  await page.getByRole('searchbox', { name: 'Iskanje v povezavi' }).fill(' Živa Kovač ')
  await page.getByRole('combobox', { name: 'Stanje v povezavi' }).selectOption('done')
  await page.getByRole('combobox', { name: 'Vrstni red v povezavi' }).selectOption('title-asc')
  await expectIds(page, examples.filter(task => task.projectId === 'web').map(task => task.id))
  expect(page.url()).toContain('#/projects/web')

  await page.getByRole('button', { name: 'Uporabi pogled' }).click()
  await expectIds(page, ['web-06'])
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('Živa Kovač')
  expect(await page.evaluate(() => history.length)).toBe(initialHistory + 1)
  expect(page.url()).toContain(encodeURIComponent('Živa Kovač'))

  await page.getByRole('button', { name: 'Uporabi pogled' }).click()
  expect(await page.evaluate(() => history.length)).toBe(initialHistory + 1)

  await page.goBack()
  await expectIds(page, examples.filter(task => task.projectId === 'web').map(task => task.id))
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Stanje v povezavi' })).toHaveValue('all')
  await page.goForward()
  await expectIds(page, ['web-06'])
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('Živa Kovač')
  expect(writes).toEqual([])
})

test('A03: view switch and details preserve committed state', async ({ page }) => {
  await mount(page, examples, '#/projects/web?view=board&q=Pregled&status=todo&order=title-desc')
  await expectIds(page, ['web-02'])

  await page.locator('[data-task-id="web-02"]').getByRole('link').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  expect(page.url()).toContain('/tasks/web-02?view=board&q=Pregled&status=todo&order=title-desc')
  await page.getByRole('button', { name: 'Zapri podrobnosti' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(page.url()).toContain('#/projects/web?view=board&q=Pregled&status=todo&order=title-desc')

  await page.getByRole('searchbox', { name: 'Iskanje v povezavi' }).fill('nepotrjen osnutek')
  await page.getByRole('button', { name: 'Preglednica', exact: true }).click()
  await expectIds(page, ['web-02'])
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('Pregled')
  expect(await ids(page)).toEqual(['web-02'])
})

test('A04: reset, counter, project default and mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page, examples, '#/projects/web?view=board&q=neobstaja')
  await expectIds(page, [])
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await expect(page.getByRole('status', { name: 'Rezultati povezave' })).toHaveText('Prikazano: 0 od 8.')

  await page.getByRole('button', { name: 'Ponastavi pogled' }).click()
  const webIds = examples.filter(task => task.projectId === 'web').map(task => task.id)
  await expectIds(page, webIds, false)
  await expect(page.getByRole('button', { name: 'Tabla', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('status', { name: 'Rezultati povezave' })).toHaveText('Prikazano: 8 od 8.')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)

  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja' }).click()
  await expectIds(page, examples.filter(task => task.projectId === 'launch').map(task => task.id), false)
  expect(page.url()).toContain('#/projects/launch?view=board')
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('')
  expect(writes).toEqual([])
  const storageLength = await page.evaluate(() => localStorage.length)
  expect(storageLength).toBe(0)
  await page.goto('/#/projects/launch?q=Drugi&status=done&order=title-desc')
  await expectIds(page, ['launch-02'])
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('Drugi')
})
