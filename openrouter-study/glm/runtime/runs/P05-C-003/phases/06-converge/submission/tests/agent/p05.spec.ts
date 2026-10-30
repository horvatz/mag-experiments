import { expect, test, mount, makeTask, select, click, board, table, project, details, summary, columnIds, expectIds, ids, readonly, type Task } from '../development/helpers.ts'

const statuses = ['in_progress', 'todo', 'done', 'todo', 'in_progress', 'done', 'todo', 'todo', 'in_progress', 'done', 'todo'] as const
const records: Task[] = statuses.map((status, index) => makeTask(`web-${String(index + 1).padStart(2, '0')}`, {
  status,
  title: `Opravilo ${index + 1}`,
  assignee: index % 2 === 0 ? 'Ana Novak' : 'Luka Kovač',
}))

const allIds = records.map((task) => task.id)

test('R01, R02, R03 and R09: defaults, complete pages, navigation and status', async ({ page }) => {
  await mount(page, records)
  await expectIds(page, allIds)
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 1. Prikazano 1–11 od 11.')

  await select(page, 'Velikost strani', '2')
  const visited: string[] = []
  for (let pageNumber = 1; pageNumber <= 6; pageNumber += 1) {
    const expected = allIds.slice((pageNumber - 1) * 2, pageNumber * 2)
    visited.push(...expected)
    await expectIds(page, expected)
    await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText(`Stran ${pageNumber} od 6. Prikazano ${(pageNumber - 1) * 2 + 1}–${Math.min(pageNumber * 2, 11)} od 11.`)
    if (pageNumber === 1) {
      await expect(page.getByRole('button', { name: 'Prva stran' })).toBeDisabled()
      await expect(page.getByRole('button', { name: 'Prejšnja stran' })).toBeDisabled()
      await expect(page.getByRole('button', { name: 'Zadnja stran' })).toBeEnabled()
    } else {
      await expect(page.getByRole('button', { name: 'Prva stran' })).toBeEnabled()
      await expect(page.getByRole('button', { name: 'Prejšnja stran' })).toBeEnabled()
    }
    if (pageNumber === 6) {
      await expect(page.getByRole('button', { name: 'Naslednja stran' })).toBeDisabled()
      await expect(page.getByRole('button', { name: 'Zadnja stran' })).toBeDisabled()
    } else {
      await click(page, 'Naslednja stran')
    }
  }
  expect(visited).toEqual(allIds)
  await click(page, 'Prejšnja stran')
  await expectIds(page, allIds.slice(8, 10))
  await click(page, 'Prva stran')
  await expectIds(page, allIds.slice(0, 2))
  await click(page, 'Zadnja stran')
  await expectIds(page, allIds.slice(10))
})

test('R02, R04, R05, R06 and R11: sizes, filtering, views and counters', async ({ page }) => {
  const writes = await mount(page, records)
  await summary(page, [5, 3, 3])
  await select(page, 'Velikost strani', '2')
  await click(page, 'Naslednja stran')
  await select(page, 'Velikost strani', '5')
  await expectIds(page, allIds.slice(0, 5))
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 3. Prikazano 1–5 od 11.')

  await select(page, 'Filter strani', 'todo')
  await expectIds(page, ['web-02', 'web-04', 'web-07', 'web-08', 'web-11'])
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 1. Prikazano 1–5 od 5.')
  await select(page, 'Velikost strani', '10')
  await expectIds(page, ['web-02', 'web-04', 'web-07', 'web-08', 'web-11'])
  await board(page)
  await columnIds(page, 'Pripravljeno', ['web-02', 'web-04', 'web-07', 'web-08', 'web-11'])
  await columnIds(page, 'V delu', [])
  await columnIds(page, 'Končano', [])
  await summary(page, [5, 3, 3])

  await select(page, 'Filter strani', 'in_progress')
  await columnIds(page, 'V delu', ['web-01', 'web-05', 'web-09'])
  await select(page, 'Velikost strani', '2')
  await columnIds(page, 'V delu', ['web-01', 'web-05'])
  await table(page)
  await expectIds(page, ['web-01', 'web-05'])
  await readonly(page, writes)
})

test('R07 and R08: view, details, project and refresh preserve the agreed state', async ({ page }) => {
  await mount(page, records)
  await select(page, 'Velikost strani', '2')
  await click(page, 'Naslednja stran')
  await select(page, 'Filter strani', 'todo')
  await expectIds(page, ['web-02', 'web-04'])
  await board(page)
  await expectIds(page, ['web-02', 'web-04'])
  await details(page, 'web-04')
  await expectIds(page, ['web-02', 'web-04'])
  await expect(page).not.toHaveURL(/[?&](page|pageSize|filter)=/)
  expect(await page.evaluate(() => window.localStorage.length)).toBe(0)

  await project(page, 'launch')
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
  await expectIds(page, [])
  await page.reload()
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'done')
  await page.reload()
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
})

test('R10 and R12: empty results disable navigation and remain readonly', async ({ page }) => {
  const emptyDone = records.map((task) => ({ ...task, status: 'todo' as const }))
  const writes = await mount(page, emptyDone)
  await select(page, 'Filter strani', 'done')
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
  for (const name of ['Prva stran', 'Prejšnja stran', 'Naslednja stran', 'Zadnja stran']) {
    await expect(page.getByRole('button', { name, exact: true })).toBeDisabled()
  }
  await board(page)
  await expect(await ids(page)).toEqual([])
  for (const name of ['Pripravljeno', 'V delu', 'Končano']) {
    await expect(page.getByRole('region', { name, exact: true }).getByText('Ni opravil v tem stanju.')).toBeVisible()
  }
  await select(page, 'Filter strani', 'all')
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 1. Prikazano 1–11 od 11.')
  await expect(await ids(page)).toEqual(allIds)
  await readonly(page, writes)
})

test('R12: Folio stays usable at 390 pixels without page overflow', async ({ page }) => {
  const writes = await mount(page, records)
  await page.setViewportSize({ width: 390, height: 844 })
  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'todo')
  await board(page)
  await expectIds(page, ['web-02', 'web-04'])
  await details(page, 'web-02')
  await readonly(page, writes)
})
