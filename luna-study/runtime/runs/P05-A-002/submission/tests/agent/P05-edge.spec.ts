import { expect, test, mount, expectIds, select, click, board, table, project, summary, examples, makeTask } from '../development/helpers.ts'

test('P05: first, previous, 10 and all page boundaries', async ({ page }) => {
  await mount(page)
  await expect(page.getByRole('combobox', { name: 'Velikost strani', exact: true })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter strani', exact: true })).toHaveValue('all')
  await expectIds(page, ['web-01', 'web-02', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 1. Prikazano 1–8 od 8.')
  await select(page, 'Velikost strani', '2')
  await expect(page.getByRole('button', { name: 'Prva stran', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Prejšnja stran', exact: true })).toBeDisabled()
  await click(page, 'Zadnja stran')
  await expectIds(page, ['web-07', 'web-08'])
  await expect(page.getByRole('button', { name: 'Naslednja stran', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Zadnja stran', exact: true })).toBeDisabled()
  await click(page, 'Prva stran')
  await expectIds(page, ['web-01', 'web-02'])
  await click(page, 'Naslednja stran')
  await expectIds(page, ['web-03', 'web-04'])
  await click(page, 'Prejšnja stran')
  await expectIds(page, ['web-01', 'web-02'])
  const traversed: string[] = []
  for (let index = 0; index < 4; index += 1) {
    traversed.push(...await page.locator('[data-task-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-task-id')!)))
    if (index < 3) await click(page, 'Naslednja stran')
  }
  expect(traversed).toEqual(['web-01', 'web-02', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
  expect(new Set(traversed).size).toBe(8)
  await select(page, 'Velikost strani', '10')
  await expectIds(page, ['web-01', 'web-02', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 1. Prikazano 1–8 od 8.')
  await select(page, 'Velikost strani', 'all')
  await expectIds(page, ['web-01', 'web-02', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
  for (const name of ['Prva stran', 'Prejšnja stran', 'Naslednja stran', 'Zadnja stran']) {
    await expect(page.getByRole('button', { name, exact: true })).toBeDisabled()
  }
})

test('P05: size 10 paginates arbitrary lists larger than ten', async ({ page }) => {
  const records = Array.from({ length: 13 }, (_, index) => makeTask(`custom-${String(index + 1).padStart(2, '0')}`))
  await mount(page, records)
  await select(page, 'Velikost strani', '10')
  await expectIds(page, records.slice(0, 10).map((task) => task.id))
  await click(page, 'Zadnja stran')
  await expectIds(page, records.slice(10).map((task) => task.id))
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 2 od 2. Prikazano 11–13 od 13.')
})

test('P05: empty filter status and removing the filter returns to page one', async ({ page }) => {
  const onlyTodo = examples.map((task) => task.projectId === 'web' ? { ...task, status: 'todo' as const } : task)
  await mount(page, onlyTodo)
  await select(page, 'Velikost strani', '2')
  await click(page, 'Naslednja stran')
  await select(page, 'Filter strani', 'done')
  await expectIds(page, [])
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
  for (const name of ['Prva stran', 'Prejšnja stran', 'Naslednja stran', 'Zadnja stran']) {
    await expect(page.getByRole('button', { name, exact: true })).toBeDisabled()
  }
  await select(page, 'Filter strani', 'all')
  await expectIds(page, ['web-01', 'web-02'])
})

test('P05: empty project has a zero page status and disabled navigation', async ({ page }) => {
  await mount(page, examples.filter((task) => task.projectId !== 'web'))
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
  for (const name of ['Prva stran', 'Prejšnja stran', 'Naslednja stran', 'Zadnja stran']) {
    await expect(page.getByRole('button', { name, exact: true })).toBeDisabled()
  }
})

test('P05: page state survives view and details, then resets on project change and reload', async ({ page }) => {
  await mount(page)
  const initialHash = new URL(page.url()).hash
  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'todo')
  await click(page, 'Naslednja stran')
  await expectIds(page, ['web-07', 'web-08'])
  expect(new URL(page.url()).hash).toBe(initialHash)
  await page.locator('[data-task-id="web-07"] a').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expectIds(page, ['web-07', 'web-08'])
  await board(page)
  await expectIds(page, ['web-07', 'web-08'], false)
  await table(page)
  await project(page, 'launch')
  await expectIds(page, ['launch-01', 'launch-02'])
  await expect(page.getByRole('combobox', { name: 'Filter strani', exact: true })).toHaveValue('all')
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 1. Prikazano 1–2 od 2.')
  await project(page, 'web')
  await expectIds(page, examples.filter((task) => task.projectId === 'web').map((task) => task.id))
  await select(page, 'Velikost strani', '2')
  await click(page, 'Naslednja stran')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Spletna prenova', exact: true })).toBeVisible()
  await expectIds(page, examples.filter((task) => task.projectId === 'web').map((task) => task.id))
  await expect(page.getByRole('combobox', { name: 'Velikost strani', exact: true })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter strani', exact: true })).toHaveValue('all')
})

test('P05: project totals remain full while board columns count the current page', async ({ page }) => {
  await mount(page)
  await summary(page, [4, 2, 2])
  await select(page, 'Velikost strani', '2')
  await board(page)
  await expectIds(page, ['web-01', 'web-02'], false)
  await expect(page.locator('.board-todo .column-count')).toHaveText('1')
  await expect(page.locator('.board-in_progress .column-count')).toHaveText('1')
  await expect(page.locator('.board-done .column-count')).toHaveText('0')
  await expect(page.locator('.section-heading .count-badge')).toHaveText('8')
})
