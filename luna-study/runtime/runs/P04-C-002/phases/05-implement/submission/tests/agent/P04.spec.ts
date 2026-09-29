import { test, expect, mount, makeTask, examples, select, expectIds, webIds, board, columnIds, project, details, summary } from '../development/helpers.ts'

test('P04: title normalization is accent/case insensitive and lexicographic, with stable ties', async ({ page }) => {
  const records = [
    makeTask('one', { title: 'Čaj' }),
    makeTask('two', { title: 'Caj' }),
    makeTask('three', { title: 'češnja' }),
    makeTask('four', { title: 'Cesta' }),
    makeTask('five', { title: 'Naloga 10' }),
    makeTask('six', { title: 'Naloga 2' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, ['one', 'two', 'three', 'four', 'five', 'six'])
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['six', 'five', 'four', 'three', 'one', 'two'])
})

test('P04: status, date and independent secondary direction', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['web-08', 'web-04', 'web-02', 'web-07', 'web-05', 'web-01', 'web-06', 'web-03'])
  await select(page, 'Primarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'asc')
  await expectIds(page, ['web-03', 'web-01', 'web-07', 'web-06', 'web-02', 'web-04', 'web-05', 'web-08'])
})

test('P04: ties stay stable, same keys add no reversal, and original overrides controls', async ({ page }) => {
  const records = [
    makeTask('a', { title: 'X', assignee: 'Ana' }),
    makeTask('b', { title: 'x', assignee: 'Boris' }),
    makeTask('c', { title: 'X', assignee: 'Cvetka' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['a', 'b', 'c'])
  await select(page, 'Sekundarni ključ', 'assignee')
  await select(page, 'Sekundarna smer', 'asc')
  await expectIds(page, ['a', 'b', 'c'])
  await select(page, 'Primarni ključ', 'original')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['a', 'b', 'c'])
})

test('P04: the board uses sorted relative order within fixed status columns', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'dueDate')
  await board(page)
  await columnIds(page, 'Pripravljeno', ['web-07', 'web-02', 'web-04', 'web-08'])
  await columnIds(page, 'V delu', ['web-01', 'web-05'])
  await columnIds(page, 'Končano', ['web-03', 'web-06'])
})

test('P04: sort state survives view and details, but resets for project and reload', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'assignee')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await board(page)
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('assignee')
  await select(page, 'Sekundarni smer', 'asc')
  await details(page, 'web-01')
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('assignee')
  await expect(page.getByRole('combobox', { name: 'Sekundarna smer' })).toHaveValue('asc')
  await project(page, 'launch')
  for (const [name, value] of [['Primarni ključ', 'original'], ['Primarna smer', 'asc'], ['Sekundarni ključ', 'none'], ['Sekundarna smer', 'asc']]) {
    await expect(page.getByRole('combobox', { name })).toHaveValue(value)
  }
  await select(page, 'Primarni ključ', 'title')
  await page.reload()
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('original')
  expect(new URL(page.url()).hash).not.toContain('sort')
})

test('P04: reset, projection, IDs, counts and mobile width', async ({ page }) => {
  const writes = await mount(page)
  await summary(page, [4, 2, 2])
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await page.getByRole('button', { name: 'Izvorni vrstni red' }).click()
  await expectIds(page, webIds())
  await summary(page, [4, 2, 2])
  await expect(page.getByRole('group', { name: 'Prikaz opravil' })).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await expect(page.locator('[data-task-id]')).toHaveCount(8)
  const state = await page.request.get('/__test/state')
  expect((await state.json()).saveRequests).toBe(0)
  expect(writes).toEqual([])
})

test('P04: empty and singleton lists support every control value', async ({ page }) => {
  const primaryKeys = ['original', 'title', 'assignee', 'status', 'dueDate']
  const secondaryKeys = ['none', 'title', 'assignee', 'status', 'dueDate']
  for (const records of [[], [makeTask('only')]]) {
    await mount(page, records)
    for (const primary of primaryKeys) for (const primaryDirection of ['asc', 'desc']) {
      for (const secondary of secondaryKeys) for (const secondaryDirection of ['asc', 'desc']) {
        await select(page, 'Primarni ključ', primary)
        await select(page, 'Primarna smer', primaryDirection)
        await select(page, 'Sekundarni ključ', secondary)
        await select(page, 'Sekundarna smer', secondaryDirection)
        await expectIds(page, records.map((task) => task.id))
      }
    }
  }
})

test('P04: duplicate titles resolve details by ID', async ({ page }) => {
  await mount(page, examples)
  await details(page, 'web-02')
  await details(page, 'web-03')
})
