import { board, click, expect, expectIds, makeTask, mount, project, readonly, summary, table, type Task, test } from '../development/helpers.ts'
import { taskOrderReducer } from '../../src/taskOrder.ts'

test('neveljaven robni premik ne spremeni permutacije ali zgodovine ponovitev', () => {
  const ids = ['first', 'second']
  const initial = taskOrderReducer(null, { type: 'initialize', ids })
  const moved = taskOrderReducer(initial, { type: 'move', id: 'second', direction: 'up', initialIds: ids })
  const undone = taskOrderReducer(moved, { type: 'undo', initialIds: ids })
  expect(undone.redo).toHaveLength(1)
  expect(taskOrderReducer(undone, { type: 'move', id: 'first', direction: 'up', initialIds: ids })).toBe(undone)
  expect(taskOrderReducer(undone, { type: 'move', id: 'second', direction: 'down', initialIds: ids })).toBe(undone)
})

test('premiki, robovi, večkratni undo in redo ter zavržena veja', async ({ page }) => {
  const records = [makeTask('p-01'), makeTask('p-02'), makeTask('p-03'), makeTask('p-04')]
  await mount(page, records)
  await expectIds(page, records.map((task) => task.id))
  for (const task of records) await expect(page.getByLabel(`Mesto opravila ${task.id}`, { exact: true })).toHaveText(String(records.indexOf(task) + 1))
  await expect(page.getByRole('button', { name: 'Premakni p-01 gor', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Premakni p-04 dol', exact: true })).toBeDisabled()
  await click(page, 'Premakni p-02 gor')
  await expectIds(page, ['p-02', 'p-01', 'p-03', 'p-04'])
  await click(page, 'Premakni p-04 gor')
  await expectIds(page, ['p-02', 'p-01', 'p-04', 'p-03'])
  await click(page, 'Razveljavi premik')
  await click(page, 'Razveljavi premik')
  await expectIds(page, ['p-01', 'p-02', 'p-03', 'p-04'])
  await click(page, 'Ponovi premik')
  await click(page, 'Ponovi premik')
  await expectIds(page, ['p-02', 'p-01', 'p-04', 'p-03'])

  await click(page, 'Razveljavi premik')
  await expect(page.getByRole('button', { name: 'Premakni p-04 dol', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Ponovi premik', exact: true })).toBeEnabled()
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 1. Ponovitve: 1.')
  await click(page, 'Premakni p-04 gor')
  await expect(page.getByRole('button', { name: 'Ponovi premik', exact: true })).toBeDisabled()
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 2. Ponovitve: 0.')
})

test('začetni vrstni red je eno razveljavljivo dejanje', async ({ page }) => {
  const records = [makeTask('p-01'), makeTask('p-02'), makeTask('p-03')]
  const writes = await mount(page, records)
  await click(page, 'Premakni p-02 gor')
  await click(page, 'Začetni vrstni red')
  await expectIds(page, ['p-01', 'p-02', 'p-03'])
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 2. Ponovitve: 0.')
  await click(page, 'Razveljavi premik')
  await expectIds(page, ['p-02', 'p-01', 'p-03'])
  await click(page, 'Ponovi premik')
  await expectIds(page, ['p-01', 'p-02', 'p-03'])
  await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 2. Ponovitve: 0.')
  await readonly(page, writes)
})

test('zgodovina razveljavitev hrani največ zadnjih 20 permutacij', async ({ page }) => {
  const records = Array.from({ length: 22 }, (_, index) => makeTask(`p-${String(index + 1).padStart(2, '0')}`))
  await mount(page, records)
  for (let index = 0; index < 21; index += 1) await click(page, 'Premakni p-22 gor')
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 20. Ponovitve: 0.')
  for (let index = 0; index < 20; index += 1) await click(page, 'Razveljavi premik')
  await expect(page.getByLabel('Mesto opravila p-22', { exact: true })).toHaveText('21')
  await expectIds(page, records.map((task) => task.id), false)
  for (let index = 0; index < 20; index += 1) await click(page, 'Ponovi premik')
  await expect(page.getByLabel('Mesto opravila p-22', { exact: true })).toHaveText('1')
  await expectIds(page, records.map((task) => task.id), false)
})

test('tabla premika globalnega soseda, pogled in podrobnosti ohranita vrstni red', async ({ page }) => {
  const records = [
    makeTask('p-a', { status: 'todo', title: 'Enak naslov' }),
    makeTask('p-b', { status: 'done', title: 'Enak naslov' }),
    makeTask('p-c', { status: 'in_progress', title: 'Enak naslov' }),
    makeTask('p-d', { status: 'todo' }),
    makeTask('launch-x', { projectId: 'launch' }),
  ]
  const writes = await mount(page, records)
  await summary(page, [2, 1, 1])
  await board(page)
  await click(page, 'Premakni p-c gor')
  await expect(page.getByLabel('Mesto opravila p-c', { exact: true })).toHaveText('2')
  await expect(page.getByLabel('Mesto opravila p-b', { exact: true })).toHaveText('3')
  await summary(page, [2, 1, 1])
  await click(page, 'Premakni p-c dol')
  await expect(page.getByLabel('Mesto opravila p-c', { exact: true })).toHaveText('3')
  await click(page, 'Premakni p-a dol')
  await expect(page.getByLabel('Mesto opravila p-a', { exact: true })).toHaveText('2')
  await page.locator('[data-task-id="p-c"]').getByRole('link').click()
  await expect(page.getByRole('dialog').getByText('V delu', { exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByLabel('Mesto opravila p-c', { exact: true })).toHaveText('3')
  await table(page)
  await expectIds(page, ['p-b', 'p-a', 'p-c', 'p-d'])
  await project(page, 'launch')
  await project(page, 'web')
  await expectIds(page, ['p-a', 'p-b', 'p-c', 'p-d'])
  await click(page, 'Premakni p-b gor')
  await expectIds(page, ['p-b', 'p-a', 'p-c', 'p-d'])
  await page.reload()
  await expectIds(page, ['p-a', 'p-b', 'p-c', 'p-d'])
  await readonly(page, writes)
})

test('prazen projekt ostane uporaben', async ({ page }) => {
  await mount(page, [])
  await summary(page, [0, 0, 0])
  await expect(page.getByRole('button', { name: 'Razveljavi premik', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Ponovi premik', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
  await expect(page.locator('[data-task-id]')).toHaveCount(0)
})

test('enoopravilen projekt in ozek zaslon ostaneta uporabna', async ({ page }) => {
  const oneTask: Task[] = [makeTask('only-one')]
  const writes = await mount(page, oneTask)
  await expect(page.getByRole('button', { name: 'Premakni only-one gor', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Premakni only-one dol', exact: true })).toBeDisabled()
  await expect(page.getByLabel('Mesto opravila only-one', { exact: true })).toHaveText('1')
  await page.setViewportSize({ width: 390, height: 844 })
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await board(page)
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await readonly(page, writes)
})
