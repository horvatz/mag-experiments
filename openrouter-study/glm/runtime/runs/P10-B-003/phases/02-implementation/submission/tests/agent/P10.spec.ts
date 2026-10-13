import { board, click, columnIds, details, expectIds, examples, makeTask, mount, project, readonly, test, webIds } from '../development/helpers.ts'
import { expect } from '../development/helpers.ts'

const forceClick = (testId: string, name: string) => (page: import('@playwright/test').Page) =>
  page.locator(`[data-task-id="${testId}"]`).getByRole('button', { name, exact: true }).evaluate((button) => {
    if (button instanceof HTMLButtonElement) button.click()
  })

test('R01–R03: initial order, unchanged task data, and boundaries', async ({ page }) => {
  const writes = await mount(page)
  const original = webIds()
  const records = structuredClone(examples)

  await expectIds(page, original)
  for (const [id, place] of original.map((id, index) => [id, String(index + 1)] as const)) {
    await expect(page.getByLabel(`Mesto opravila ${id}`, { exact: true })).toHaveText(place)
  }
  await expect(page.locator('[data-task-id="web-02"]').getByRole('link')).toHaveAttribute('href', '#/projects/web/tasks/web-02')
  await expect(page.locator('[data-task-id="web-03"]').getByRole('link')).toHaveAttribute('href', '#/projects/web/tasks/web-03')

  await click(page, 'Premakni web-02 gor')
  await expectIds(page, ['web-02', 'web-01', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
  await expect(page.getByLabel('Mesto opravila web-02', { exact: true })).toHaveText('1')
  await expect(page.getByLabel('Mesto opravila web-01', { exact: true })).toHaveText('2')
  await expect(page.locator('[data-task-id="web-02"] .status-badge')).toHaveText('Pripravljeno')
  await expect(page.locator('[data-task-id="web-02"]').getByText('Luka Kovač', { exact: true })).toBeVisible()

  await expect(page.getByRole('button', { name: 'Premakni web-02 gor', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Premakni web-08 dol', exact: true })).toBeDisabled()
  await forceClick('web-02', 'Premakni web-02 gor')(page)
  await forceClick('web-08', 'Premakni web-08 dol')(page)
  await expectIds(page, ['web-02', 'web-01', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 1. Ponovitve: 0.')
  await readonly(page, writes)
  expect(examples).toEqual(records)
})

test('R04–R08: undo, redo, new-move clearing, cap, and reset', async ({ page }) => {
  const writes = await mount(page)
  const original = webIds()

  await click(page, 'Premakni web-02 gor')
  await click(page, 'Premakni web-03 gor')
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 2. Ponovitve: 0.')

  await click(page, 'Razveljavi premik')
  await expectIds(page, ['web-02', 'web-01', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
  await click(page, 'Razveljavi premik')
  await expectIds(page, original)
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 2.')

  await click(page, 'Ponovi premik')
  await click(page, 'Ponovi premik')
  await expectIds(page, ['web-02', 'web-03', 'web-01', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
  await click(page, 'Razveljavi premik')
  await forceClick('web-02', 'Premakni web-02 gor')(page)
  await expect(page.getByRole('button', { name: 'Ponovi premik', exact: true })).toBeEnabled()
  await click(page, 'Premakni web-03 gor')
  await expect(page.getByRole('button', { name: 'Ponovi premik', exact: true })).toBeDisabled()

  await click(page, 'Začetni vrstni red')
  await expectIds(page, original)
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 3. Ponovitve: 0.')
  await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
  await page.getByRole('button', { name: 'Začetni vrstni red', exact: true }).evaluate((button) => {
    if (button instanceof HTMLButtonElement) button.click()
  })
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 3. Ponovitve: 0.')

  for (let move = 0; move < 21; move += 1) {
    await click(page, move % 2 === 0 ? 'Premakni web-02 gor' : 'Premakni web-02 dol')
  }
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 20. Ponovitve: 0.')
  for (let undo = 0; undo < 20; undo += 1) await click(page, 'Razveljavi premik')
  await expectIds(page, ['web-02', 'web-01', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 20.')
  for (let redo = 0; redo < 20; redo += 1) await click(page, 'Ponovi premik')
  await expectIds(page, ['web-02', 'web-01', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
  await readonly(page, writes)
})

test('R09–R10: board uses global neighbors and view or details preserve history', async ({ page }) => {
  const writes = await mount(page)
  await click(page, 'Premakni web-02 dol')
  await expectIds(page, ['web-01', 'web-03', 'web-02', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])

  await board(page)
  await columnIds(page, 'Pripravljeno', ['web-02', 'web-04', 'web-07', 'web-08'])
  await columnIds(page, 'V delu', ['web-01', 'web-05'])
  await columnIds(page, 'Končano', ['web-03', 'web-06'])
  await expect(page.getByLabel('Mesto opravila web-02', { exact: true })).toHaveText('3')
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 1. Ponovitve: 0.')

  await details(page, 'web-02')
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 1. Ponovitve: 0.')
  await project(page, 'launch')
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 0.')
  await project(page, 'web')
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 0.')
  await readonly(page, writes)
})

test('R11–R12: an empty project stays usable within viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page, [])
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 0.')
  await expect(page.getByRole('button', { name: 'Razveljavi premik', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Ponovi premik', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
  await readonly(page, writes)
})

test('R11–R12: a one-task project stays usable within viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page, [makeTask('web-01')])
  await expectIds(page, ['web-01'])
  await expect(page.getByRole('button', { name: 'Premakni web-01 gor', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Premakni web-01 dol', exact: true })).toBeDisabled()
  await forceClick('web-01', 'Premakni web-01 gor')(page)
  await forceClick('web-01', 'Premakni web-01 dol')(page)
  await expectIds(page, ['web-01'])
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 0.')
  await readonly(page, writes)
})
