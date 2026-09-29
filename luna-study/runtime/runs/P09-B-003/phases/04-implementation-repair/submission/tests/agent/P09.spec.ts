import { expect, test, mount, makeTask, expectIds, click, select, project, board, readonly } from '../development/helpers.ts'

test('direct query uses first values without rewriting until apply', async ({ page }) => {
  const writes = await mount(page, [
    makeTask('a-1', { title: 'Café, alpha', description: 'red blue' }),
    makeTask('a-2', { title: 'Cafe other', description: 'red quiet blue' }),
    makeTask('a-3', { title: 'Other', description: 'red blue' }),
  ], '#/projects/web?q=%20CAFE%CC%81%2C%20ALPHA%20&q=other&status=invalid&status=todo&order=unknown&extra=1')

  await expectIds(page, ['a-1'])
  await expect(page.getByRole('combobox', { name: 'Stanje v povezavi' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Vrstni red v povezavi' })).toHaveValue('original')
  expect(new URL(page.url()).hash).toContain('q=%20CAFE%CC%81%2C%20ALPHA%20&q=other')
  await click(page, 'Uporabi pogled')
  const params = new URLSearchParams(new URL(page.url()).hash.split('?')[1])
  expect(params.get('q')).toBe('CAFE\u0301, ALPHA')
  expect(params.has('status')).toBe(false)
  expect(params.has('order')).toBe(false)
  expect(params.has('extra')).toBe(false)
  await readonly(page, writes)
})

test('draft, stable normalized sorting, and history restore the committed view', async ({ page }) => {
  const writes = await mount(page, [
    makeTask('a-1', { title: 'Alpha 2', status: 'done' }),
    makeTask('a-2', { title: 'ALPHA 10', status: 'done' }),
    makeTask('a-3', { title: 'Álpha 2', status: 'done' }),
    makeTask('a-4', { title: 'Beta', status: 'todo' }),
  ])

  await select(page, 'Stanje v povezavi', 'done')
  await select(page, 'Vrstni red v povezavi', 'title-asc')
  await expectIds(page, ['a-1', 'a-2', 'a-3', 'a-4'])
  await click(page, 'Uporabi pogled')
  await expectIds(page, ['a-2', 'a-1', 'a-3'])
  await expect(page.getByLabel('Rezultati povezave')).toHaveText('Prikazano: 3 od 4.')

  await board(page)
  await expectIds(page, ['a-2', 'a-1', 'a-3'])
  await page.getByRole('searchbox', { name: 'Iskanje v povezavi' }).fill('draft only')
  await expectIds(page, ['a-2', 'a-1', 'a-3'])
  await page.goBack()
  await expectIds(page, ['a-2', 'a-1', 'a-3'])
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Stanje v povezavi' })).toHaveValue('done')
  await page.goBack()
  await expectIds(page, ['a-1', 'a-2', 'a-3', 'a-4'])
  await page.goForward()
  await expectIds(page, ['a-2', 'a-1', 'a-3'])
  await page.goForward()
  await expectIds(page, ['a-2', 'a-1', 'a-3'])
  await expect(page.getByRole('button', { name: 'Tabla', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await readonly(page, writes)
})

test('project navigation resets filters while keeping board mode and direct links apply filters', async ({ page }) => {
  const writes = await mount(page, undefined, '#/projects/web?view=board&q=neobstojece&status=done')
  await expectIds(page, [])
  await project(page, 'launch')
  await expect(page.getByRole('button', { name: 'Tabla', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Stanje v povezavi' })).toHaveValue('all')
  expect(new URL(page.url()).hash).toBe('#/projects/launch?view=board')

  await page.goto('/#/projects/launch?q=Drugi&status=done')
  await expectIds(page, ['launch-02'])
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('Drugi')
  await readonly(page, writes)
})

test('active filters on an empty project show no results; reset restores its empty-project state', async ({ page }) => {
  const writes = await mount(page, [], '#/projects/web?q=iskanje&status=done')
  await expect(page.getByRole('heading', { name: 'Ni zadetkov.' })).toBeVisible()
  await expect(page.getByLabel('Rezultati povezave')).toHaveText('Prikazano: 0 od 0.')
  await click(page, 'Ponastavi pogled')
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
  expect(new URL(page.url()).hash).toBe('#/projects/web')
  await readonly(page, writes)
})
