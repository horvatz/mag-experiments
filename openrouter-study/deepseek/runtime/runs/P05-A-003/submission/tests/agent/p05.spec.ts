import { test, expect, mount, expectIds, ids, select, click, board, table, project, details, columnIds, summary, readonly, makeTask, webIds } from '../development/helpers.ts'

const buttons = ['Prva stran', 'Prejšnja stran', 'Naslednja stran', 'Zadnja stran']
const disabledAll = async (page: import('@playwright/test').Page) => {
  for (const name of buttons) await expect(page.getByRole('button', { name, exact: true })).toBeDisabled()
}

test('A01: privzetka all/all, izvorni vrstni red in onemogočeni robovi', async ({ page }) => {
  await mount(page)
  await expect(page.getByRole('combobox', { name: 'Velikost strani', exact: true })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter strani', exact: true })).toHaveValue('all')
  await expectIds(page, webIds())
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 1. Prikazano 1–8 od 8.')
  await disabledAll(page)
})

test('A02: velikost 2 razdeli polje na zaporedne odseke brez podvajanj', async ({ page }) => {
  await mount(page)
  await select(page, 'Velikost strani', '2')
  const pages = [['web-01', 'web-02'], ['web-03', 'web-04'], ['web-05', 'web-06'], ['web-07', 'web-08']]
  const seen: (string | null)[] = []
  for (let index = 0; index < pages.length; index++) {
    await expectIds(page, pages[index])
    await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText(`Stran ${index + 1} od 4. Prikazano ${index * 2 + 1}–${index * 2 + 2} od 8.`)
    if (index === 0) {
      await expect(page.getByRole('button', { name: 'Prva stran', exact: true })).toBeDisabled()
      await expect(page.getByRole('button', { name: 'Prejšnja stran', exact: true })).toBeDisabled()
    }
    seen.push(...(await ids(page)))
    if (index < pages.length - 1) await click(page, 'Naslednja stran')
  }
  await expect(page.getByRole('button', { name: 'Naslednja stran', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Zadnja stran', exact: true })).toBeDisabled()
  expect(seen).toEqual(webIds())
  expect(new Set(seen).size).toBe(8)
  await click(page, 'Prejšnja stran')
  await expectIds(page, ['web-05', 'web-06'])
  await click(page, 'Prva stran')
  await expectIds(page, ['web-01', 'web-02'])
})

test('A03: velikost 5 ima krajšo zadnjo stran, sprememba velikosti vrne na prvo', async ({ page }) => {
  await mount(page)
  await select(page, 'Velikost strani', '5')
  await click(page, 'Zadnja stran')
  await expectIds(page, ['web-06', 'web-07', 'web-08'])
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 2 od 2. Prikazano 6–8 od 8.')
  await select(page, 'Velikost strani', '2')
  await expectIds(page, ['web-01', 'web-02'])
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 4. Prikazano 1–2 od 8.')
  await select(page, 'Velikost strani', 'all')
  await expectIds(page, webIds())
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 1. Prikazano 1–8 od 8.')
})

test('A04: filter se uporabi pred straničenjem, povzetek ostane celoten, brez zapisov', async ({ page }) => {
  const writes = await mount(page)
  await select(page, 'Velikost strani', '2')
  await click(page, 'Zadnja stran')
  await select(page, 'Filter strani', 'todo')
  await expectIds(page, ['web-02', 'web-04'])
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 2. Prikazano 1–2 od 4.')
  await summary(page, [4, 2, 2])
  await expect(page.locator('.count-badge')).toHaveText('8')
  await click(page, 'Naslednja stran')
  await expectIds(page, ['web-07', 'web-08'])
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 2 od 2. Prikazano 3–4 od 4.')
  await select(page, 'Filter strani', 'all')
  await expectIds(page, ['web-01', 'web-02'])
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 4. Prikazano 1–2 od 8.')
  await summary(page, [4, 2, 2])
  await readonly(page, writes)
})

test('A05: preklop pogleda in podrobnosti ohranijo stran, velikost in filter', async ({ page }) => {
  await mount(page)
  await select(page, 'Velikost strani', '2')
  await click(page, 'Naslednja stran')
  await expectIds(page, ['web-03', 'web-04'])
  await board(page)
  await expectIds(page, ['web-03', 'web-04'], false)
  await columnIds(page, 'Končano', ['web-03'])
  await columnIds(page, 'Pripravljeno', ['web-04'])
  await details(page, 'web-03')
  await expect(page.getByRole('combobox', { name: 'Velikost strani', exact: true })).toHaveValue('2')
  await expect(page.getByRole('combobox', { name: 'Filter strani', exact: true })).toHaveValue('all')
  await expectIds(page, ['web-03', 'web-04'], false)
  await table(page)
  await expectIds(page, ['web-03', 'web-04'])
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 2 od 4. Prikazano 3–4 od 8.')
})

test('A06: menjava projekta in osvežitev ponastavita stanje', async ({ page }) => {
  await mount(page)
  await select(page, 'Velikost strani', '2')
  await click(page, 'Naslednja stran')
  await project(page, 'launch')
  await expect(page.getByRole('combobox', { name: 'Velikost strani', exact: true })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter strani', exact: true })).toHaveValue('all')
  await expectIds(page, ['launch-01', 'launch-02'])
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 1. Prikazano 1–2 od 2.')
  await project(page, 'web')
  await select(page, 'Velikost strani', '5')
  await click(page, 'Naslednja stran')
  await page.reload()
  await expect(page.getByRole('combobox', { name: 'Velikost strani', exact: true })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter strani', exact: true })).toHaveValue('all')
  await expectIds(page, webIds())
})

test('A07: prazen projekt ima status 0/0 in onemogočene gumbe', async ({ page }) => {
  await mount(page, [])
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
  await disabledAll(page)
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
  await board(page)
  await expect(page.getByRole('region', { name: 'Tabla opravil', exact: true }).locator('[data-task-id]')).toHaveCount(0)
})

test('A08: filter brez zadetkov se vrne na prvo stran ob odstranitvi', async ({ page }) => {
  await mount(page, [makeTask('web-01'), makeTask('web-02', { status: 'done' })])
  await select(page, 'Filter strani', 'in_progress')
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
  await disabledAll(page)
  await expect(page.getByRole('heading', { name: 'Ni opravil za izbrani filter' })).toBeVisible()
  await select(page, 'Filter strani', 'all')
  await expectIds(page, ['web-01', 'web-02'])
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 1. Prikazano 1–2 od 2.')
  await summary(page, [1, 0, 1])
})

test('A09: stevci stolpcev stejejo trenutno stran, povzetek celoten projekt', async ({ page }) => {
  await mount(page)
  await select(page, 'Velikost strani', '2')
  await board(page)
  await expectIds(page, ['web-01', 'web-02'], false)
  const column = (name: string) => page.getByRole('region', { name: 'Tabla opravil', exact: true }).getByRole('region', { name, exact: true })
  await expect(column('Pripravljeno').locator('.column-count')).toHaveText('1')
  await expect(column('V delu').locator('.column-count')).toHaveText('1')
  await expect(column('Končano').locator('.column-count')).toHaveText('0')
  await summary(page, [4, 2, 2])
  await click(page, 'Naslednja stran')
  await columnIds(page, 'Končano', ['web-03'])
  await columnIds(page, 'Pripravljeno', ['web-04'])
  await expect(page.locator('.count-badge')).toHaveText('8')
  await summary(page, [4, 2, 2])
})

test('A10: eno samo opravilo je ena stran velikosti 1', async ({ page }) => {
  await mount(page, [makeTask('web-01')])
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 1. Prikazano 1–1 od 1.')
  await disabledAll(page)
  await select(page, 'Velikost strani', '2')
  await expectIds(page, ['web-01'])
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 1. Prikazano 1–1 od 1.')
})

test('A11: deset opravil sestavi pet strani po 2 in eno stran po 10', async ({ page }) => {
  const many = Array.from({ length: 10 }, (_, index) => makeTask(`web-${String(index + 1).padStart(2, '0')}`))
  await mount(page, many)
  await select(page, 'Velikost strani', '10')
  await expectIds(page, many.map((task) => task.id))
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 1. Prikazano 1–10 od 10.')
  await select(page, 'Velikost strani', '2')
  await click(page, 'Zadnja stran')
  await expectIds(page, ['web-09', 'web-10'])
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 5 od 5. Prikazano 9–10 od 10.')
})
