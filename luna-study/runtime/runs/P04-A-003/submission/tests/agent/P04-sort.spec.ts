import { mount, makeTask, test, expect, expectIds, webIds, select, board, columnIds, project, readonly } from '../development/helpers.ts'

test('P04: title normalization uses code-unit order and keeps normalized ties stable', async ({ page }) => {
  const records = [
    makeTask('z', { title: 'zeta', assignee: 'Živa' }),
    makeTask('accented', { title: 'Éclair', assignee: 'Émile' }),
    makeTask('decomposed', { title: 'e\u0301clair', assignee: 'e\u0301mile' }),
    makeTask('two', { title: 'Task 2', assignee: 'Ana 2' }),
    makeTask('ten', { title: 'Task 10', assignee: 'Ana 10' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, ['accented', 'decomposed', 'ten', 'two', 'z'])
  await select(page, 'Primarni ključ', 'assignee')
  await expectIds(page, ['ten', 'two', 'accented', 'decomposed', 'z'])
})

test('P04: status and date keys use independent directions and preserve equal-key order', async ({ page }) => {
  const records = [
    makeTask('todo-late', { status: 'todo', dueDate: '2026-02-10' }),
    makeTask('todo-early', { status: 'todo', dueDate: '2026-02-05' }),
    makeTask('done-late', { status: 'done', dueDate: '2026-01-08' }),
    makeTask('done-early', { status: 'done', dueDate: '2026-01-02' }),
    makeTask('progress', { status: 'in_progress', dueDate: '2026-01-04' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await expectIds(page, ['done-early', 'done-late', 'progress', 'todo-early', 'todo-late'])
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['done-late', 'done-early', 'progress', 'todo-late', 'todo-early'])
  await select(page, 'Sekundarni ključ', 'none')
  await expectIds(page, ['done-late', 'done-early', 'progress', 'todo-late', 'todo-early'])
  await select(page, 'Sekundarni ključ', 'status')
  await expectIds(page, ['done-late', 'done-early', 'progress', 'todo-late', 'todo-early'])
})

test('P04: duplicate titles retain every ID and details open for the selected ID on both views', async ({ page }) => {
  const records = [
    makeTask('dup-done', { title: 'Isti naslov', status: 'done' }),
    makeTask('other', { title: 'Druga naloga', status: 'todo' }),
    makeTask('dup-todo', { title: 'Isti naslov', status: 'todo' }),
    makeTask('dup-progress', { title: 'Isti naslov', status: 'in_progress' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, ['other', 'dup-done', 'dup-todo', 'dup-progress'])
  await page.locator('[data-task-id="dup-todo"]').getByRole('link').click()
  await expect(page.getByRole('dialog').getByText('dup-todo', { exact: true }).first()).toBeVisible()
  await page.keyboard.press('Escape')
  await board(page)
  await columnIds(page, 'Pripravljeno', ['other', 'dup-todo'])
  await columnIds(page, 'V delu', ['dup-progress'])
  await columnIds(page, 'Končano', ['dup-done'])
  await expectIds(page, ['other', 'dup-todo', 'dup-progress', 'dup-done'])
  await page.locator('[data-task-id="dup-done"]').getByRole('link').click()
  await expect(page.getByRole('dialog').getByText('dup-done', { exact: true }).first()).toBeVisible()
})

test('P04: controls survive view and details, then reset for another project and refresh', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'assignee')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await board(page)
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('assignee')
  await expect(page.getByRole('combobox', { name: 'Primarna smer' })).toHaveValue('desc')
  await expect(page.getByRole('combobox', { name: 'Sekundarni ključ' })).toHaveValue('dueDate')
  await expect(page.getByRole('combobox', { name: 'Sekundarna smer' })).toHaveValue('desc')
  await page.locator('[data-task-id="web-01"]').getByRole('link').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('assignee')

  await project(page, 'launch')
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('original')
  await expect(page.getByRole('combobox', { name: 'Primarna smer' })).toHaveValue('asc')
  await expect(page.getByRole('combobox', { name: 'Sekundarni ključ' })).toHaveValue('none')
  await expect(page.getByRole('combobox', { name: 'Sekundarna smer' })).toHaveValue('asc')
  await project(page, 'web')
  await select(page, 'Primarni ključ', 'title')
  await page.reload()
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('original')
  await expect(page.getByRole('combobox', { name: 'Primarna smer' })).toHaveValue('asc')
  await expect(page.getByRole('combobox', { name: 'Sekundarni ključ' })).toHaveValue('none')
  await expect(page.getByRole('combobox', { name: 'Sekundarna smer' })).toHaveValue('asc')
})

test('P04: empty project accepts every key and direction', async ({ page }) => {
  const writes = await mount(page, [])
  const primaryKeys = ['original', 'title', 'assignee', 'status', 'dueDate']
  const secondaryKeys = ['none', 'title', 'assignee', 'status', 'dueDate']
  for (const key of primaryKeys) {
    await select(page, 'Primarni ključ', key)
    for (const direction of ['asc', 'desc']) await select(page, 'Primarna smer', direction)
  }
  for (const key of secondaryKeys) {
    await select(page, 'Sekundarni ključ', key)
    for (const direction of ['asc', 'desc']) await select(page, 'Sekundarna smer', direction)
  }
  await expectIds(page, [])
  await readonly(page, writes)
})

test('P04: one task works with every key and direction without changing identity or data', async ({ page }) => {
  const records = [makeTask('only', { title: 'Éna naloga', assignee: 'Živa Kovač', status: 'done', dueDate: '2026-02-28' })]
  const writes = await mount(page, records)
  for (const key of ['original', 'title', 'assignee', 'status', 'dueDate']) {
    await select(page, 'Primarni ključ', key)
    for (const direction of ['asc', 'desc']) {
      await select(page, 'Primarna smer', direction)
      await expectIds(page, ['only'])
    }
  }
  for (const key of ['none', 'title', 'assignee', 'status', 'dueDate']) {
    await select(page, 'Sekundarni ključ', key)
    for (const direction of ['asc', 'desc']) {
      await select(page, 'Sekundarna smer', direction)
      await expectIds(page, ['only'])
    }
  }
  await readonly(page, writes)
})

test('P04: reset restores all defaults and sorting never makes API writes', async ({ page }) => {
  const writes = await mount(page)
  await select(page, 'Primarni ključ', 'assignee')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await select(page, 'Primarni ključ', 'original')
  await expectIds(page, webIds())
  await page.getByRole('button', { name: 'Izvorni vrstni red', exact: true }).click()
  await expectIds(page, webIds())
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('original')
  await expect(page.getByRole('combobox', { name: 'Primarna smer' })).toHaveValue('asc')
  await expect(page.getByRole('combobox', { name: 'Sekundarni ključ' })).toHaveValue('none')
  await expect(page.getByRole('combobox', { name: 'Sekundarna smer' })).toHaveValue('asc')
  await readonly(page, writes)
})

test('P04: sorting controls keep the Folio page within a 390px viewport', async ({ page }) => {
  await mount(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await select(page, 'Primarni ključ', 'dueDate')
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await board(page)
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
