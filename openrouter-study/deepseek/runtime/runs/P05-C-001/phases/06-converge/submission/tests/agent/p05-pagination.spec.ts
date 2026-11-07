import { test, expect, mount, expectIds, select, click, board, table, summary, columnIds, readonly, details, project, makeTask, webIds, ids, type Task } from '../development/helpers.ts'

const seven: Task[] = Array.from({ length: 7 }, (_, index) => makeTask('w-' + String(index + 1).padStart(2, '0')))
const fourDone: Task[] = ['d-1', 'd-2', 'd-3', 'd-4'].map((id) => makeTask(id, { status: 'done' }))

test('R01/R09: privzeto stanje all/all z izvornim vrstnim redom', async ({ page }) => {
  const writes = await mount(page)
  await expect(page.getByRole('combobox', { name: 'Velikost strani', exact: true })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter strani', exact: true })).toHaveValue('all')
  await expectIds(page, webIds())
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 1. Prikazano 1–8 od 8.')
  await expect(page.locator('.count-badge')).toHaveText('8')
  await readonly(page, writes)
})

test('R02: velikosti 2/5/10 razdelijo polje brez izgub ali podvajanj', async ({ page }) => {
  await mount(page, seven)
  for (const size of ['2', '5', '10']) {
    await select(page, 'Velikost strani', size)
    const seen: string[] = []
    for (;;) {
      const current = await ids(page)
      expect(current.length).toBeLessThanOrEqual(Number(size))
      seen.push(...current.filter((value): value is string => value !== null))
      const status = (await page.getByRole('status', { name: 'Stanje straničenja' }).textContent()) ?? ''
      const match = /Stran (\d+) od (\d+)/.exec(status)
      expect(match).not.toBeNull()
      if (!match || Number(match[1]) >= Number(match[2])) break
      await click(page, 'Naslednja stran')
    }
    expect(seen).toEqual(seven.map((task) => task.id))
    expect(new Set(seen).size).toBe(seven.length)
  }
})

test('R03: na robovih so neveljavna dejanja onemogočena', async ({ page }) => {
  await mount(page, seven)
  await select(page, 'Velikost strani', '2')
  const first = page.getByRole('button', { name: 'Prva stran', exact: true })
  const previous = page.getByRole('button', { name: 'Prejšnja stran', exact: true })
  const next = page.getByRole('button', { name: 'Naslednja stran', exact: true })
  const last = page.getByRole('button', { name: 'Zadnja stran', exact: true })
  await expect(first).toBeDisabled()
  await expect(previous).toBeDisabled()
  await expect(next).toBeEnabled()
  await expectIds(page, ['w-01', 'w-02'])
  await next.click()
  await expectIds(page, ['w-03', 'w-04'])
  await expect(first).toBeEnabled()
  await expect(previous).toBeEnabled()
  await last.click()
  await expectIds(page, ['w-07'])
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 4 od 4. Prikazano 7–7 od 7.')
  await expect(next).toBeDisabled()
  await expect(last).toBeDisabled()
  await previous.click()
  await expectIds(page, ['w-05', 'w-06'])
})

test('R04: sprememba velikosti vedno vrne na prvo stran', async ({ page }) => {
  await mount(page, seven)
  await select(page, 'Velikost strani', '2')
  await click(page, 'Naslednja stran')
  await expectIds(page, ['w-03', 'w-04'])
  await select(page, 'Velikost strani', '5')
  await expectIds(page, ['w-01', 'w-02', 'w-03', 'w-04', 'w-05'])
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 2. Prikazano 1–5 od 7.')
  await click(page, 'Naslednja stran')
  await expectIds(page, ['w-06', 'w-07'])
  await select(page, 'Velikost strani', 'all')
  await expectIds(page, seven.map((task) => task.id))
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 1. Prikazano 1–7 od 7.')
})

test('R05: filter se uporabi pred straničenjem in vrne na prvo stran', async ({ page }) => {
  await mount(page)
  await select(page, 'Velikost strani', '2')
  await click(page, 'Naslednja stran')
  await select(page, 'Filter strani', 'todo')
  await expectIds(page, ['web-02', 'web-04'])
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 2. Prikazano 1–2 od 4.')
  await select(page, 'Filter strani', 'all')
  await expectIds(page, ['web-01', 'web-02'])
  await select(page, 'Filter strani', 'in_progress')
  await expectIds(page, ['web-01', 'web-05'])
  await select(page, 'Filter strani', 'done')
  await expectIds(page, ['web-03', 'web-06'])
})

test('R06: preglednica in tabla kažeta isti odsek trenutne strani', async ({ page }) => {
  await mount(page)
  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'todo')
  await click(page, 'Naslednja stran')
  await expectIds(page, ['web-07', 'web-08'])
  await board(page)
  await expectIds(page, ['web-07', 'web-08'])
  await columnIds(page, 'Tabla opravil', ['web-07', 'web-08'])
  await table(page)
  await expectIds(page, ['web-07', 'web-08'])
})

test('R07: preklop pogleda in podrobnosti ohranijo stanje', async ({ page }) => {
  await mount(page)
  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'todo')
  await click(page, 'Naslednja stran')
  await board(page)
  await details(page, 'web-07')
  await expect(page.getByRole('combobox', { name: 'Velikost strani', exact: true })).toHaveValue('2')
  await expect(page.getByRole('combobox', { name: 'Filter strani', exact: true })).toHaveValue('todo')
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 2 od 2. Prikazano 3–4 od 4.')
  await table(page)
  await expectIds(page, ['web-07', 'web-08'])
})

test('R08: menjava projekta ponastavi stanje brez trajne shrambe', async ({ page }) => {
  await mount(page)
  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'todo')
  await click(page, 'Naslednja stran')
  await project(page, 'launch')
  await expect(page.getByRole('combobox', { name: 'Velikost strani', exact: true })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter strani', exact: true })).toHaveValue('all')
  await expectIds(page, ['launch-01', 'launch-02'])
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 1. Prikazano 1–2 od 2.')
  const storage = await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length, hash: location.hash }))
  expect(storage.local).toBe(0)
  expect(storage.session).toBe(0)
  expect(storage.hash).not.toMatch(/page|size|filter/)
  await project(page, 'web')
  await expectIds(page, webIds())
})

test('R09: besedilo statusa za neprazen rezultat', async ({ page }) => {
  await mount(page)
  await select(page, 'Filter strani', 'done')
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toHaveText('Stran 1 od 1. Prikazano 1–2 od 2.')
})

test('R10: prazen rezultat filtra in vrnitev na prvo stran', async ({ page }) => {
  await mount(page, fourDone)
  const status = page.getByRole('status', { name: 'Stanje straničenja' })
  await select(page, 'Velikost strani', '2')
  await click(page, 'Naslednja stran')
  await expectIds(page, ['d-3', 'd-4'])
  await select(page, 'Filter strani', 'todo')
  await expect(status).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
  for (const name of ['Prva stran', 'Prejšnja stran', 'Naslednja stran', 'Zadnja stran']) {
    await expect(page.getByRole('button', { name, exact: true })).toBeDisabled()
  }
  await select(page, 'Filter strani', 'all')
  await expect(status).toHaveText('Stran 1 od 2. Prikazano 1–2 od 4.')
  await expectIds(page, ['d-1', 'd-2'])
})

test('R10: prazen projekt', async ({ page }) => {
  await mount(page, [])
  const status = page.getByRole('status', { name: 'Stanje straničenja' })
  await expect(status).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
  for (const name of ['Prva stran', 'Prejšnja stran', 'Naslednja stran', 'Zadnja stran']) {
    await expect(page.getByRole('button', { name, exact: true })).toBeDisabled()
  }
})

test('R11: povzetek in števci stolpcev', async ({ page }) => {
  await mount(page)
  await summary(page, [4, 2, 2])
  await expect(page.locator('.count-badge')).toHaveText('8')
  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'todo')
  await summary(page, [4, 2, 2])
  await expect(page.locator('.count-badge')).toHaveText('8')
  await board(page)
  await expect(page.locator('.board-todo .column-count')).toHaveText('2')
  await expect(page.locator('.board-in_progress .column-count')).toHaveText('0')
  await expect(page.locator('.board-done .column-count')).toHaveText('0')
  await click(page, 'Naslednja stran')
  await expect(page.locator('.board-todo [data-task-id]')).toHaveCount(2)
  await summary(page, [4, 2, 2])
  await expect(page.locator('.count-badge')).toHaveText('8')
})

test('R12: brez zapisov, povezave in mobilna širina', async ({ page }) => {
  const writes = await mount(page)
  await select(page, 'Velikost strani', '2')
  await click(page, 'Naslednja stran')
  await expect(page.locator('[data-task-id="web-03"] a.task-link')).toHaveAttribute('href', '#/projects/web/tasks/web-03')
  await expect(page.locator('[aria-label="Pregled stanj opravil"]')).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByRole('status', { name: 'Stanje straničenja' })).toBeVisible()
  await readonly(page, writes)
  await board(page)
  await readonly(page, writes)
})
