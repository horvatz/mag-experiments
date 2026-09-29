import { expect, test } from '@playwright/test'
import { ids, mount, select, task } from './p04-support.ts'

const records = [
  task('a', { title: 'Éclair', status: 'todo', assignee: 'Živa', dueDate: '2026-09-20' }),
  task('b', { title: 'Éclair', status: 'done', assignee: 'Ana', dueDate: '2026-09-10' }),
  task('e', { title: 'eclair', status: 'todo', assignee: 'Živa', dueDate: '2026-09-11' }),
  task('c', { title: 'Item 10', status: 'in_progress', assignee: 'Luka', dueDate: '2026-09-15' }),
  task('d', { title: 'Item 2', status: 'todo', assignee: 'Ana', dueDate: '2026-09-12' }),
  task('launch-a', { projectId: 'launch', title: 'Drugo opravilo' }),
]

test('P04 sorting uses specified key order, independent directions, and stable ties', async ({ page }) => {
  const writes = await mount(page, records)
  await expect(ids(page)).resolves.toEqual(['a', 'b', 'e', 'c', 'd'])
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('original')
  await expect(page.getByRole('combobox', { name: 'Primarna smer' })).toHaveValue('asc')
  await expect(page.getByRole('combobox', { name: 'Sekundarni ključ' })).toHaveValue('none')
  await expect(page.getByRole('combobox', { name: 'Sekundarna smer' })).toHaveValue('asc')

  await select(page, 'Primarni ključ', 'title')
  await expect(ids(page)).resolves.toEqual(['a', 'b', 'e', 'c', 'd'])
  await select(page, 'Primarni ključ', 'assignee')
  await expect(ids(page)).resolves.toEqual(['b', 'd', 'c', 'a', 'e'])
  await select(page, 'Primarni ključ', 'status')
  await expect(ids(page)).resolves.toEqual(['a', 'e', 'd', 'c', 'b'])
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await expect(ids(page)).resolves.toEqual(['a', 'd', 'e', 'c', 'b'])
  await select(page, 'Sekundarni ključ', 'none')
  await select(page, 'Primarna smer', 'desc')
  await expect(ids(page)).resolves.toEqual(['b', 'c', 'a', 'e', 'd'])
  await select(page, 'Primarni ključ', 'dueDate')
  await select(page, 'Sekundarni ključ', 'none')
  await select(page, 'Primarna smer', 'asc')
  await expect(ids(page)).resolves.toEqual(['b', 'e', 'd', 'c', 'a'])

  await select(page, 'Primarni ključ', 'original')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'status')
  await select(page, 'Sekundarna smer', 'desc')
  await expect(ids(page)).resolves.toEqual(['a', 'b', 'e', 'c', 'd'])
  await page.getByRole('button', { name: 'Izvorni vrstni red' }).click()
  await expect(ids(page)).resolves.toEqual(['a', 'b', 'e', 'c', 'd'])
  expect(writes).toEqual([])
})

test('P04 keeps sort state through views and details, resets on project change and reload', async ({ page }) => {
  const writes = await mount(page, records)
  await select(page, 'Primarni ključ', 'status')
  await page.getByRole('button', { name: 'Tabla' }).click()
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('status')
  await expect(ids(page)).resolves.toEqual(['a', 'e', 'd', 'c', 'b'])
  await page.locator('[data-task-id="a"] a').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('status')
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja' }).click()
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('original')
  await expect(ids(page)).resolves.toEqual(['launch-a'])
  await select(page, 'Primarni ključ', 'title')
  await page.reload()
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('original')
  expect(writes).toEqual([])
})

test('P04 board retains sorted order within fixed columns and details use task ID', async ({ page }) => {
  const writes = await mount(page, records)
  await select(page, 'Primarni ključ', 'dueDate')
  await page.getByRole('button', { name: 'Tabla' }).click()
  const todo = page.getByRole('region', { name: 'Tabla opravil' }).locator('.board-todo [data-task-id]')
  await expect(todo.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-task-id')))).resolves.toEqual(['e', 'd', 'a'])
  await page.locator('[data-task-id="b"] a').click()
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Éclair' })).toBeVisible()
  await expect(page.getByRole('dialog').getByText('b', { exact: true }).first()).toBeVisible()
  await page.keyboard.press('Escape')
  expect(writes).toEqual([])
})

test('P04 supports empty and single-task projects without page overflow', async ({ page }) => {
  const writes = await mount(page, [])
  await page.setViewportSize({ width: 390, height: 844 })
  for (const [name, value] of [['Primarni ključ', 'dueDate'], ['Primarna smer', 'desc'], ['Sekundarni ključ', 'title'], ['Sekundarna smer', 'desc']]) {
    await select(page, name, value)
  }
  await expect(ids(page)).resolves.toEqual([])
  await expect(page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).resolves.toBe(true)
  expect(writes).toEqual([])

  const singlePage = await page.context().newPage()
  const singleWrites = await mount(singlePage, [task('only', { status: 'done' })])
  for (const key of ['original', 'title', 'assignee', 'status', 'dueDate']) {
    await select(singlePage, 'Primarni ključ', key)
    for (const direction of ['asc', 'desc']) {
      await select(singlePage, 'Primarna smer', direction)
      await expect(ids(singlePage)).resolves.toEqual(['only'])
    }
  }
  expect(singleWrites).toEqual([])
  await singlePage.close()
})
