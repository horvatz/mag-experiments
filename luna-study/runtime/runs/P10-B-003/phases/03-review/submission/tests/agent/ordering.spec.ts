import { test, expect, mount, click, makeTask } from '../development/helpers.ts'

test('undo history keeps the latest 20 permutations and all can be redone', async ({ page }) => {
  await mount(page)
  for (let index = 0; index < 10; index += 1) {
    await click(page, 'Premakni web-02 gor')
    await click(page, 'Premakni web-02 dol')
  }
  await click(page, 'Premakni web-02 gor')
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 20. Ponovitve: 0.')
  for (let index = 0; index < 20; index += 1) await click(page, 'Razveljavi premik')
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 20.')
  for (let index = 0; index < 20; index += 1) await click(page, 'Ponovi premik')
  await expect(page.getByLabel('Mesto opravila web-02', { exact: true })).toHaveText('1')
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 20. Ponovitve: 0.')
})

test('restoring the source order is one undoable move and clears redo', async ({ page }) => {
  await mount(page)
  await click(page, 'Premakni web-02 gor')
  await click(page, 'Začetni vrstni red')
  await expect(page.getByLabel('Mesto opravila web-02', { exact: true })).toHaveText('2')
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 2. Ponovitve: 0.')
  await click(page, 'Razveljavi premik')
  await expect(page.getByLabel('Mesto opravila web-02', { exact: true })).toHaveText('1')
  await click(page, 'Ponovi premik')
  await expect(page.getByLabel('Mesto opravila web-02', { exact: true })).toHaveText('2')
})

test('empty project retains usable history controls', async ({ page }) => {
  await mount(page, [])
  await expect(page.getByText('V tem projektu še ni opravil')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 0.')
})

test('single-task project has no permitted moves', async ({ page }) => {
  await mount(page, [makeTask('single-α')])
  await expect(page.getByLabel('Mesto opravila single-α', { exact: true })).toHaveText('1')
  await expect(page.getByRole('button', { name: 'Premakni single-α gor', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Premakni single-α dol', exact: true })).toBeDisabled()
})
