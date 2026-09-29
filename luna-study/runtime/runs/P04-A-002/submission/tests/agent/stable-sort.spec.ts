import { board, click, expect, expectIds, makeTask, mount, project, select, table, test } from '../development/helpers.ts'

test('text sorting uses normalized UTF-16 comparison and stable ties in both directions', async ({ page }) => {
  const rows = [
    makeTask('accent-1', { title: 'Éclair' }),
    makeTask('number-2', { title: 'Item 2' }),
    makeTask('punctuation', { title: 'a!' }),
    makeTask('combining', { title: 'e\u0301CLAIR' }),
    makeTask('number-10', { title: 'Item 10' }),
    makeTask('accent-2', { title: 'éclair' }),
    makeTask('letters', { title: 'ab' }),
  ]
  const writes = await mount(page, rows)
  await expectIds(page, rows.map((task) => task.id))
  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, ['punctuation', 'letters', 'accent-1', 'combining', 'accent-2', 'number-10', 'number-2'])
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['number-2', 'number-10', 'accent-1', 'combining', 'accent-2', 'letters', 'punctuation'])
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await select(page, 'Primarni ključ', 'original')
  await expectIds(page, rows.map((task) => task.id))
  await click(page, 'Izvorni vrstni red')
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('original')
  await expect(page.getByRole('combobox', { name: 'Primarna smer' })).toHaveValue('asc')
  await expect(page.getByRole('combobox', { name: 'Sekundarni ključ' })).toHaveValue('none')
  await expect(page.getByRole('combobox', { name: 'Sekundarna smer' })).toHaveValue('asc')
  expect(writes).toEqual([])
})

test('secondary keys have their own direction, and state/date order is fixed', async ({ page }) => {
  const rows = [
    makeTask('a-05', { title: 'Alpha', assignee: 'Živa', dueDate: '2026-10-05', status: 'done' }),
    makeTask('b-02', { title: 'Beta', assignee: 'Ana', dueDate: '2026-10-02', status: 'todo' }),
    makeTask('a-01', { title: 'aLPHA', assignee: 'Črt', dueDate: '2026-10-01', status: 'in_progress' }),
    makeTask('a-03', { title: 'Alpha', assignee: 'ana', dueDate: '2026-10-03', status: 'todo' }),
    makeTask('a-04', { title: 'alpha', assignee: 'Ziva', dueDate: '2026-10-04', status: 'done' }),
    makeTask('b-06', { title: 'beta', assignee: 'čRT', dueDate: '2026-10-06', status: 'in_progress' }),
  ]
  await mount(page, rows)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['a-05', 'a-04', 'a-03', 'a-01', 'b-06', 'b-02'])
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarna smer', 'asc')
  await expectIds(page, ['b-02', 'b-06', 'a-01', 'a-03', 'a-04', 'a-05'])
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Primarna smer', 'asc')
  await expectIds(page, ['b-02', 'a-03', 'a-01', 'b-06', 'a-04', 'a-05'])
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['a-04', 'a-05', 'a-01', 'b-06', 'b-02', 'a-03'])

  await select(page, 'Primarni ključ', 'assignee')
  await select(page, 'Primarna smer', 'asc')
  await select(page, 'Sekundarni ključ', 'none')
  await expectIds(page, ['b-02', 'a-03', 'a-01', 'b-06', 'a-05', 'a-04'])
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['a-05', 'a-04', 'a-01', 'b-06', 'b-02', 'a-03'])

  await select(page, 'Primarni ključ', 'dueDate')
  await select(page, 'Primarna smer', 'asc')
  await expectIds(page, ['a-01', 'b-02', 'a-03', 'a-04', 'a-05', 'b-06'])
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['b-06', 'a-05', 'a-04', 'a-03', 'b-02', 'a-01'])
})

test('view, details, project navigation and reload follow the requested state lifetime', async ({ page }) => {
  const rows = [
    makeTask('web-a', { title: 'Enak naslov' }),
    makeTask('web-b', { title: 'Enak naslov' }),
    makeTask('launch-a', { projectId: 'launch', title: 'Drugi projekt' }),
  ]
  const writes = await mount(page, rows)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'assignee')
  await select(page, 'Sekundarna smer', 'desc')
  await board(page)
  await expectIds(page, ['web-a', 'web-b'])
  await table(page)
  await page.locator('[data-task-id="web-b"]').getByRole('link').click()
  await expect(page.getByRole('dialog').getByText('web-b', { exact: true }).first()).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('title')
  await expectIds(page, ['web-a', 'web-b'])

  await project(page, 'launch')
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('original')
  await select(page, 'Sekundarni ključ', 'status')
  await project(page, 'web')
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('original')
  await expect(page.getByRole('combobox', { name: 'Sekundarni ključ' })).toHaveValue('none')

  await select(page, 'Primarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await page.reload()
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('original')
  await expect(page.getByRole('combobox', { name: 'Sekundarna smer' })).toHaveValue('asc')
  expect(writes).toEqual([])
})

test('empty and single task projects handle every control and stay within a mobile viewport', async ({ page }) => {
  await mount(page, [])
  for (const primary of ['original', 'title', 'assignee', 'status', 'dueDate']) {
    await select(page, 'Primarni ključ', primary)
    await select(page, 'Primarna smer', 'desc')
    await select(page, 'Sekundarni ključ', 'dueDate')
    await select(page, 'Sekundarna smer', 'desc')
    await expectIds(page, [])
  }
  await board(page)
  await expect(page.locator('[data-task-id]')).toHaveCount(0)

  const only = makeTask('only', { title: 'Edino opravilo' })
  const singlePage = await page.context().newPage()
  await mount(singlePage, [only])
  for (const primary of ['original', 'title', 'assignee', 'status', 'dueDate']) {
    await select(singlePage, 'Primarni ključ', primary)
    for (const direction of ['asc', 'desc']) {
      await select(singlePage, 'Primarna smer', direction)
      await select(singlePage, 'Sekundarni ključ', 'status')
      await select(singlePage, 'Sekundarna smer', direction)
      await expectIds(singlePage, ['only'])
    }
  }
  await singlePage.setViewportSize({ width: 390, height: 844 })
  await expect(singlePage.locator('[data-task-id="only"]')).toBeVisible()
  expect(await singlePage.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
})
