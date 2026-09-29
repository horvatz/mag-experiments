import { test, expect, mount, expectIds, webIds, click, board, table, details, makeTask } from '../development/helpers.ts'

test('undo keeps the latest twenty permutations', async ({ page }) => {
  await mount(page)

  for (let index = 0; index < 21; index += 1) {
    await click(page, index % 2 === 0 ? 'Premakni web-02 gor' : 'Premakni web-02 dol')
  }

  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 20. Ponovitve: 0.')
  const afterFirstMove = [...webIds()]
  const first = afterFirstMove[0]
  afterFirstMove[0] = afterFirstMove[1]
  afterFirstMove[1] = first
  for (let index = 0; index < 20; index += 1) await click(page, 'Razveljavi premik')
  await expectIds(page, afterFirstMove)
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 20.')
  for (let index = 0; index < 20; index += 1) await click(page, 'Ponovi premik')
  await expectIds(page, afterFirstMove)
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 20. Ponovitve: 0.')
})

test('view and task details keep the current order and its undo history', async ({ page }) => {
  await mount(page)
  await click(page, 'Premakni web-02 gor')
  await board(page)
  await expect(page.getByLabel('Mesto opravila web-02', { exact: true })).toHaveText('1')
  await details(page, 'web-03')
  await expect(page.getByLabel('Mesto opravila web-02', { exact: true })).toHaveText('1')
  await table(page)
  await expectIds(page, ['web-02', ...webIds().filter((id) => id !== 'web-02')])
  await click(page, 'Razveljavi premik')
  await expectIds(page, webIds())
})

test('first and last task boundaries are disabled', async ({ page }) => {
  await mount(page)
  await expect(page.getByRole('button', { name: 'Premakni web-01 gor', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Premakni web-08 dol', exact: true })).toBeDisabled()
})

test('single-task boundaries and reset are disabled', async ({ page }) => {
  await mount(page, [makeTask('solo')])
  await expect(page.getByRole('button', { name: 'Premakni solo gor', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Premakni solo dol', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
})
