import { board, click, columnIds, details, examples, expect, expectHistory, expectIds, ids, mount, project, rank, readonly, table, test, webIds } from './helpers.ts'

const initial = webIds()

test('R01: initial global order, ranks and duplicate titles stay distinct', async ({ page }) => {
  const writes = await mount(page)
  await expectIds(page, initial)
  for (const [index, id] of initial.entries()) await expect(rank(page, id)).toHaveText(String(index + 1))
  await expect(page.locator('[data-task-id="web-02"] a').getByText('Pregled vsebine')).toBeVisible()
  await expect(page.locator('[data-task-id="web-03"] a').getByText('Pregled vsebine')).toBeVisible()
  await readonly(page, writes)
})

test('R02 and R03: valid moves swap global neighbours and boundary moves stay disabled', async ({ page }) => {
  const writes = await mount(page)
  await expect(page.getByRole('button', { name: 'Premakni web-01 gor', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Premakni web-08 dol', exact: true })).toBeDisabled()
  await click(page, 'Premakni web-02 gor')
  await expectIds(page, ['web-02', 'web-01', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
  await expect(page.locator('[data-task-id="web-01"] .status-badge')).toHaveText(/Pripravljeno/)
  await expect(page.locator('[data-task-id="web-02"] .status-badge')).toHaveText(/V delu/)
  await click(page, 'Premakni web-02 dol')
  await expectIds(page, initial)
  await readonly(page, writes)
})

test('R04 and R05: repeated undo and redo preserve both stacks', async ({ page }) => {
  await mount(page)
  await click(page, 'Premakni web-04 gor')
  await click(page, 'Premakni web-05 gor')
  await expectHistory(page, 2, 0)
  await expectIds(page, ['web-01', 'web-02', 'web-04', 'web-05', 'web-03', 'web-06', 'web-07', 'web-08'])
  await click(page, 'Razveljavi premik')
  await expectIds(page, ['web-01', 'web-02', 'web-04', 'web-03', 'web-05', 'web-06', 'web-07', 'web-08'])
  await click(page, 'Razveljavi premik')
  await expectIds(page, initial)
  await expectHistory(page, 0, 2)
  await expect(page.getByRole('button', { name: 'Razveljavi premik', exact: true })).toBeDisabled()
  await click(page, 'Ponovi premik')
  await expectIds(page, ['web-01', 'web-02', 'web-04', 'web-03', 'web-05', 'web-06', 'web-07', 'web-08'])
  await click(page, 'Ponovi premik')
  await expectIds(page, ['web-01', 'web-02', 'web-04', 'web-05', 'web-03', 'web-06', 'web-07', 'web-08'])
  await expectHistory(page, 2, 0)
})

test('R06: a new valid move clears redo and an invalid edge leaves redo intact', async ({ page }) => {
  await mount(page)
  await click(page, 'Premakni web-02 gor')
  await click(page, 'Razveljavi premik')
  await expect(page.getByRole('button', { name: 'Premakni web-01 gor', exact: true })).toBeDisabled()
  await expectHistory(page, 0, 1)
  await click(page, 'Premakni web-04 gor')
  await expectHistory(page, 1, 0)
  await expect(page.getByRole('button', { name: 'Ponovi premik', exact: true })).toBeDisabled()
})

test('R07: undo history is capped at twenty and redo works for all undone moves', async ({ page }) => {
  await mount(page)
  for (let index = 0; index < 21; index += 1) {
    await click(page, index % 2 === 0 ? 'Premakni web-04 gor' : 'Premakni web-04 dol')
  }

  const swapped = ['web-01', 'web-02', 'web-04', 'web-03', 'web-05', 'web-06', 'web-07', 'web-08']
  await expectIds(page, swapped)
  await expectHistory(page, 20, 0)

  for (let index = 0; index < 20; index += 1) await click(page, 'Razveljavi premik')
  await expectIds(page, swapped)
  await expectHistory(page, 0, 20)
  expect(await ids(page)).toEqual([...new Set(await ids(page))])

  for (let index = 0; index < 20; index += 1) await click(page, 'Ponovi premik')
  await expectIds(page, swapped)
  await expectHistory(page, 20, 0)
})

test('R08: reset is one undoable action and is disabled at the initial order', async ({ page }) => {
  await mount(page)
  await click(page, 'Premakni web-02 gor')
  await click(page, 'Začetni vrstni red')
  await expectIds(page, initial)
  await expectHistory(page, 2, 0)
  await expect(page.getByRole('button', { name: 'Ponovi premik', exact: true })).toBeDisabled()
  await click(page, 'Razveljavi premik')
  await expectIds(page, ['web-02', 'web-01', ...initial.slice(2)])
  await click(page, 'Začetni vrstni red')
  await expectIds(page, initial)
  await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
  await expectHistory(page, 2, 0)
})

test('R09 and R12: board shows relative order but moves use the global neighbour without writes', async ({ page }) => {
  const writes = await mount(page)
  await board(page)
  await columnIds(page, 'todo', ['web-01', 'web-05', 'web-07', 'web-08'])
  await columnIds(page, 'in_progress', ['web-02', 'web-04'])
  await columnIds(page, 'done', ['web-03', 'web-06'])
  await click(page, 'Premakni web-02 gor')
  await expect(rank(page, 'web-02')).toHaveText('1')
  await columnIds(page, 'in_progress', ['web-02', 'web-04'])
  await click(page, 'Premakni web-02 dol')
  await expect(rank(page, 'web-02')).toHaveText('2')
  await columnIds(page, 'in_progress', ['web-02', 'web-04'])
  await table(page)
  await expect(page.locator('[data-task-id="web-02"] .status-badge')).toHaveText(/V delu/)
  await expect(page.locator('[aria-label="Pregled stanj opravil"] strong')).toHaveText(['4', '2', '2'])
  await page.setViewportSize({ width: 390, height: 844 })
  await readonly(page, writes)
})

test('R10: view switch and details preserve state while project change and reload reset it', async ({ page }) => {
  await mount(page)
  await click(page, 'Premakni web-02 gor')
  const moved = ['web-02', 'web-01', ...initial.slice(2)]
  await board(page)
  await expect(rank(page, 'web-02')).toHaveText('1')
  await details(page, 'web-03')
  await expect(rank(page, 'web-02')).toHaveText('1')
  await table(page)
  await expectIds(page, moved)
  await expectHistory(page, 1, 0)

  await project(page, 'launch')
  await expectIds(page, ['launch-01', 'launch-02'])
  await expectHistory(page, 0, 0)
  await project(page, 'web')
  await expectIds(page, initial)
  await expectHistory(page, 0, 0)

  await page.reload()
  await expectIds(page, initial)
  await expectHistory(page, 0, 0)
})

test('R11: empty project stays usable without moves', async ({ page }) => {
  await mount(page, [], '#/projects/web')
  await expect(page.getByText('V tem projektu še ni opravil')).toBeVisible()
  await expectHistory(page, 0, 0)
  await expect(page.getByRole('button', { name: 'Razveljavi premik', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Ponovi premik', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
})

test('R11 and R12: one-task project stays usable with both moves disabled', async ({ page }) => {
  const records = examples.filter(({ id }) => id === 'web-01')
  const writes = await mount(page, records)
  await expectIds(page, ['web-01'])
  await expectHistory(page, 0, 0)
  await expect(page.getByRole('button', { name: 'Premakni web-01 gor', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Premakni web-01 dol', exact: true })).toBeDisabled()
  await readonly(page, writes)
})
