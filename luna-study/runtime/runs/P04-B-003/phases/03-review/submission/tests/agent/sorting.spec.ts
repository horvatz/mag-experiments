import { test, expect, makeTask, mount, select, ids, board, table, project } from '../development/helpers.ts'

const records = [
  makeTask('web-a', { title: 'Élan', assignee: 'Éva', status: 'todo', dueDate: '2026-09-30' }),
  makeTask('web-b', { title: 'e\u0301lan', assignee: 'Ana', status: 'done', dueDate: '2026-09-20' }),
  makeTask('web-c', { title: 'ELAN', assignee: 'Eva', status: 'in_progress', dueDate: '2026-09-25' }),
  makeTask('web-d', { title: 'Alfa 10', assignee: 'Z\u030civa', status: 'todo', dueDate: '2026-09-21' }),
  makeTask('web-e', { title: 'alfa 2', assignee: 'Ziva', status: 'todo', dueDate: '2026-09-22' }),
  makeTask('web-f', { title: 'Beta', assignee: 'Maja', status: 'done', dueDate: '2026-09-26' }),
  makeTask('launch-a', { projectId: 'launch', title: 'Drugo', status: 'done' }),
]

async function expectSettings(page: Parameters<typeof select>[0], values: [string, string, string, string]) {
  for (const [name, value] of [['Primarni ključ', values[0]], ['Primarna smer', values[1]], ['Sekundarni ključ', values[2]], ['Sekundarna smer', values[3]]] as const) {
    await expect(page.getByRole('combobox', { name, exact: true })).toHaveValue(value)
  }
}

test('text keys use normalized UTF-16 order and preserve stable ties in both directions', async ({ page }) => {
  await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await expect.poll(() => ids(page)).toEqual(['web-d', 'web-e', 'web-f', 'web-a', 'web-b', 'web-c'])

  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await expect.poll(() => ids(page)).toEqual(['web-d', 'web-e', 'web-f', 'web-a', 'web-b', 'web-c'])
  await select(page, 'Primarna smer', 'desc')
  await expect.poll(() => ids(page)).toEqual(['web-a', 'web-b', 'web-c', 'web-f', 'web-e', 'web-d'])

  await select(page, 'Primarni ključ', 'assignee')
  await select(page, 'Primarna smer', 'asc')
  await select(page, 'Sekundarni ključ', 'none')
  await expect.poll(() => ids(page)).toEqual(['web-b', 'web-a', 'web-c', 'web-f', 'web-d', 'web-e'])
})

test('settings survive view and details changes, then reset on project change and refresh', async ({ page }) => {
  await mount(page, records)
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'asc')
  await expectSettings(page, ['status', 'desc', 'dueDate', 'asc'])

  await board(page)
  await expectSettings(page, ['status', 'desc', 'dueDate', 'asc'])
  await page.locator('[data-task-id="web-b"] a').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expectSettings(page, ['status', 'desc', 'dueDate', 'asc'])

  await table(page)
  await expect.poll(() => ids(page)).toEqual(['web-b', 'web-f', 'web-c', 'web-d', 'web-e', 'web-a'])
  await project(page, 'launch')
  await expectSettings(page, ['original', 'asc', 'none', 'asc'])
  await expect.poll(() => ids(page)).toEqual(['launch-a'])

  await project(page, 'web')
  await select(page, 'Primarni ključ', 'dueDate')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await page.reload()
  await expectSettings(page, ['original', 'asc', 'none', 'asc'])
  await expect.poll(() => ids(page)).toEqual(['web-a', 'web-b', 'web-c', 'web-d', 'web-e', 'web-f'])
})

test('reset works with empty and single task projects', async ({ page }) => {
  await mount(page, [])
  await select(page, 'Primarni ključ', 'dueDate')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'assignee')
  await select(page, 'Sekundarna smer', 'desc')
  await expect.poll(() => ids(page)).toEqual([])
  await page.getByRole('button', { name: 'Izvorni vrstni red', exact: true }).click()
  await expectSettings(page, ['original', 'asc', 'none', 'asc'])
})

test('all sort choices safely handle one task and reset', async ({ page }) => {
  await mount(page, [makeTask('web-only')])
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await expect.poll(() => ids(page)).toEqual(['web-only'])
  await page.getByRole('button', { name: 'Izvorni vrstni red', exact: true }).click()
  await expectSettings(page, ['original', 'asc', 'none', 'asc'])
  await expect.poll(() => ids(page)).toEqual(['web-only'])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
