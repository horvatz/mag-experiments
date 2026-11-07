import { board, click, details, expect, ids, makeTask, mount, project, readonly, select, summary, table, test } from '../development/helpers.ts'

const records = Array.from({ length: 11 }, (_, index) => {
  const number = String(index + 1).padStart(2, '0')
  const statuses = ['todo', 'in_progress', 'done'] as const
  return makeTask(`web-${number}`, { status: statuses[index % statuses.length] })
})
  .concat([
    makeTask('launch-01', { projectId: 'launch', status: 'todo' }),
    makeTask('launch-02', { projectId: 'launch', status: 'done' }),
  ])

function status(page: Parameters<typeof ids>[0]) {
  return page.getByRole('status', { name: 'Stanje straničenja' })
}

test('pagination pages, filters, views, details, projects, and counts', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 })
  const writes = await mount(page, records)
  const allWebIds = records.filter((task) => task.projectId === 'web').map((task) => task.id)

  await expect(status(page)).toHaveText('Stran 1 od 1. Prikazano 1–11 od 11.')
  await expect(page.locator('[data-task-id]')).toHaveCount(11)
  expect(await ids(page)).toEqual(allWebIds)
  await expect(page.getByRole('button', { name: 'Prva stran', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Prejšnja stran', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Naslednja stran', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Zadnja stran', exact: true })).toBeDisabled()

  await select(page, 'Velikost strani', '2')
  await expect(status(page)).toHaveText('Stran 1 od 6. Prikazano 1–2 od 11.')
  expect(await ids(page)).toEqual(allWebIds.slice(0, 2))
  await click(page, 'Naslednja stran')
  expect(await ids(page)).toEqual(allWebIds.slice(2, 4))
  await click(page, 'Zadnja stran')
  await expect(status(page)).toHaveText('Stran 6 od 6. Prikazano 11–11 od 11.')
  expect(await ids(page)).toEqual(allWebIds.slice(10))
  await expect(page.getByRole('button', { name: 'Prva stran', exact: true })).toBeEnabled()
  await expect(page.getByRole('button', { name: 'Prejšnja stran', exact: true })).toBeEnabled()
  await expect(page.getByRole('button', { name: 'Naslednja stran', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Zadnja stran', exact: true })).toBeDisabled()
  await click(page, 'Prva stran')
  await click(page, 'Naslednja stran')
  await click(page, 'Prejšnja stran')
  await expect(status(page)).toHaveText('Stran 1 od 6. Prikazano 1–2 od 11.')

  await select(page, 'Velikost strani', '5')
  await expect(status(page)).toHaveText('Stran 1 od 3. Prikazano 1–5 od 11.')
  await select(page, 'Velikost strani', '10')
  await expect(status(page)).toHaveText('Stran 1 od 2. Prikazano 1–10 od 11.')
  await click(page, 'Zadnja stran')
  await expect(status(page)).toHaveText('Stran 2 od 2. Prikazano 11–11 od 11.')
  await select(page, 'Velikost strani', 'all')
  await expect(status(page)).toHaveText('Stran 1 od 1. Prikazano 1–11 od 11.')

  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'todo')
  const todoIds = records.filter((task) => task.projectId === 'web' && task.status === 'todo').map((task) => task.id)
  await expect(status(page)).toHaveText('Stran 1 od 2. Prikazano 1–2 od 4.')
  expect(await ids(page)).toEqual(todoIds.slice(0, 2))
  await board(page)
  expect(await ids(page)).toEqual(todoIds.slice(0, 2))
  await expect(page.getByRole('region', { name: 'Pripravljeno', exact: true }).locator('.column-count')).toHaveText('2')
  await details(page, todoIds[0])
  await expect(status(page)).toHaveText('Stran 1 od 2. Prikazano 1–2 od 4.')
  await table(page)
  expect(await ids(page)).toEqual(todoIds.slice(0, 2))
  await select(page, 'Filter strani', 'all')
  await expect(status(page)).toHaveText('Stran 1 od 6. Prikazano 1–2 od 11.')
  expect(await ids(page)).toEqual(allWebIds.slice(0, 2))

  await summary(page, [4, 4, 3])
  await expect(page.locator('.table-footer')).toContainText('3 / 11 končanih')
  await project(page, 'launch')
  await expect(status(page)).toHaveText('Stran 1 od 1. Prikazano 1–2 od 2.')
  await select(page, 'Velikost strani', '2')
  await project(page, 'web')
  await expect(status(page)).toHaveText('Stran 1 od 1. Prikazano 1–11 od 11.')

  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'done')
  await page.reload()
  await expect(status(page)).toHaveText('Stran 1 od 1. Prikazano 1–11 od 11.')
  expect(await ids(page)).toEqual(allWebIds)
  expect(new URL(page.url()).searchParams.has('size')).toBe(false)
  expect(new URL(page.url()).searchParams.has('filter')).toBe(false)
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([])
  await readonly(page, writes)
})

test('empty projects and filters show zero status and disabled navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 })
  await mount(page, records, '#/projects/launch')
  await expect(status(page)).toHaveText('Stran 1 od 1. Prikazano 1–2 od 2.')
  await select(page, 'Filter strani', 'in_progress')
  await expect(status(page)).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
  for (const name of ['Prva stran', 'Prejšnja stran', 'Naslednja stran', 'Zadnja stran']) {
    await expect(page.getByRole('button', { name, exact: true })).toBeDisabled()
  }
  await select(page, 'Filter strani', 'all')
  await expect(status(page)).toHaveText('Stran 1 od 1. Prikazano 1–2 od 2.')
  expect(await ids(page)).toEqual(['launch-01', 'launch-02'])

  await project(page, 'web')
  await select(page, 'Filter strani', 'done')
  const doneIds = records.filter((task) => task.projectId === 'web' && task.status === 'done').map((task) => task.id)
  await expect(status(page)).toHaveText('Stran 1 od 1. Prikazano 1–3 od 3.')
  expect(await ids(page)).toEqual(doneIds)
})

test('pagination fits a 390 pixel page without whole-page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page, records)
  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'todo')
  await board(page)
  await click(page, 'Zadnja stran')
  await expect(status(page)).toHaveText('Stran 2 od 2. Prikazano 3–4 od 4.')
  expect(await ids(page)).toEqual(['web-07', 'web-10'])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await readonly(page, writes)
})
