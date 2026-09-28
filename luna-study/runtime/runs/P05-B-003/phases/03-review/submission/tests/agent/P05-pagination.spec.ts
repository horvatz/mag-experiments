import { test, expect, mount, examples, webIds, ids, select, click, board, table, details, summary, project, readonly } from '../development/helpers.ts'

test('P05 pagination: page sizes partition tasks without losing IDs', async ({ page }) => {
  await mount(page)
  const expected = webIds()
  await expectIdsFor(page, expected)
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 1. Prikazano 1–8 od 8.')

  for (const size of ['2', '5', '10']) {
    await select(page, 'Velikost strani', size)
    const collected: string[] = []
    while (true) {
      collected.push(...(await ids(page)).filter((id): id is string => id !== null))
      if (await page.getByRole('button', { name: 'Naslednja stran', exact: true }).isDisabled()) break
      await click(page, 'Naslednja stran')
    }
    expect(collected).toEqual(expected)
    expect(new Set(collected).size).toBe(expected.length)
  }
})

test('P05 pagination: first, previous, next and last navigate to the right page', async ({ page }) => {
  await mount(page)
  await select(page, 'Velikost strani', '2')
  const status = page.getByRole('status', { name: 'Stanje straničenja' })
  await expect(status).toHaveText('Stran 1 od 4. Prikazano 1–2 od 8.')
  await expect(page.getByRole('button', { name: 'Prva stran', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Prejšnja stran', exact: true })).toBeDisabled()
  await click(page, 'Naslednja stran')
  await expect(status).toHaveText('Stran 2 od 4. Prikazano 3–4 od 8.')
  await click(page, 'Prejšnja stran')
  await expect(status).toHaveText('Stran 1 od 4. Prikazano 1–2 od 8.')
  await click(page, 'Zadnja stran')
  await expect(status).toHaveText('Stran 4 od 4. Prikazano 7–8 od 8.')
  await expect(page.getByRole('button', { name: 'Naslednja stran', exact: true })).toBeDisabled()
  await click(page, 'Prva stran')
  await expect(status).toHaveText('Stran 1 od 4. Prikazano 1–2 od 8.')
})

test('P05 pagination: filtering, view and details preserve the page state', async ({ page }) => {
  await mount(page)
  await select(page, 'Velikost strani', '2')
  await click(page, 'Zadnja stran')
  await select(page, 'Filter strani', 'todo')
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 2. Prikazano 1–2 od 4.')
  await expectIdsFor(page, ['web-02', 'web-04'])
  await summary(page, [4, 2, 2])
  await board(page)
  await expectIdsFor(page, ['web-02', 'web-04'])
  await details(page, 'web-04')
  await expectIdsFor(page, ['web-02', 'web-04'])
  await table(page)
  await expectIdsFor(page, ['web-02', 'web-04'])
})

test('P05 pagination: empty filter disables navigation and clearing it starts at page one', async ({ page }) => {
  const onlyTodo = examples.filter((task) => task.projectId === 'web' && task.status === 'todo')
  await mount(page, onlyTodo)
  await select(page, 'Velikost strani', '2')
  await click(page, 'Zadnja stran')
  await select(page, 'Filter strani', 'done')
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
  for (const name of ['Prva stran', 'Prejšnja stran', 'Naslednja stran', 'Zadnja stran']) {
    await expect(page.getByRole('button', { name, exact: true })).toBeDisabled()
  }
  await select(page, 'Filter strani', 'all')
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 2. Prikazano 1–2 od 4.')
  await expectIdsFor(page, ['web-02', 'web-04'])
  await project(page, 'launch')
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
  for (const name of ['Prva stran', 'Prejšnja stran', 'Naslednja stran', 'Zadnja stran']) {
    await expect(page.getByRole('button', { name, exact: true })).toBeDisabled()
  }
})

test('P05 pagination: changing projects and refreshing resets local pagination state', async ({ page }) => {
  const writes = await mount(page)
  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'todo')
  await click(page, 'Naslednja stran')
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 2 od 2. Prikazano 3–4 od 4.')
  expect(await page.evaluate(() => window.location.hash)).not.toMatch(/page|filter/i)
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0])

  await project(page, 'launch')
  await expect(page.getByRole('combobox', { name: 'Velikost strani' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter strani' })).toHaveValue('all')
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 1. Prikazano 1–2 od 2.')
  await page.reload()
  await expect(page.getByRole('combobox', { name: 'Velikost strani' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter strani' })).toHaveValue('all')
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 1. Prikazano 1–2 od 2.')
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await readonly(page, writes)
})

async function expectIdsFor(page: Parameters<typeof ids>[0], expected: string[]) {
  await expect.poll(async () => (await ids(page)).map((id) => id ?? '')).toEqual(expected)
}
