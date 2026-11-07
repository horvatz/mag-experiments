import { expect, test, mount, makeTask, expectIds, select, click, board, columnIds, details, readonly } from '../development/helpers.ts'

test('A01: normalization, secondary direction and equal keys stay stable', async ({ page }) => {
  const records = [
    makeTask('u-03', { title: 'Če', description: 'Tretje', status: 'done', assignee: 'Žun', dueDate: '2026-10-03' }),
    makeTask('u-01', { title: 'ča', description: 'Prvo', status: 'todo', assignee: 'Ana Novak', dueDate: '2026-10-01' }),
    makeTask('u-02', { title: 'Ča', description: 'Drugo', status: 'in_progress', assignee: 'Bela', dueDate: '2026-10-02' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Sekundarni ključ', 'assignee')
  await select(page, 'Sekundarna smer', 'asc')
  await expectIds(page, ['u-01', 'u-02', 'u-03'])
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['u-02', 'u-01', 'u-03'])
  await select(page, 'Primarni ključ', 'assignee')
  await select(page, 'Primarna smer', 'asc')
  await select(page, 'Sekundarni ključ', 'assignee')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['u-01', 'u-02', 'u-03'])
  await click(page, 'Izvorni vrstni red')
  await expectIds(page, ['u-03', 'u-01', 'u-02'])
})

test('A02: project switch and view reset restore defaults', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'status')
  await select(page, 'Sekundarna smer', 'desc')
  await board(page)
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja', exact: true }).click()
  await expect(page.getByRole('combobox', { name: 'Primarni ključ', exact: true })).toHaveValue('original')
  await expect(page.getByRole('combobox', { name: 'Primarna smer', exact: true })).toHaveValue('asc')
  await expect(page.getByRole('combobox', { name: 'Sekundarni ključ', exact: true })).toHaveValue('none')
  await expect(page.getByRole('combobox', { name: 'Sekundarna smer', exact: true })).toHaveValue('asc')
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Spletna prenova', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Tabla', exact: true })).toHaveAttribute('aria-pressed', 'true')
})

test('A03: duplicate titles keep ID details and narrow layout is readable', async ({ page }) => {
  const writes = await mount(page, [
    makeTask('d-02', { title: 'Ista', description: 'Drugo', status: 'done', assignee: 'Bela', dueDate: '2026-10-02' }),
    makeTask('d-01', { title: 'Ista', description: 'Prvo', status: 'todo', assignee: 'Ana Novak', dueDate: '2026-10-01' }),
  ])
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['d-02', 'd-01'])
  await details(page, 'd-02')
  await details(page, 'd-01')
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator('#main-content')).toBeVisible()
  await readonly(page, writes)
})

test('A04: empty and one-task projects accept every control', async ({ page }) => {
  await mount(page, [])
  for (const primaryKey of ['original', 'title', 'assignee', 'status', 'dueDate']) {
    for (const direction of ['asc', 'desc']) {
      await select(page, 'Primarni ključ', primaryKey)
      await select(page, 'Primarna smer', direction)
      await select(page, 'Sekundarna smer', direction)
      await expectIds(page, [])
    }
  }

  await page.goto('/#/projects/launch')
  const records = [
    makeTask('one-01', { title: 'Edino', description: 'Edino opravilo', status: 'in_progress', assignee: 'Ana Novak', dueDate: '2026-10-01' }),
  ]
  await mount(page, records)
  for (const secondaryKey of ['none', 'title', 'assignee', 'status', 'dueDate']) {
    await select(page, 'Sekundarni ključ', secondaryKey)
    await expectIds(page, ['one-01'])
  }
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Primarna smer', 'desc')
  await board(page)
  await columnIds(page, 'V delu', ['one-01'])
})
