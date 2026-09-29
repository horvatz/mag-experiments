import { test, expect, mount, makeTask, examples, expectIds, select, click, board, table, summary } from '../development/helpers.ts'

test('P05 A01: default and page boundaries use the source order', async ({ page }) => {
  await mount(page)
  await expectIds(page, ['web-01', 'web-02', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 1. Prikazano 1–8 od 8.')
  await select(page, 'Velikost strani', '2')
  await expectIds(page, ['web-01', 'web-02'])
  await expect(page.getByRole('button', { name: 'Prva stran' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Prejšnja stran' })).toBeDisabled()
  await click(page, 'Naslednja stran')
  await expectIds(page, ['web-03', 'web-04'])
  await click(page, 'Zadnja stran')
  await expectIds(page, ['web-07', 'web-08'])
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 4 od 4. Prikazano 7–8 od 8.')
  await expect(page.getByRole('button', { name: 'Naslednja stran' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Zadnja stran' })).toBeDisabled()
  await click(page, 'Prva stran')
  await expectIds(page, ['web-01', 'web-02'])
})

test('P05 A02: filter precedes shared table and board pagination', async ({ page }) => {
  await mount(page)
  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'todo')
  await expectIds(page, ['web-02', 'web-04'])
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 2. Prikazano 1–2 od 4.')
  await board(page)
  await expectIds(page, ['web-02', 'web-04'], false)
  await expect(page.locator('.board-todo [data-task-id]')).toHaveCount(2)
  await click(page, 'Naslednja stran')
  await expectIds(page, ['web-07', 'web-08'], false)
  await table(page)
  await expectIds(page, ['web-07', 'web-08'])
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 2 od 2. Prikazano 3–4 od 4.')
})

test('P05 A03: changing size and filter resets the page and state stays local', async ({ page }) => {
  await mount(page)
  await select(page, 'Velikost strani', '2')
  await click(page, 'Zadnja stran')
  await select(page, 'Velikost strani', '5')
  await expectIds(page, ['web-01', 'web-02', 'web-03', 'web-04', 'web-05'])
  await click(page, 'Naslednja stran')
  await select(page, 'Filter strani', 'done')
  await expectIds(page, ['web-03', 'web-06'])
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 1. Prikazano 1–2 od 2.')
  await page.reload()
  await expect(page.getByRole('combobox', { name: 'Velikost strani' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter strani' })).toHaveValue('all')
  await expectIds(page, ['web-01', 'web-02', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
})

test('P05 A04: view and details preserve the page, project navigation resets it', async ({ page }) => {
  await mount(page)
  await select(page, 'Velikost strani', '2')
  await click(page, 'Naslednja stran')
  await board(page)
  await expectIds(page, ['web-03', 'web-04'], false)
  await page.locator('[data-task-id="web-04"]').getByRole('link').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 2 od 4. Prikazano 3–4 od 8.')
  await expectIds(page, ['web-03', 'web-04'], false)
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja' }).click()
  await expect(page.getByRole('combobox', { name: 'Velikost strani' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter strani' })).toHaveValue('all')
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 1. Prikazano 1–2 od 2.')
})

test('P05 A05: empty projects and empty filters report zero and disable navigation', async ({ page }) => {
  const doneOnly = examples.filter((task) => task.projectId !== 'web' || task.status === 'done')
  await mount(page, doneOnly)
  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'todo')
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
  for (const name of ['Prva stran', 'Prejšnja stran', 'Naslednja stran', 'Zadnja stran']) {
    await expect(page.getByRole('button', { name })).toBeDisabled()
  }
  await select(page, 'Filter strani', 'all')
  await expectIds(page, ['web-03', 'web-06'])
})

test('P05 A06: empty project reports zero and disables every navigation button', async ({ page }) => {
  await mount(page, [])
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
  for (const name of ['Prva stran', 'Prejšnja stran', 'Naslednja stran', 'Zadnja stran']) {
    await expect(page.getByRole('button', { name })).toBeDisabled()
  }
  await select(page, 'Filter strani', 'todo')
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
})

test('P05 A07: overview counts use all tasks while board columns use the visible page', async ({ page }) => {
  const records = Array.from({ length: 11 }, (_, index) => makeTask(`custom-${index + 1}`, {
    status: (['todo', 'in_progress', 'done'] as const)[index % 3],
  }))
  const writes: string[] = []
  await mount(page, records)
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/api/') && !['GET', 'HEAD', 'OPTIONS'].includes(request.method())) writes.push(request.method())
  })
  await summary(page, [4, 4, 3])
  await expect(page.locator('.count-badge')).toHaveText('11')
  await select(page, 'Velikost strani', '10')
  await expectIds(page, records.slice(0, 10).map((task) => task.id))
  await board(page)
  await expectIds(page, records.slice(0, 10).map((task) => task.id), false)
  await expect(page.getByRole('region', { name: 'Tabla opravil' }).getByLabel('4 opravil')).toHaveCount(1)
  await click(page, 'Naslednja stran')
  await expectIds(page, ['custom-11'], false)
  await expect(page.getByRole('region', { name: 'Tabla opravil' }).getByLabel('1 opravil')).toHaveCount(1)
  expect(writes).toEqual([])
  await expect(page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).resolves.toBe(true)
})
