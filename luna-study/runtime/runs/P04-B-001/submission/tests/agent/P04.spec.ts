import { test, expect, mount, makeTask, expectIds, webIds, select, board, table, columnIds, project, details, readonly } from '../development/helpers.ts'

test('defaults, normalized UTF-16 title order, stable ties and original override', async ({ page }) => {
  const records = [
    makeTask('one', { title: 'Čaj' }), makeTask('two', { title: 'Zebra' }),
    makeTask('three', { title: 'A2' }), makeTask('four', { title: 'A10' }),
    makeTask('five', { title: 'caj' }), makeTask('six', { title: 'Cafe' }),
    makeTask('seven', { title: 'Café' }),
  ]
  await mount(page, records)
  await expectIds(page, records.map((task) => task.id))
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('original')
  await expect(page.getByRole('combobox', { name: 'Primarna smer' })).toHaveValue('asc')
  await expect(page.getByRole('combobox', { name: 'Sekundarni ključ' })).toHaveValue('none')
  await expect(page.getByRole('combobox', { name: 'Sekundarna smer' })).toHaveValue('asc')

  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, ['four', 'three', 'six', 'seven', 'one', 'five', 'two'])
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['two', 'one', 'five', 'six', 'seven', 'three', 'four'])
  await select(page, 'Primarni ključ', 'original')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, records.map((task) => task.id))
})

test('status and calendar date ordering use an independent, stable secondary key', async ({ page }) => {
  const records = [
    makeTask('first', { title: 'Echo', status: 'todo', dueDate: '2026-09-01' }),
    makeTask('second', { title: 'Echo', status: 'todo', dueDate: '2026-10-03' }),
    makeTask('third', { title: 'Alfa', status: 'in_progress', dueDate: '2026-09-20' }),
    makeTask('fourth', { title: 'Echo', status: 'done', dueDate: '2026-01-04' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['second', 'first', 'third', 'fourth'])
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarna smer', 'asc')
  await expectIds(page, ['fourth', 'third', 'first', 'second'])

  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['first', 'second', 'fourth', 'third'])
})

test('one sorted projection drives both views and survives details, while project and refresh reset controls', async ({ page }) => {
  const writes = await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'assignee')
  await board(page)
  await columnIds(page, 'Pripravljeno', ['web-02', 'web-08', 'web-04', 'web-07'])
  await details(page, 'web-08')
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('title')
  await table(page)
  await expectIds(page, ['web-06', 'web-03', 'web-02', 'web-08', 'web-01', 'web-05', 'web-04', 'web-07'])
  await select(page, 'Primarni ključ', 'original')
  await expectIds(page, webIds())
  await project(page, 'launch')
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('original')
  await expect(page.getByRole('combobox', { name: 'Primarna smer' })).toHaveValue('asc')
  await expect(page.getByRole('combobox', { name: 'Sekundarni ključ' })).toHaveValue('none')
  await expect(page.getByRole('combobox', { name: 'Sekundarna smer' })).toHaveValue('asc')
  await select(page, 'Primarni ključ', 'dueDate')
  await page.reload()
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('original')
  await select(page, 'Primarni ključ', 'assignee')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await page.getByRole('button', { name: 'Izvorni vrstni red', exact: true }).click()
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('original')
  await expect(page.getByRole('combobox', { name: 'Primarna smer' })).toHaveValue('asc')
  await expect(page.getByRole('combobox', { name: 'Sekundarni ključ' })).toHaveValue('none')
  await expect(page.getByRole('combobox', { name: 'Sekundarna smer' })).toHaveValue('asc')
  await readonly(page, writes)
})

test('empty and single task projects accept every sort control at mobile width', async ({ page }) => {
  const records: ReturnType<typeof makeTask>[] = []
  const writes = await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'assignee')
  await select(page, 'Sekundarna smer', 'desc')
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
  await board(page)
  await expect(page.getByRole('region', { name: 'Tabla opravil' }).getByRole('region')).toHaveCount(3)

  records.push(makeTask('only', { title: 'Časovna os', status: 'done' }))
  await page.reload()
  await page.setViewportSize({ width: 390, height: 844 })
  for (const primary of ['original', 'title', 'assignee', 'status', 'dueDate']) {
    await select(page, 'Primarni ključ', primary)
    await select(page, 'Primarna smer', 'desc')
    await expectIds(page, ['only'])
  }
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['only'])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await readonly(page, writes)
})
