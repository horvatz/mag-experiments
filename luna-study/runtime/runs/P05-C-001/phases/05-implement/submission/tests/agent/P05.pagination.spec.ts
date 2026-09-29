import { board, click, details, expect, expectIds, makeTask, mount, project, readonly, select, summary, table, test } from '../development/helpers.ts'

test('P05 default order, all page sizes, navigation edges, and page-size reset', async ({ page }) => {
  const records = Array.from({ length: 11 }, (_, index) => makeTask(`custom-${index + 1}`, { status: (['todo', 'in_progress', 'done'] as const)[index % 3] }))
  await mount(page, records)
  await expectIds(page, records.map((task) => task.id))
  await expect(page.getByRole('combobox', { name: 'Velikost strani' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter strani' })).toHaveValue('all')

  await select(page, 'Velikost strani', '2')
  await expect(page.getByRole('button', { name: 'Prejšnja stran' })).toBeDisabled()
  const pages = []
  for (let start = 0; start < records.length; start += 2) {
    const ids = records.slice(start, start + 2).map((task) => task.id)
    pages.push(...ids)
    await expectIds(page, ids)
    if (start + 2 < records.length) await click(page, 'Naslednja stran')
  }
  expect(pages).toEqual(records.map((task) => task.id))
  await expect(page.getByRole('button', { name: 'Naslednja stran' })).toBeDisabled()
  await click(page, 'Prva stran')
  await click(page, 'Naslednja stran')
  await select(page, 'Velikost strani', '5')
  await expectIds(page, records.slice(0, 5).map((task) => task.id))
  await select(page, 'Velikost strani', '10')
  await expectIds(page, records.slice(0, 10).map((task) => task.id))
  await select(page, 'Velikost strani', 'all')
  await expectIds(page, records.map((task) => task.id))
})

test('P05 filters before paging, preserve order, and reset to first page', async ({ page }) => {
  const records = [
    makeTask('f1', { status: 'todo' }), makeTask('f2', { status: 'done' }), makeTask('f3', { status: 'todo' }),
    makeTask('f4', { status: 'in_progress' }), makeTask('f5', { status: 'done' }), makeTask('f6', { status: 'todo' }),
  ]
  await mount(page, records)
  await select(page, 'Velikost strani', '2')
  await click(page, 'Naslednja stran')
  await select(page, 'Filter strani', 'todo')
  await expectIds(page, ['f1', 'f3'])
  await click(page, 'Naslednja stran')
  await expectIds(page, ['f6'])
  await select(page, 'Filter strani', 'in_progress')
  await expectIds(page, ['f4'])
  await select(page, 'Filter strani', 'done')
  await expectIds(page, ['f2', 'f5'])
  await select(page, 'Filter strani', 'all')
  await expectIds(page, ['f1', 'f2'])
})

test('P05 table and board share a page; details preserve state; project and refresh reset it', async ({ page }) => {
  const records = [
    ...Array.from({ length: 8 }, (_, index) => makeTask(`view-${index + 1}`, { status: (['todo', 'in_progress', 'done'] as const)[index % 3] })),
    makeTask('launch-a', { projectId: 'launch' }), makeTask('launch-b', { projectId: 'launch', status: 'done' }), makeTask('launch-c', { projectId: 'launch', status: 'in_progress' }),
  ]
  await mount(page, records)
  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'all')
  await click(page, 'Naslednja stran')
  const visible = records.slice(2, 4).map((task) => task.id)
  await expectIds(page, visible)
  await board(page)
  await expectIds(page, visible, false)
  await details(page, visible[0])
  await expectIds(page, visible, false)
  await table(page)
  await expectIds(page, visible)
  await project(page, 'launch')
  await expect(page.getByRole('combobox', { name: 'Velikost strani' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter strani' })).toHaveValue('all')
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 1. Prikazano 1–3 od 3.')
  await select(page, 'Velikost strani', '2')
  await click(page, 'Naslednja stran')
  await page.reload()
  await expect(page.getByRole('combobox', { name: 'Velikost strani' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter strani' })).toHaveValue('all')
})

test('P05 empty project status and disabled navigation', async ({ page }) => {
  const emptyWrites = await mount(page, [])
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
  for (const label of ['Prva stran', 'Prejšnja stran', 'Naslednja stran', 'Zadnja stran']) await expect(page.getByRole('button', { name: label })).toBeDisabled()
  await readonly(page, emptyWrites)
})

test('P05 empty filter, full-project counts, page counts, and read-only behavior', async ({ page }) => {
  const records = [makeTask('only-1', { status: 'todo' }), makeTask('only-2', { status: 'done' }), makeTask('only-3', { status: 'done' })]
  const writes = await mount(page, records)
  await summary(page, [1, 0, 2])
  await select(page, 'Filter strani', 'in_progress')
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
  await select(page, 'Filter strani', 'all')
  await expectIds(page, ['only-1', 'only-2', 'only-3'])
  await select(page, 'Velikost strani', '2')
  await board(page)
  await expectIds(page, ['only-1', 'only-2'], false)
  await expect(page.getByRole('region', { name: 'Tabla opravil' }).getByLabel('1 opravil')).toHaveCount(2)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await readonly(page, writes)
})
