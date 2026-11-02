import type { Page } from '@playwright/test'
import { board, click, columnIds, details, expect, expectIds, makeTask, mount, project, readonly, test, webIds } from '../development/helpers.ts'

const historyStatus = (page: Page) => page.getByRole('status', { name: 'Zgodovina vrstnega reda' })

test('keeps at most twenty undo steps and preserves every redo step', async ({ page }) => {
  const records = Array.from({ length: 22 }, (_, index) => makeTask(`task-${String(index + 1).padStart(2, '0')}`))
  const initial = webIds(records)
  const moved = [initial[1], initial[0], ...initial.slice(2)]
  await mount(page, records)

  for (let index = 0; index < 21; index += 1) {
    await click(page, index % 2 === 0 ? 'Premakni task-02 gor' : 'Premakni task-01 gor')
  }
  await expect(historyStatus(page)).toHaveText('Razveljavitve: 20. Ponovitve: 0.')
  await expectIds(page, moved)

  await click(page, 'Razveljavi premik')
  await expect(historyStatus(page)).toHaveText('Razveljavitve: 19. Ponovitve: 1.')
  await expectIds(page, initial)
  await page.getByRole('button', { name: 'Premakni task-01 gor', exact: true }).evaluate((node: HTMLButtonElement) => node.click())
  await expect(historyStatus(page)).toHaveText('Razveljavitve: 19. Ponovitve: 1.')
  await expectIds(page, initial)

  await click(page, 'Ponovi premik')
  await expect(historyStatus(page)).toHaveText('Razveljavitve: 20. Ponovitve: 0.')
  await expectIds(page, moved)
  for (let index = 0; index < 20; index += 1) {
    await click(page, 'Razveljavi premik')
  }
  await expect(historyStatus(page)).toHaveText('Razveljavitve: 0. Ponovitve: 20.')
  await expectIds(page, moved)
  for (let index = 0; index < 20; index += 1) {
    await click(page, 'Ponovi premik')
  }
  await expect(historyStatus(page)).toHaveText('Razveljavitve: 20. Ponovitve: 0.')
  await expectIds(page, moved)
})

test('reset, details, views and project changes follow the specified histories', async ({ page }) => {
  const records = [
    makeTask('web-01', { title: 'Prvi', status: 'in_progress' }),
    makeTask('web-02', { title: 'Drugi' }),
    makeTask('web-03', { title: 'Tretji', status: 'done' }),
    makeTask('launch-01', { projectId: 'launch', title: 'Drugi projekt' }),
  ]
  const initial = ['web-01', 'web-02', 'web-03']
  const writes = await mount(page, records)

  await click(page, 'Premakni web-02 gor')
  await click(page, 'Začetni vrstni red')
  await expectIds(page, initial)
  await expect(historyStatus(page)).toHaveText('Razveljavitve: 2. Ponovitve: 0.')
  await click(page, 'Razveljavi premik')
  await expectIds(page, ['web-02', 'web-01', 'web-03'])
  await expect(historyStatus(page)).toHaveText('Razveljavitve: 1. Ponovitve: 1.')

  await details(page, 'web-02')
  await expect(historyStatus(page)).toHaveText('Razveljavitve: 1. Ponovitve: 1.')
  await board(page)
  await expect(historyStatus(page)).toHaveText('Razveljavitve: 1. Ponovitve: 1.')
  await click(page, 'Preglednica')
  await expectIds(page, ['web-02', 'web-01', 'web-03'])
  await expect(historyStatus(page)).toHaveText('Razveljavitve: 1. Ponovitve: 1.')

  await project(page, 'launch')
  await expectIds(page, ['launch-01'])
  await expect(historyStatus(page)).toHaveText('Razveljavitve: 0. Ponovitve: 0.')
  await project(page, 'web')
  await expectIds(page, initial)
  await expect(historyStatus(page)).toHaveText('Razveljavitve: 0. Ponovitve: 0.')
  await page.reload()
  await expectIds(page, initial)
  await expect(historyStatus(page)).toHaveText('Razveljavitve: 0. Ponovitve: 0.')
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
  await readonly(page, writes)
})

test('board moves use the global neighbor while statuses stay fixed', async ({ page }) => {
  const writes = await mount(page)
  await click(page, 'Premakni web-02 gor')
  await board(page)

  await expect(page.getByLabel('Mesto opravila web-02', { exact: true })).toHaveText('1')
  await expect(page.getByLabel('Mesto opravila web-01', { exact: true })).toHaveText('2')
  await expect(page.getByLabel('Mesto opravila web-03', { exact: true })).toHaveText('3')
  await columnIds(page, 'Pripravljeno', ['web-02', 'web-04', 'web-07', 'web-08'])
  await columnIds(page, 'V delu', ['web-01', 'web-05'])
  await columnIds(page, 'Končano', ['web-03', 'web-06'])

  await click(page, 'Premakni web-03 gor')
  for (const [index, id] of ['web-02', 'web-03', 'web-01', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'].entries()) {
    await expect(page.getByLabel(`Mesto opravila ${id}`, { exact: true })).toHaveText(String(index + 1))
  }
  await expect(page.getByLabel('Mesto opravila web-03', { exact: true })).toHaveText('2')
  await columnIds(page, 'Pripravljeno', ['web-02', 'web-04', 'web-07', 'web-08'])
  await columnIds(page, 'V delu', ['web-01', 'web-05'])
  await columnIds(page, 'Končano', ['web-03', 'web-06'])
  await readonly(page, writes)
})

test('empty and single-task projects remain usable without valid moves', async ({ page }) => {
  const records = [makeTask('launch-01', { projectId: 'launch', title: 'Edino opravilo' })]
  const writes = await mount(page, records, '#/projects/web')
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
  await expect(historyStatus(page)).toHaveText('Razveljavitve: 0. Ponovitve: 0.')
  await expect(page.getByRole('button', { name: 'Razveljavi premik', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Ponovi premik', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()

  await project(page, 'launch')
  await expect(page.getByRole('button', { name: 'Premakni launch-01 gor', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Premakni launch-01 dol', exact: true })).toBeDisabled()
  await board(page)
  await expect(page.getByRole('region', { name: 'Pripravljeno', exact: true }).locator('[data-task-id="launch-01"]')).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
  await readonly(page, writes)
})
