import { test, expect, mount, examples, makeTask, expectIds, webIds, click, board, table, project, details, readonly } from '../development/helpers.ts'
import { createTaskOrderState, taskOrderReducer } from '../../src/taskOrder.ts'

test('P10: global places follow IDs and moves keep task data and counts', async ({ page }) => {
  const writes = await mount(page)
  const initial = webIds()
  for (const [index, id] of initial.entries()) {
    await expect(page.getByLabel(`Mesto opravila ${id}`, { exact: true })).toHaveText(String(index + 1))
  }
  await expect(page.getByRole('button', { name: 'Premakni web-01 gor', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Premakni web-08 dol', exact: true })).toBeDisabled()
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 0.')
  await click(page, 'Premakni web-02 gor')
  await expectIds(page, ['web-02', 'web-01', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
  await expect(page.locator('[data-task-id="web-02"] .task-link')).toContainText('Pregled vsebine')
  await expect(page.locator('[data-task-id="web-02"] time')).toHaveAttribute('datetime', '2026-09-22')
  await expect(page.locator('[aria-label="Pregled stanj opravil"] strong')).toHaveText(['4', '2', '2'])
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 1. Ponovitve: 0.')
  await readonly(page, writes)
})

test('P10: a rejected edge action preserves both undo and redo history', async () => {
  const initial = createTaskOrderState(['a', 'b'])
  const moved = taskOrderReducer(initial, { type: 'move', id: 'b', direction: 'up' })
  const undone = taskOrderReducer(moved, { type: 'undo' })
  expect(undone.redo).toHaveLength(1)
  expect(taskOrderReducer(undone, { type: 'move', id: 'a', direction: 'up' })).toBe(undone)
  expect(taskOrderReducer(undone, { type: 'reset' })).toBe(undone)
})

test('P10: multiple undo and redo, reset is one action, and a new branch clears redo', async ({ page }) => {
  await mount(page)
  await click(page, 'Premakni web-02 gor')
  await click(page, 'Premakni web-03 gor')
  await click(page, 'Razveljavi premik')
  await click(page, 'Razveljavi premik')
  await expectIds(page, webIds())
  await click(page, 'Ponovi premik')
  await expect(page.getByLabel('Mesto opravila web-02', { exact: true })).toHaveText('1')
  await click(page, 'Začetni vrstni red')
  await expectIds(page, webIds())
  await expect(page.getByRole('button', { name: 'Ponovi premik', exact: true })).toBeDisabled()
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 2. Ponovitve: 0.')
  await click(page, 'Razveljavi premik')
  await expect(page.getByLabel('Mesto opravila web-02', { exact: true })).toHaveText('1')
  await expect(page.getByRole('button', { name: 'Ponovi premik', exact: true })).toBeEnabled()
  await click(page, 'Začetni vrstni red')
  await click(page, 'Razveljavi premik')
  await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeEnabled()
  await click(page, 'Začetni vrstni red')
  await expectIds(page, webIds())
})

test('P10: undo history keeps only 20 states and all retained steps can be redone', async ({ page }) => {
  const twoTasks = [makeTask('a'), makeTask('b')]
  await mount(page, twoTasks)
  for (let moveIndex = 0; moveIndex < 21; moveIndex += 1) {
    await click(page, moveIndex % 2 === 0 ? 'Premakni b gor' : 'Premakni b dol')
  }
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 20. Ponovitve: 0.')
  for (let step = 0; step < 20; step += 1) await click(page, 'Razveljavi premik')
  await expectIds(page, ['b', 'a'])
  await expect(page.getByRole('button', { name: 'Razveljavi premik', exact: true })).toBeDisabled()
  for (let step = 0; step < 20; step += 1) await click(page, 'Ponovi premik')
  await expectIds(page, ['b', 'a'])
  await expect(page.getByRole('button', { name: 'Ponovi premik', exact: true })).toBeDisabled()
})

test('P10: board keeps status columns and global adjacency across columns', async ({ page }) => {
  await mount(page)
  await board(page)
  await click(page, 'Premakni web-02 gor')
  await expect(page.getByLabel('Mesto opravila web-02', { exact: true })).toHaveText('1')
  await click(page, 'Premakni web-01 dol')
  await expect(page.getByLabel('Mesto opravila web-03', { exact: true })).toHaveText('2')
  await expect(page.getByLabel('Mesto opravila web-01', { exact: true })).toHaveText('3')
  await expect(page.getByRole('region', { name: 'Pripravljeno' }).locator('[data-task-id]').first()).toHaveAttribute('data-task-id', 'web-02')
  await expect(page.getByRole('region', { name: 'Končano' }).locator('[data-task-id]').first()).toHaveAttribute('data-task-id', 'web-03')
  await table(page)
  await expectIds(page, ['web-02', 'web-03', 'web-01', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
})

test('P10: view, details, project navigation and refresh have the required lifetime', async ({ page }) => {
  await mount(page)
  await click(page, 'Premakni web-02 gor')
  await board(page)
  await expect(page.getByLabel('Mesto opravila web-02', { exact: true })).toHaveText('1')
  await details(page, 'web-02')
  await expect(page.getByLabel('Mesto opravila web-02', { exact: true })).toHaveText('1')
  await project(page, 'launch')
  await expect(page.getByLabel('Mesto opravila launch-01', { exact: true })).toHaveText('1')
  await project(page, 'web')
  await expect(page.getByLabel('Mesto opravila web-01', { exact: true })).toHaveText('1')
  await click(page, 'Premakni web-02 gor')
  await page.reload()
  await expect(page.getByLabel('Mesto opravila web-01', { exact: true })).toHaveText('1')
})

test('P10: empty project has no enabled history actions and board remains available', async ({ page }) => {
  await mount(page, [])
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 0.')
  await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
  await board(page)
  await expect(page.getByRole('region', { name: 'Tabla opravil' })).toBeVisible()
})

test('P10: single task has its global position and no enabled moves', async ({ page }) => {
  await mount(page, [makeTask('only')])
  await expect(page.getByLabel('Mesto opravila only', { exact: true })).toHaveText('1')
  await expect(page.getByRole('button', { name: 'Premakni only gor', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Premakni only dol', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Razveljavi premik', exact: true })).toBeDisabled()
})

test('P10: table actions stay inside the table scroll area at 390px', async ({ page }) => {
  await mount(page, examples)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByRole('button', { name: 'Premakni web-02 gor', exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy()
  expect(await page.locator('.table-scroll').evaluate((element) => element.scrollWidth > element.clientWidth)).toBeTruthy()
})
