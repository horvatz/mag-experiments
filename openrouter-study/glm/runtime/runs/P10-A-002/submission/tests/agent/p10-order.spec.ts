import { expect, test, mount, makeTask, webIds, board, table, project, details, readonly, columnIds, expectIds } from '../development/helpers.ts'

test('A01: initial order, ranks and readonly moves', async ({ page }) => {
  const writes = await mount(page)
  await expectIds(page, webIds())
  await expect(page.getByLabel('Mesto opravila web-01', { exact: true })).toHaveText('1')
  await expect(page.getByLabel('Mesto opravila web-08', { exact: true })).toHaveText('8')
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 0.')
  await expect(page.getByRole('button', { name: 'Razveljavi premik' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Ponovi premik' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Začetni vrstni red' })).toBeDisabled()
  await page.getByRole('button', { name: 'Premakni web-01 gor', exact: true }).click({ force: true })
  await page.getByRole('button', { name: 'Premakni web-08 dol', exact: true }).click({ force: true })
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 0.')
  await page.getByRole('button', { name: 'Premakni web-02 gor', exact: true }).click()
  await expectIds(page, ['web-02', 'web-01', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
  await expect(page.getByLabel('Mesto opravila web-02', { exact: true })).toHaveText('1')
  await readonly(page, writes)
})

test('A02: repeated undo and redo sequences', async ({ page }) => {
  await mount(page)
  await page.getByRole('button', { name: 'Premakni web-02 gor', exact: true }).click()
  await page.getByRole('button', { name: 'Premakni web-03 gor', exact: true }).click()
  await expectIds(page, ['web-02', 'web-03', 'web-01', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
  await page.getByRole('button', { name: 'Razveljavi premik', exact: true }).click()
  await expectIds(page, ['web-02', 'web-01', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
  await page.getByRole('button', { name: 'Razveljavi premik', exact: true }).click()
  await expectIds(page, webIds())
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 2.')
  await page.getByRole('button', { name: 'Ponovi premik', exact: true }).click()
  await page.getByRole('button', { name: 'Ponovi premik', exact: true }).click()
  await expectIds(page, ['web-02', 'web-03', 'web-01', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 2. Ponovitve: 0.')
})

test('A03: new move clears redo and boundary keeps history', async ({ page }) => {
  await mount(page)
  await page.getByRole('button', { name: 'Premakni web-02 gor', exact: true }).click()
  await page.getByRole('button', { name: 'Razveljavi premik', exact: true }).click()
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 1.')
  await page.getByRole('button', { name: 'Premakni web-01 gor', exact: true }).click({ force: true })
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 1.')
  await page.getByRole('button', { name: 'Premakni web-03 gor', exact: true }).click()
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 1. Ponovitve: 0.')
  await expect(page.getByRole('button', { name: 'Ponovi premik', exact: true })).toBeDisabled()
})

test('A04: reset is one undoable action', async ({ page }) => {
  await mount(page)
  await page.getByRole('button', { name: 'Premakni web-02 gor', exact: true }).click()
  await page.getByRole('button', { name: 'Začetni vrstni red', exact: true }).click()
  await expectIds(page, webIds())
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 2. Ponovitve: 0.')
  await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
  await page.getByRole('button', { name: 'Razveljavi premik', exact: true }).click()
  await expectIds(page, ['web-02', 'web-01', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
})

test('A05: board, view switch and details preserve order', async ({ page }) => {
  const writes = await mount(page)
  await page.getByRole('button', { name: 'Premakni web-02 gor', exact: true }).click()
  await board(page)
  await expect(page.getByLabel('Mesto opravila web-02', { exact: true })).toHaveText('1')
  await columnIds(page, 'Pripravljeno', ['web-02', 'web-04', 'web-07', 'web-08'])
  await columnIds(page, 'V delu', ['web-01', 'web-05'])
  await columnIds(page, 'Končano', ['web-03', 'web-06'])
  await expect(page.getByLabel('Pregled stanj opravil').locator('strong')).toHaveText(['4', '2', '2'])
  await page.getByRole('button', { name: 'Premakni web-05 gor', exact: true }).click()
  await expect(page.getByLabel('Mesto opravila web-05', { exact: true })).toHaveText('4')
  await columnIds(page, 'V delu', ['web-01', 'web-05'])
  await table(page)
  await expectIds(page, ['web-02', 'web-01', 'web-03', 'web-05', 'web-04', 'web-06', 'web-07', 'web-08'])
  await details(page, 'web-05')
  await expectIds(page, ['web-02', 'web-01', 'web-03', 'web-05', 'web-04', 'web-06', 'web-07', 'web-08'])
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 2. Ponovitve: 0.')
  await readonly(page, writes)
})

test('A06: project switch resets local order', async ({ page }) => {
  await mount(page)
  await page.getByRole('button', { name: 'Premakni web-02 gor', exact: true }).click()
  await project(page, 'launch')
  await expectIds(page, ['launch-01', 'launch-02'])
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 0.')
  await project(page, 'web')
  await expectIds(page, webIds())
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 0.')
})

test('A07: browser refresh resets local order', async ({ page }) => {
  await mount(page)
  await page.getByRole('button', { name: 'Premakni web-02 gor', exact: true }).click()
  await page.reload()
  await expectIds(page, webIds())
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 0.')
})

test('A08: empty and single-task projects remain usable', async ({ page }) => {
  await mount(page, [])
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 0.')
  await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()

  await mount(page, [makeTask('samo-01')])
  await page.reload()
  await expectIds(page, ['samo-01'])
  await expect(page.getByRole('button', { name: 'Premakni samo-01 gor', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Premakni samo-01 dol', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Razveljavi premik', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Ponovi premik', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
})

test('A09: undo history keeps at most twenty moves', async ({ page }) => {
  await mount(page)
  for (let index = 0; index < 21; index += 1) {
    const direction = index % 2 === 0 ? 'dol' : 'gor'
    await page.getByRole('button', { name: `Premakni web-07 ${direction}`, exact: true }).click()
  }
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 20. Ponovitve: 0.')
  for (let index = 0; index < 20; index += 1) {
    await page.getByRole('button', { name: 'Razveljavi premik', exact: true }).click()
  }
  await expectIds(page, ['web-01', 'web-02', 'web-03', 'web-04', 'web-05', 'web-06', 'web-08', 'web-07'])
  await expect(page.getByRole('button', { name: 'Razveljavi premik', exact: true })).toBeDisabled()
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 20.')
})
