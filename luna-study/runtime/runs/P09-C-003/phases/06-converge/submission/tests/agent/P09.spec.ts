import { test, expect, click, select, mount, makeTask, expectIds, readonly, examples } from '../development/helpers.ts'

test('R01-R04: direct link parses first values, defaults invalid enums, and never rewrites on read', async ({ page }) => {
  const records = [
    makeTask('web-a', { title: 'Cão fiel', status: 'todo' }),
    makeTask('web-b', { title: 'Cão fiel', status: 'done' }),
    makeTask('web-c', { title: 'Alfa', status: 'todo' }),
  ]
  const hash = '#/projects/web?q=CA%CC%83O&status=todo&status=done&order=unknown&extra=1'
  await mount(page, records, hash)
  await expectIds(page, ['web-a'])
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('CÃO')
  await expect(page.getByRole('combobox', { name: 'Stanje v povezavi' })).toHaveValue('todo')
  await expect(page.getByRole('combobox', { name: 'Vrstni red v povezavi' })).toHaveValue('original')
  expect(new URL(page.url()).hash).toBe(hash)
})

test('R02-R03: literal normalized search covers all fields and sorting is stable', async ({ page }) => {
  const records = [
    makeTask('web-2', { title: 'áLFA', description: 'črtica', assignee: 'Maja' }),
    makeTask('web-1', { title: 'Alfa', status: 'done', assignee: 'Živa' }),
    makeTask('web-3', { title: 'Drugo', description: 'vsebina, a+b', status: 'in_progress' }),
  ]
  await mount(page, records)
  await page.getByRole('searchbox', { name: 'Iskanje v povezavi' }).fill('  alfa  ')
  await click(page, 'Uporabi pogled')
  await expectIds(page, ['web-2', 'web-1'])
  await select(page, 'Stanje v povezavi', 'done')
  await click(page, 'Uporabi pogled')
  await expectIds(page, ['web-1'])
  await select(page, 'Stanje v povezavi', 'all')
  await select(page, 'Vrstni red v povezavi', 'title-desc')
  await click(page, 'Uporabi pogled')
  await expectIds(page, ['web-2', 'web-1'])
  await page.getByRole('searchbox', { name: 'Iskanje v povezavi' }).fill('a+b')
  await click(page, 'Uporabi pogled')
  await expectIds(page, ['web-3'])
  await page.getByRole('searchbox', { name: 'Iskanje v povezavi' }).fill('web-2')
  await click(page, 'Uporabi pogled')
  await expectIds(page, ['web-2'])
})

test('R05-R07,R11: draft, canonical apply, reset, and browser history', async ({ page }) => {
  const records = examples.filter(task => task.projectId === 'web')
  await mount(page, records)
  const search = page.getByRole('searchbox', { name: 'Iskanje v povezavi' })
  await search.fill(' pregled ')
  await select(page, 'Stanje v povezavi', 'done')
  await expectIds(page, records.map(task => task.id))
  expect(new URL(page.url()).hash).toBe('#/projects/web')
  await click(page, 'Uporabi pogled')
  await expectIds(page, ['web-03'])
  expect(new URL(page.url()).hash).toContain('q=pregled')
  expect(new URL(page.url()).hash).toContain('status=done')
  const appliedUrl = page.url()
  await click(page, 'Uporabi pogled')
  expect(page.url()).toBe(appliedUrl)
  await page.goBack()
  await expectIds(page, records.map(task => task.id))
  await page.goForward()
  await expectIds(page, ['web-03'])
  await click(page, 'Ponastavi pogled')
  await expectIds(page, records.map(task => task.id))
  await expect(page.getByRole('status', { name: 'Rezultati povezave' })).toHaveText(`Prikazano: ${records.length} od ${records.length}.`)
})

test('R08-R10: views, details, and project navigation preserve or reset committed state correctly', async ({ page }) => {
  const writes = await mount(page, examples, '#/projects/web?view=board&status=done')
  await expectIds(page, ['web-03', 'web-06'])
  await page.getByRole('button', { name: 'Preglednica', exact: true }).click()
  await expectIds(page, ['web-03', 'web-06'])
  await page.locator('[data-task-id="web-03"] a').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expectIds(page, ['web-03', 'web-06'])
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja' }).click()
  await expectIds(page, ['launch-01', 'launch-02'])
  expect(new URL(page.url()).hash).toBe('#/projects/launch')
  await page.goto('/#/projects/launch?status=done')
  await expectIds(page, ['launch-02'])
  await readonly(page, writes)
})

test('R11-R12: empty filtered result is announced, table remains responsive and data is read only', async ({ page }) => {
  const writes = await mount(page, examples)
  await page.getByRole('searchbox', { name: 'Iskanje v povezavi' }).fill('no-such-task')
  await click(page, 'Uporabi pogled')
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await expect(page.getByRole('status', { name: 'Rezultati povezave' })).toHaveText('Prikazano: 0 od 8.')
  await page.setViewportSize({ width: 390, height: 844 })
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  await readonly(page, writes)
})

test('R11: empty API result includes the required empty-result message', async ({ page }) => {
  await mount(page, [])
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
  await expect(page.getByRole('status', { name: 'Rezultati povezave' })).toHaveText('Prikazano: 0 od 0.')
})
