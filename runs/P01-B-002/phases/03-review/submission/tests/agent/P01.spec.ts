import { expect, test, type APIRequestContext, type Page } from '@playwright/test'
import type { Task, TaskStatus } from '../../shared/types.ts'
import { normalizeTaskTitle } from '../../src/taskTitle.ts'

const labels = { todo: 'Pripravljeno', in_progress: 'V delu', done: 'Končano' }
const state = async (request: APIRequestContext): Promise<{ tasks: Task[]; pending: number; saveRequests: number }> =>
  (await request.get('/__test/state')).json()
const editor = (page: Page) => {
  const dialog = page.getByRole('dialog')
  return {
    dialog,
    title: dialog.getByRole('textbox', { name: 'Naslov', exact: true }),
    status: dialog.getByRole('combobox', { name: 'Stanje', exact: true }),
    save: dialog.getByRole('button', { name: 'Shrani', exact: true }),
    cancel: dialog.getByRole('button', { name: 'Prekliči', exact: true }),
    edit: dialog.getByRole('button', { name: 'Uredi', exact: true }),
  }
}

test.beforeEach(async ({ request }) => {
  expect((await request.post('/__test/reset')).ok()).toBeTruthy()
})

test('A01: normalizacija odstrani izključno štiri dogovorjene robne znake', () => {
  for (const [input, expected] of [
    ['', ''], [' \t\r\n', ''], [' \tŽanov  pregled\r\n', 'Žanov  pregled'],
    [' \tPrva\n\tdruga\r\n', 'Prva\n\tdruga'],
    ['\u00a0Naslov\u00a0', '\u00a0Naslov\u00a0'], ['\u00a0', '\u00a0'],
    [' \u2003Naslov\u2003 ', '\u2003Naslov\u2003'], ['\vNaslov\f', '\vNaslov\f'],
  ]) expect(normalizeTaskTitle(input)).toBe(expected)
})

for (const id of ['web-02', 'launch-01']) {
  test(`A02: zapis po id in izolacija vseh podatkov (${id})`, async ({ page, request }) => {
    const before = await state(request)
    const task = before.tasks.find((task) => task.id === id)!
    await page.goto(`/#/projects/${task.projectId}/tasks/${id}`)
    const ui = editor(page)
    await ui.edit.click()
    await expect(ui.title).toHaveValue(task.title)
    await expect(ui.status).toHaveValue(task.status)
    await ui.title.fill(' \tŽanov  pregled\t ')
    await ui.status.selectOption('done')
    const sent = page.waitForRequest((req) => req.method() === 'PATCH')
    await ui.save.click()
    const patch = await sent
    expect(new URL(patch.url()).pathname).toBe(`/api/tasks/${id}`)
    expect(patch.postDataJSON()).toEqual({ title: 'Žanov  pregled', status: 'done' })
    await expect(ui.title).toBeHidden()
    await expect(ui.dialog.getByRole('heading', { name: 'Žanov  pregled', exact: true })).toBeVisible()
    const after = await state(request)
    expect(after.tasks).toEqual(before.tasks.map((entry) => entry.id === id ? { ...entry, title: 'Žanov  pregled', status: 'done' } : entry))
    expect(after.saveRequests).toBe(1)
    await page.reload()
    await ui.edit.click()
    await expect(ui.title).toHaveValue('Žanov  pregled')
    await expect(ui.status).toHaveValue('done')
  })
}

test('A03: validacija brez zahtev, povezana napaka in ohranitev NBSP v zahtevi', async ({ page, request }) => {
  await page.goto('/#/projects/web/tasks/web-01')
  const ui = editor(page)
  await ui.edit.click()
  for (const value of ['', ' \t\r\n']) {
    await ui.title.fill(value)
    await ui.save.click()
    await expect(ui.title).toHaveAttribute('aria-invalid', 'true')
    const errorId = await ui.title.getAttribute('aria-describedby')
    expect(errorId).toBeTruthy()
    await expect(page.locator(`[id="${errorId}"]`)).toHaveAttribute('role', 'alert')
    await expect(ui.dialog.getByRole('alert')).toBeVisible()
    expect((await state(request)).saveRequests).toBe(0)
    await ui.title.fill('Popravljeno')
    await expect(ui.title).not.toHaveAttribute('aria-invalid', 'true')
    await expect(ui.dialog.getByRole('alert')).toHaveCount(0)
  }
  for (const title of ['\u00a0Naslov\u00a0', '\u00a0']) {
    await ui.title.fill(title)
    const sent = page.waitForRequest((req) => req.method() === 'PATCH')
    await ui.save.click()
    expect((await sent).postDataJSON()).toEqual({ title, status: 'in_progress' })
    await expect(ui.title).toBeHidden()
    expect((await (await request.get('/api/tasks/web-01')).json()).title).toBe(title)
    await ui.edit.click()
    await expect(ui.title).toHaveValue(title)
  }
})

const statuses: TaskStatus[] = ['todo', 'in_progress', 'done']
for (const from of statuses) for (const to of statuses.filter((entry) => entry !== from)) {
  test(`A04: prehod ${from} → ${to}, števci, tabla in osvežitev`, async ({ page, request }) => {
    const before = await state(request)
    const task = before.tasks.find((task) => task.projectId === 'web' && task.status === from)!
    await page.goto(`/#/projects/web/tasks/${task.id}`)
    const ui = editor(page)
    await ui.edit.click()
    await expect(ui.status.locator('option')).toHaveText(['Pripravljeno', 'V delu', 'Končano'])
    await ui.status.selectOption(to)
    await ui.save.click()
    await expect(ui.title).toBeHidden()
    await expect(ui.dialog.locator('.status-badge')).toHaveText(labels[to])
    await expect(page.locator(`[data-task-id="${task.id}"] .status-badge`)).toHaveText(labels[to])
    const expected = before.tasks.map((entry) => entry.id === task.id ? { ...entry, status: to } : entry)
    expect((await state(request)).tasks).toEqual(expected)
    const expectedCounts = statuses.map((status) => String(expected.filter((entry) => entry.projectId === 'web' && entry.status === status).length))
    await expect(page.locator('[aria-label="Pregled stanj opravil"] strong')).toHaveText(expectedCounts)
    await ui.dialog.getByRole('button', { name: 'Zapri podrobnosti' }).click()
    await page.getByRole('button', { name: 'Tabla', exact: true }).click()
    const column = page.getByRole('region', { name: labels[to], exact: true })
    await expect(column.locator(`[data-task-id="${task.id}"]`)).toBeVisible()
    await expect(page.locator('.board-cards > li')).toHaveCount(3)
    await page.reload()
    await expect(column.locator(`[data-task-id="${task.id}"]`)).toBeVisible()
    await expect(page.locator('[aria-label="Pregled stanj opravil"] strong')).toHaveText(expectedCounts)
  })
}

for (const scenario of [{ view: 'table', outcome: 'success' }, { view: 'board', outcome: 'reject' }]) {
  test(`A05: zadržan zapis ${scenario.view}/${scenario.outcome}, zaklep in ponovni poskus`, async ({ page, request }) => {
    if (scenario.view === 'board') await page.setViewportSize({ width: 390, height: 844 })
    const before = await state(request)
    await request.post('/__test/next-save', { data: { mode: 'hold' } })
    await page.goto(`/#/projects/web/tasks/web-02?view=${scenario.view}`)
    const ui = editor(page)
    await ui.edit.click()
    await ui.title.fill('Zadržan osnutek')
    await ui.status.selectOption('done')
    const draft = await state(request)
    expect(draft.tasks).toEqual(before.tasks)
    expect(draft.saveRequests).toBe(0)
    await expect(page.locator('[data-task-id="web-02"]')).toContainText('Pregled vsebine')
    await ui.dialog.locator('form').evaluate((form: HTMLFormElement) => {
      for (let i = 0; i < 5; i++) form.requestSubmit()
    })
    await expect.poll(async () => (await state(request)).pending).toBe(1)
    await expect(ui.dialog.getByRole('status')).toBeVisible()
    for (const control of [ui.title, ui.status, ui.save, ui.cancel]) await expect(control).toBeDisabled()
    const held = await state(request)
    expect(held.tasks).toEqual(before.tasks)
    expect(held.saveRequests).toBe(1)
    await expect(page.locator('[data-task-id="web-02"]')).toContainText('Pregled vsebine')
    await expect(page.locator('[aria-label="Pregled stanj opravil"] strong')).toHaveText(['1', '1', '1'])
    if (scenario.view === 'board') await expect(page.locator('.board-todo [data-task-id="web-02"]')).toHaveCount(1)
    await request.post('/__test/release', { data: { outcome: scenario.outcome } })
    if (scenario.outcome === 'reject') {
      await expect(ui.dialog.getByRole('alert')).toBeVisible()
      await expect(ui.title).toHaveValue('Zadržan osnutek')
      await expect(ui.status).toHaveValue('done')
      for (const control of [ui.title, ui.status, ui.save, ui.cancel]) await expect(control).toBeEnabled()
      expect((await state(request)).tasks).toEqual(before.tasks)
      await ui.save.click()
    }
    await expect(ui.title).toBeHidden()
    await expect(ui.dialog.getByRole('alert')).toHaveCount(0)
    await expect(page.locator('[data-task-id="web-02"]')).toContainText('Zadržan osnutek')
    await expect(page.locator('[aria-label="Pregled stanj opravil"] strong')).toHaveText(['0', '1', '2'])
    if (scenario.view === 'board') await expect(page.locator('.board-done [data-task-id="web-02"]')).toHaveCount(1)
  })
}

test('A06: preklic osnutka, validacijske in strežniške napake; svež naslednji obrazec', async ({ page, request }) => {
  const before = await state(request)
  await page.goto('/#/projects/web/tasks/web-02')
  const ui = editor(page)
  for (const scenario of ['draft', 'invalid', 'rejected']) {
    await ui.edit.click()
    await expect(ui.title).toHaveValue('Pregled vsebine')
    await expect(ui.status).toHaveValue('todo')
    await expect(ui.dialog.getByRole('alert')).toHaveCount(0)
    await ui.title.fill(scenario === 'invalid' ? '' : 'Začasni naslov')
    await ui.status.selectOption('done')
    if (scenario === 'rejected') await request.post('/__test/next-save', { data: { mode: 'reject' } })
    if (scenario !== 'draft') {
      await ui.save.click()
      await expect(ui.dialog.getByRole('alert')).toBeVisible()
    }
    const requests = (await state(request)).saveRequests
    await ui.cancel.click()
    await expect(ui.title).toBeHidden()
    expect((await state(request)).saveRequests).toBe(requests)
    expect((await state(request)).tasks).toEqual(before.tasks)
  }
  await ui.dialog.getByRole('button', { name: 'Zapri podrobnosti' }).click()
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  await page.getByRole('navigation').getByRole('link', { name: 'Jesenska kampanja' }).click()
  await page.locator('[data-task-id="launch-02"]').getByRole('link').click()
  await ui.edit.click()
  await expect(ui.title).toHaveValue('Priprava predstavitve')
  await expect(ui.status).toHaveValue('in_progress')
  await expect(ui.dialog.getByRole('alert')).toHaveCount(0)
})
