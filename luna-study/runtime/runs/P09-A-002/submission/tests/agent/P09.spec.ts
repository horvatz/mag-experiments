import { test, expect, mount, examples, makeTask, expectIds, webIds, select, click, project } from '../development/helpers.ts'

test('query parsing uses first values, defaults invalid filters, and leaves the URL untouched', async ({ page }) => {
  const hash = '#/projects/web?q=Pregled&q=alfa&status=todo&status=done&order=bad&extra=yes'
  await mount(page, undefined, hash)
  await expectIds(page, ['web-02'])
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('Pregled')
  await expect(page.getByRole('combobox', { name: 'Stanje v povezavi' })).toHaveValue('todo')
  await expect(page.getByRole('combobox', { name: 'Vrstni red v povezavi' })).toHaveValue('original')
  await expect.poll(() => page.evaluate(() => location.hash)).toBe(hash)
})

test('literal normalized search and stable UTF-16 title ordering', async ({ page }) => {
  const records = [
    makeTask('u1', { title: 'Élan', description: 'foo bar baz' }),
    makeTask('u2', { title: 'alfa' }),
    makeTask('u3', { title: 'ALFA' }),
    makeTask('u4', { title: 'Žeton' }),
  ]
  await mount(page, records, '#/projects/web?q=%20ELAN%20')
  await expectIds(page, ['u1'])
  await page.goto('/#/projects/web?q=foo%20bar')
  await expectIds(page, ['u1'])
  await page.goto('/#/projects/web?order=title-asc')
  await expectIds(page, ['u2', 'u3', 'u1', 'u4'])
  await page.goto('/#/projects/web?order=title-desc')
  await expectIds(page, ['u4', 'u1', 'u2', 'u3'])
})

test('draft, commit, duplicate commit, and browser history restore applied values', async ({ page }) => {
  await mount(page)
  const startHash = await page.evaluate(() => location.hash)
  await page.getByRole('searchbox', { name: 'Iskanje v povezavi' }).fill(' pregled ')
  await select(page, 'Stanje v povezavi', 'done')
  await expectIds(page, webIds())
  await expect.poll(() => page.evaluate(() => location.hash)).toBe(startHash)
  await click(page, 'Uporabi pogled')
  await expectIds(page, ['web-03'])
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('pregled')
  await click(page, 'Uporabi pogled')
  await page.goBack()
  await expectIds(page, webIds())
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('')
  await page.goForward()
  await expectIds(page, ['web-03'])
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('pregled')
})

test('view and detail navigation keep committed filters while project links reset them', async ({ page }) => {
  await mount(page, examples, '#/projects/web?view=board&status=done')
  await expectIds(page, ['web-03', 'web-06'])
  await page.getByRole('button', { name: 'Preglednica', exact: true }).click()
  await expectIds(page, ['web-03', 'web-06'])
  await expect.poll(() => page.evaluate(() => location.hash)).toContain('status=done')
  await page.locator('[data-task-id="web-03"] a').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect.poll(() => page.evaluate(() => location.hash)).toContain('status=done')
  await project(page, 'launch')
  await expect.poll(() => page.evaluate(() => location.hash)).toBe('#/projects/launch')
  await expectIds(page, ['launch-01', 'launch-02'])
})

test('reset clears filters and empty projects still announce a zero result count', async ({ page }) => {
  await mount(page, [], '#/projects/web?view=board&q=missing')
  await expect(page.getByRole('status', { name: 'Rezultati povezave' })).toHaveText('Prikazano: 0 od 0.')
  await click(page, 'Ponastavi pogled')
  await expect.poll(() => page.evaluate(() => location.hash)).toBe('#/projects/web?view=board')
  await expect(page.getByRole('combobox', { name: 'Stanje v povezavi' })).toHaveValue('all')
})

test('commit trims and encodes the phrase, preserves board, and removes unknown parameters', async ({ page }) => {
  await mount(page, examples, '#/projects/web?view=board&extra=yes')
  await page.getByRole('searchbox', { name: 'Iskanje v povezavi' }).fill('  foo bar & baz  ')
  await select(page, 'Stanje v povezavi', 'done')
  await select(page, 'Vrstni red v povezavi', 'title-desc')
  await click(page, 'Uporabi pogled')
  await expect.poll(() => page.evaluate(() => {
    const [path, query = ''] = location.hash.split('?')
    const params = new URLSearchParams(query)
    return [path, params.get('view'), params.get('q'), params.get('status'), params.get('order'), params.has('extra')]
  })).toEqual(['#/projects/web', 'board', 'foo bar & baz', 'done', 'title-desc', false])
})

test('navigation discards draft, project links preserve board, and direct project URLs apply filters', async ({ page }) => {
  await mount(page, examples, '#/projects/web?view=board&status=done')
  await select(page, 'Stanje v povezavi', 'todo')
  await page.getByRole('button', { name: 'Preglednica', exact: true }).click()
  await expect(page.getByRole('combobox', { name: 'Stanje v povezavi' })).toHaveValue('done')
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  await project(page, 'launch')
  await expect.poll(() => page.evaluate(() => location.hash)).toBe('#/projects/launch?view=board')
  await page.goto('/#/projects/launch?status=done')
  await expectIds(page, ['launch-02'])
})

test('detail close button returns to the filtered project path', async ({ page }) => {
  await mount(page, examples, '#/projects/web?q=pregled&status=done')
  await expectIds(page, ['web-03'])
  await page.locator('[data-task-id="web-03"] a').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'Zapri podrobnosti' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect.poll(() => page.evaluate(() => location.hash)).toBe('#/projects/web?q=pregled&status=done')
})
