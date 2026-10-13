import { expect, makeTask, mount, test } from '../development/helpers.ts'

const initial = [
  makeTask('web-01', { title: 'Pregled vsebine', status: 'in_progress', assignee: 'Ana Novak' }),
  makeTask('web-02', { title: 'Pregled vsebine', assignee: 'Luka Kovač' }),
  makeTask('web-03', { status: 'done', assignee: 'Maja Zupan' }),
  makeTask('web-04', { assignee: 'Živa Kovač' }),
]

test('R01–R06: multiple moves keep complete undo and redo history', async ({ page }) => {
  await mount(page, initial)
  const history = page.getByRole('status', { name: 'Zgodovina vrstnega reda' })

  await page.getByRole('button', { name: 'Premakni web-02 gor', exact: true }).click()
  await expect(page.locator('[data-task-id]')).toHaveCount(4)
  await page.getByRole('button', { name: 'Premakni web-04 gor', exact: true }).click()
  await page.getByRole('button', { name: 'Premakni web-01 dol', exact: true }).click()
  await expect(history).toHaveText('Razveljavitve: 3. Ponovitve: 0.')

  await page.getByRole('button', { name: 'Razveljavi premik', exact: true }).click()
  await page.getByRole('button', { name: 'Razveljavi premik', exact: true }).click()
  await expect(history).toHaveText('Razveljavitve: 1. Ponovitve: 2.')
  const onceUndone = ['web-02', 'web-01', 'web-03', 'web-04']
  await expect.poll(async () => await page.locator('[data-task-id]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-task-id')))).toEqual(onceUndone)

  await page.getByRole('button', { name: 'Ponovi premik', exact: true }).click()
  await page.getByRole('button', { name: 'Ponovi premik', exact: true }).click()
  await expect(history).toHaveText('Razveljavitve: 3. Ponovitve: 0.')
  await expect.poll(async () => await page.locator('[data-task-id]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-task-id')))).toEqual(['web-02', 'web-04', 'web-01', 'web-03'])

  await page.getByRole('button', { name: 'Premakni web-02 dol', exact: true }).click()
  await expect(history).toHaveText('Razveljavitve: 4. Ponovitve: 0.')
  const finalIds = await page.locator('[data-task-id]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-task-id')))
  expect(finalIds).toEqual(['web-04', 'web-02', 'web-01', 'web-03'])
  expect(new Set(finalIds).size).toBe(initial.length)
})

test('R03, R06 and R07: boundary stays safe and undo keeps at most 20 steps', async ({ page }) => {
  await mount(page, initial)
  await expect(page.getByRole('button', { name: 'Premakni web-01 gor', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Premakni web-04 dol', exact: true })).toBeDisabled()
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 0.')

  for (let step = 0; step < 10; step += 1) {
    await page.getByRole('button', { name: 'Premakni web-02 gor', exact: true }).click()
    await page.getByRole('button', { name: 'Premakni web-02 dol', exact: true }).click()
  }
  await page.getByRole('button', { name: 'Premakni web-03 gor', exact: true }).click()
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 20. Ponovitve: 0.')

  await page.getByRole('button', { name: 'Razveljavi premik', exact: true }).click()
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 19. Ponovitve: 1.')
  await expect.poll(async () => await page.locator('[data-task-id]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-task-id')))).toEqual(initial.map(task => task.id))

  await page.getByRole('button', { name: 'Ponovi premik', exact: true }).click()
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 20. Ponovitve: 0.')
})

test('R08: reset is undoable and clears redo', async ({ page }) => {
  await mount(page, initial)
  await page.getByRole('button', { name: 'Premakni web-02 gor', exact: true }).click()
  await page.getByRole('button', { name: 'Razveljavi premik', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()

  await page.getByRole('button', { name: 'Ponovi premik', exact: true }).click()
  await page.getByRole('button', { name: 'Začetni vrstni red', exact: true }).click()
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 2. Ponovitve: 0.')
  await expect.poll(async () => await page.locator('[data-task-id]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-task-id')))).toEqual(initial.map(task => task.id))

  await page.getByRole('button', { name: 'Razveljavi premik', exact: true }).click()
  await expect.poll(async () => await page.locator('[data-task-id]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-task-id')))).toEqual(['web-02', 'web-01', 'web-03', 'web-04'])
})

test('R06: a disabled boundary move keeps redo history', async ({ page }) => {
  await mount(page, initial)
  await page.getByRole('button', { name: 'Premakni web-02 gor', exact: true }).click()
  await page.getByRole('button', { name: 'Razveljavi premik', exact: true }).click()
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 1.')
  await expect(page.getByRole('button', { name: 'Premakni web-01 gor', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Premakni web-04 dol', exact: true })).toBeDisabled()
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 1.')
})

test('R09 and R10: view switch, details and project change preserve or reset order', async ({ page }) => {
  const records = [...initial, makeTask('launch-01', { projectId: 'launch' })]
  await mount(page, records)
  await page.getByRole('button', { name: 'Premakni web-02 gor', exact: true }).click()

  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  await expect(page.getByLabel('Mesto opravila web-02', { exact: true })).toHaveText('1')
  await expect(page.locator('[data-task-id="web-02"]').getByRole('button', { name: 'Premakni web-02 dol', exact: true })).toBeVisible()
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 1. Ponovitve: 0.')

  await page.locator('[data-task-id="web-02"]').getByRole('link').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 1. Ponovitve: 0.')

  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja', exact: true }).click()
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 0.')
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Spletna prenova', exact: true }).click()
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 0.')
  await expect(page.getByLabel('Mesto opravila web-02', { exact: true })).toHaveText('2')
  await page.getByRole('button', { name: 'Preglednica', exact: true }).click()
  await expect.poll(async () => await page.locator('[data-task-id]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-task-id')))).toEqual(initial.map(task => task.id))

  await page.getByRole('button', { name: 'Premakni web-02 gor', exact: true }).click()
  await page.reload()
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 0.')
  await expect.poll(async () => await page.locator('[data-task-id]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-task-id')))).toEqual(initial.map(task => task.id))
})

test('R11: empty and one-task projects stay usable without moves', async ({ page }) => {
  await mount(page, [])
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil', exact: true })).toBeVisible()
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 0.')
  await expect(page.getByRole('button', { name: 'Razveljavi premik', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Ponovi premik', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()

  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Jesenska kampanja', exact: true })).toBeVisible()
})

test('R11 and R12: one task, unchanged fields and 390 px layout', async ({ page }) => {
  const single = [makeTask('web-01', { title: 'Edino opravilo', description: 'Opis ostane enak', status: 'in_progress', assignee: 'Ana Novak', dueDate: '2026-10-01' })]
  const writes = await mount(page, single)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByRole('button', { name: 'Premakni web-01 gor', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Premakni web-01 dol', exact: true })).toBeDisabled()
  await expect(page.locator('[data-task-id="web-01"]').getByText('V delu', { exact: true })).toBeVisible()
  await expect(page.locator('[aria-label="Pregled stanj opravil"] strong')).toHaveText(['0', '1', '0'])

  await page.locator('[data-task-id="web-01"]').getByRole('link').click()
  await expect(page.getByRole('dialog').getByText('Opis ostane enak')).toBeVisible()
  await page.keyboard.press('Escape')
  expect(writes).toEqual([])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
