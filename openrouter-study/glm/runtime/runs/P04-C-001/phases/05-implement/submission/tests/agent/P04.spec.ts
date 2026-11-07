import { test, mount, makeTask, expectIds, webIds, select, board, table, columnIds, click, project, details, summary, readonly } from '../development/helpers.ts'
import { expect } from '@playwright/test'

const primaryKeys = ['original', 'title', 'assignee', 'status', 'dueDate'] as const
const secondaryKeys = ['none', 'title', 'assignee', 'status', 'dueDate'] as const
const orders = ['asc', 'desc'] as const

test('R01: defaults preserve API order', async ({ page }) => {
  await mount(page)
  await expect(page.getByRole('combobox', { name: 'Primarni ključ', exact: true })).toHaveValue('original')
  await expect(page.getByRole('combobox', { name: 'Primarna smer', exact: true })).toHaveValue('asc')
  await expect(page.getByRole('combobox', { name: 'Sekundarni ključ', exact: true })).toHaveValue('none')
  await expect(page.getByRole('combobox', { name: 'Sekundarna smer', exact: true })).toHaveValue('asc')
  await expectIds(page, webIds())
})

test('R02 and R03: exact key comparisons', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, ['web-07', 'web-04', 'web-05', 'web-01', 'web-08', 'web-02', 'web-03', 'web-06'])
  await select(page, 'Primarni ključ', 'assignee')
  await expectIds(page, ['web-01', 'web-03', 'web-05', 'web-07', 'web-02', 'web-04', 'web-08', 'web-06'])
  await select(page, 'Primarni ključ', 'status')
  await expectIds(page, ['web-02', 'web-04', 'web-07', 'web-08', 'web-01', 'web-05', 'web-03', 'web-06'])
  await select(page, 'Primarni ključ', 'dueDate')
  await expectIds(page, ['web-03', 'web-01', 'web-07', 'web-06', 'web-02', 'web-04', 'web-05', 'web-08'])
})

test('R04 through R06: directions and stable ties', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['web-06', 'web-02', 'web-03', 'web-08', 'web-01', 'web-05', 'web-04', 'web-07'])
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['web-06', 'web-02', 'web-03', 'web-08', 'web-01', 'web-05', 'web-04', 'web-07'])
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Primarna smer', 'asc')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['web-08', 'web-04', 'web-02', 'web-07', 'web-05', 'web-01', 'web-06', 'web-03'])
  await select(page, 'Primarni ključ', 'original')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, webIds())
})

test('R07: board columns use sorted projection', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'dueDate')
  await board(page)
  await columnIds(page, 'Pripravljeno', ['web-07', 'web-02', 'web-04', 'web-08'])
  await columnIds(page, 'V delu', ['web-01', 'web-05'])
  await columnIds(page, 'Končano', ['web-03', 'web-06'])
})

test('R08: view and details preserve settings', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'assignee')
  await select(page, 'Sekundarna smer', 'desc')
  await board(page)
  await table(page)
  await expect(page.getByRole('combobox', { name: 'Primarni ključ', exact: true })).toHaveValue('title')
  await expect(page.getByRole('combobox', { name: 'Primarna smer', exact: true })).toHaveValue('desc')
  await details(page, 'web-02')
  await expectIds(page, ['web-06', 'web-02', 'web-03', 'web-08', 'web-01', 'web-05', 'web-04', 'web-07'])
  await expect(page.getByRole('combobox', { name: 'Sekundarni ključ', exact: true })).toHaveValue('assignee')
})

test('R09 and R10: resets and edge sizes', async ({ page, browser }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'status')
  await select(page, 'Sekundarna smer', 'desc')
  await project(page, 'launch')
  await expect(page.getByRole('combobox', { name: 'Primarni ključ', exact: true })).toHaveValue('original')
  await expectIds(page, ['launch-01', 'launch-02'])
  await project(page, 'web')
  await select(page, 'Primarni ključ', 'title')
  await page.reload()
  await expect(page.getByRole('combobox', { name: 'Primarni ključ', exact: true })).toHaveValue('original')
  await expectIds(page, webIds())
  await select(page, 'Primarni ključ', 'assignee')
  await click(page, 'Izvorni vrstni red')
  await expectIds(page, webIds())

  const emptyPage = await browser.newPage()
  try {
    await mount(emptyPage, [])
    for (const key of primaryKeys) for (const order of orders) await select(emptyPage, 'Primarni ključ', key).then(() => select(emptyPage, 'Primarna smer', order))
    for (const key of secondaryKeys) for (const order of orders) await select(emptyPage, 'Sekundarni ključ', key).then(() => select(emptyPage, 'Sekundarna smer', order))
    await expectIds(emptyPage, [])
  } finally {
    await emptyPage.close()
  }

  const singlePage = await browser.newPage()
  try {
    await mount(singlePage, [makeTask('only-1')])
    for (const key of primaryKeys) for (const order of orders) await select(singlePage, 'Primarni ključ', key).then(() => select(singlePage, 'Primarna smer', order))
    for (const key of secondaryKeys) for (const order of orders) await select(singlePage, 'Sekundarni ključ', key).then(() => select(singlePage, 'Sekundarna smer', order))
    await expectIds(singlePage, ['only-1'])
  } finally {
    await singlePage.close()
  }
})

test('R11 and R12: projection safety and identity', async ({ page }) => {
  const writes = await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await summary(page, [4, 2, 2])
  await expectIds(page, ['web-06', 'web-02', 'web-03', 'web-08', 'web-01', 'web-05', 'web-04', 'web-07'], false)
  await details(page, 'web-02')
  await board(page)
  await details(page, 'web-03')
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await readonly(page, writes)
})
