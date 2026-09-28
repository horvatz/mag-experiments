import { test, expect, mount, click, expectIds, makeTask } from '../development/helpers.ts'

test('history is capped at 20 and reset is one undoable action', async ({ page }) => {
  test.setTimeout(60000)
  await mount(page)
  for (let step = 0; step < 10; step += 1) {
    await click(page, 'Premakni web-01 dol')
    await click(page, 'Premakni web-01 gor')
  }
  await click(page, 'Premakni web-01 dol')
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 20. Ponovitve: 0.')
  await expectIds(page, ['web-02','web-01','web-03','web-04','web-05','web-06','web-07','web-08'])
  for (let step = 0; step < 20; step += 1) await click(page, 'Razveljavi premik')
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 20.')
  for (let step = 0; step < 20; step += 1) await click(page, 'Ponovi premik')
  await expectIds(page, ['web-02','web-01','web-03','web-04','web-05','web-06','web-07','web-08'])

  await click(page, 'Začetni vrstni red')
  await expectIds(page, ['web-01','web-02','web-03','web-04','web-05','web-06','web-07','web-08'])
  await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
  await click(page, 'Razveljavi premik')
  await expect(page.getByLabel('Mesto opravila web-02', { exact: true })).toHaveText('1')
})

test('empty project keeps ordering controls safe', async ({ page }) => {
  await mount(page, [])
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 0.')
  await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
})

test('one task project has a rank and no valid movement', async ({ page }) => {
  await mount(page, [makeTask('solo-id')])
  await expect(page.getByLabel('Mesto opravila solo-id', { exact: true })).toHaveText('1')
  await expect(page.getByRole('button', { name: 'Premakni solo-id gor', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Premakni solo-id dol', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Razveljavi premik', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Ponovi premik', exact: true })).toBeDisabled()
})

test('board keeps arbitrary IDs, duplicate titles and task statuses while reordering globally', async ({ page }) => {
  const records = [
    makeTask('id / α', { title: 'Enak naslov', status: 'in_progress' }),
    makeTask('id:β', { title: 'Enak naslov', status: 'todo' }),
    makeTask('id.γ', { title: 'Tretje', status: 'done' }),
  ]
  await mount(page, records)
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  await expect(page.getByLabel('Mesto opravila id / α', { exact: true })).toHaveText('1')
  await click(page, 'Premakni id:β gor')
  await expect(page.getByLabel('Mesto opravila id:β', { exact: true })).toHaveText('1')
  await expect(page.getByRole('region', { name: 'Tabla opravil' }).locator('[data-task-id="id:β"]')).toHaveCount(1)
  await expect(page.getByRole('region', { name: 'Tabla opravil' }).locator('[data-task-id="id / α"]')).toHaveCount(1)
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 1. Ponovitve: 0.')
  await click(page, 'Razveljavi premik')
  await expect(page.getByLabel('Mesto opravila id / α', { exact: true })).toHaveText('1')
})
