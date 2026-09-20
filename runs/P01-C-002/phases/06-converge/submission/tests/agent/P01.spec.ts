import { expect, test, type APIRequestContext, type Page } from '@playwright/test'
import type { Task, TaskStatus } from '../../shared/types.ts'
import { normalizeTitle } from '../../src/taskEditing.ts'

const labels: Record<TaskStatus, string> = { todo: 'Pripravljeno', in_progress: 'V delu', done: 'Končano' }
const statuses: TaskStatus[] = ['todo', 'in_progress', 'done']
async function state(request: APIRequestContext): Promise<{ tasks: Task[]; saveRequests: number; pending: number }> {
  return (await request.get('/__test/state')).json()
}
async function open(page: Page, id = 'web-02', view = 'table') {
  await page.goto(`/#/projects/${id.startsWith('web') ? 'web' : 'launch'}/tasks/${id}${view === 'board' ? '?view=board' : ''}`)
  await page.getByRole('dialog').getByRole('button', { name: 'Uredi', exact: true }).click()
}
function fields(page: Page) {
  const dialog = page.getByRole('dialog')
  return { dialog, title: dialog.getByRole('textbox', { name: 'Naslov', exact: true }), status: dialog.getByRole('combobox', { name: 'Stanje', exact: true }), save: dialog.getByRole('button', { name: 'Shrani', exact: true }), cancel: dialog.getByRole('button', { name: 'Prekliči', exact: true }) }
}
async function checkCounts(page: Page, tasks: Task[], project = 'web') {
  await expect(page.locator('[aria-label="Pregled stanj opravil"] strong')).toHaveText(statuses.map((s) => String(tasks.filter((t) => t.projectId === project && t.status === s).length)))
}

test.beforeEach(async ({ request }) => {
  expect((await request.post('/__test/reset')).ok()).toBeTruthy()
})

test('A01: normalizacija odstrani samo dovoljene robne znake', () => {
  for (const [input, output] of [
    ['', ''], [' \t\r\n', ''], [' \tNov  naslov\r\n', 'Nov  naslov'],
    ['\u00a0', '\u00a0'], [' \u00a0Naslov\u00a0 ', '\u00a0Naslov\u00a0'],
    [' A\tB\r\nC ', 'A\tB\r\nC'], ['\u2003Naslov\u2003', '\u2003Naslov\u2003'],
  ]) expect(normalizeTitle(input)).toBe(output)
})

for (const view of ['table', 'board']) {
  test(`A02: osnutek, validacija in preklic ne zapisujejo (${view})`, async ({ page, request }) => {
    const before = await state(request)
    await open(page, 'web-02', view)
    const { dialog, title, status, save, cancel } = fields(page)
    await expect(title).toHaveValue('Pregled vsebine')
    await expect(status).toHaveValue('todo')
    for (const invalid of ['', ' \t\r\n']) {
      await title.fill(invalid)
      await save.click()
      await expect(title).toHaveAttribute('aria-invalid', 'true')
      const description = await title.getAttribute('aria-describedby')
      expect(description).toBeTruthy()
      await expect(dialog.locator(`[id="${description}"]`)).toHaveAttribute('role', 'alert')
      expect(await state(request)).toEqual(before)
    }
    await cancel.click()
    await dialog.getByRole('button', { name: 'Uredi', exact: true }).click()
    await expect(title).toHaveValue('Pregled vsebine')
    await expect(dialog.getByRole('alert')).toHaveCount(0)
    await title.fill('   ')
    await save.click()
    await title.fill('Začasni  naslov')
    await expect(title).not.toHaveAttribute('aria-invalid', 'true')
    await expect(dialog.getByRole('alert')).toHaveCount(0)
    await status.selectOption('done')
    await expect(page.locator('[data-task-id="web-02"]')).toContainText('Pregled vsebine')
    await expect(page.locator('[data-task-id="web-02"]')).not.toContainText('Začasni')
    if (view === 'board') await expect(page.locator('.board-todo [data-task-id="web-02"]')).toHaveCount(1)
    await checkCounts(page, before.tasks)
    expect(await state(request)).toEqual(before)
    await cancel.click()
    await dialog.getByRole('button', { name: 'Uredi', exact: true }).click()
    await expect(title).toHaveValue('Pregled vsebine')
    await expect(status).toHaveValue('todo')
    expect(await state(request)).toEqual(before)
  })
}

test('A03: obrazec pošlje normaliziran naslov in ohrani NBSP', async ({ page, request }) => {
  await open(page)
  const { dialog, title, save } = fields(page)
  const payloads: unknown[] = []
  page.on('request', (r) => { if (r.method() === 'PATCH') payloads.push(r.postDataJSON()) })
  const cases = [
    [' \tNov  naslov\r\n', 'Nov  naslov'],
    [' \u00a0Naslov\u00a0 ', '\u00a0Naslov\u00a0'],
    ['\u00a0', '\u00a0'],
  ]
  for (let i = 0; i < cases.length; i++) {
    const [input, expected] = cases[i]
    if (i) await dialog.getByRole('button', { name: 'Uredi', exact: true }).click()
    await title.fill(input)
    await save.click()
    await expect(title).toBeHidden()
    expect(payloads[i]).toEqual({ title: expected, status: 'todo' })
    expect(await (await request.get('/api/tasks/web-02')).json()).toMatchObject({ title: expected, status: 'todo' })
  }
})

for (const from of statuses) for (const to of statuses.filter((s) => s !== from)) {
  test(`A04: ${from} → ${to}, vsi prikazi in izolacija`, async ({ page, request }) => {
    await request.patch('/api/tasks/web-02', { data: { title: 'Pregled vsebine', status: from } })
    const before = await state(request)
    await open(page)
    const { dialog, title, status, save } = fields(page)
    await expect(status).toHaveValue(from)
    const name = `Sprememba ${from} v ${to}`
    await title.fill(name)
    await status.selectOption(to)
    await save.click()
    await expect(title).toBeHidden()
    await expect(dialog.getByRole('heading', { name, exact: true })).toBeVisible()
    await expect(dialog.getByText(labels[to], { exact: true })).toBeVisible()
    await expect(page.locator('[data-task-id="web-02"]')).toContainText(name)
    await expect(page.locator('[data-task-id="web-02"]')).toContainText(labels[to])
    const expected: Task[] = before.tasks.map((t) => t.id === 'web-02' ? { ...t, title: name, status: to } : t)
    expect((await state(request)).tasks).toEqual(expected)
    await checkCounts(page, expected)
    await dialog.getByRole('button', { name: 'Zapri podrobnosti' }).click()
    await page.getByRole('button', { name: 'Tabla', exact: true }).click()
    await expect(page.locator(`.board-${to} [data-task-id="web-02"]`)).toContainText(name)
    await checkCounts(page, expected)
    await page.reload()
    await expect(page.locator(`.board-${to} [data-task-id="web-02"]`)).toContainText(name)
    await checkCounts(page, expected)
    await page.locator('[data-task-id="web-02"]').getByRole('link').click()
    await dialog.getByRole('button', { name: 'Uredi', exact: true }).click()
    await expect(title).toHaveValue(name)
    await expect(status).toHaveValue(to)
  })
}

for (const view of ['table', 'board']) {
  test(`A05: čakanje, ena zahteva, zavrnitev in ponovitev (${view})`, async ({ page, request }) => {
    const before = await state(request)
    await open(page, 'web-02', view)
    const { dialog, title, status, save, cancel } = fields(page)
    const raw = ' \tPonovni  poskus '
    await title.fill(raw)
    await status.selectOption('done')
    await request.post('/__test/next-save', { data: { mode: 'hold' } })
    await dialog.locator('form').evaluate((form) => {
      for (let i = 0; i < 5; i++) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })
    await expect.poll(async () => (await state(request)).pending).toBe(1)
    for (const control of [title, status, save, cancel]) await expect(control).toBeDisabled()
    await expect(dialog.getByRole('status')).toBeVisible()
    expect((await state(request)).saveRequests).toBe(1)
    expect((await state(request)).tasks).toEqual(before.tasks)
    await expect(page.locator('[data-task-id="web-02"]')).toContainText('Pregled vsebine')
    if (view === 'board') await expect(page.locator('.board-todo [data-task-id="web-02"]')).toHaveCount(1)
    await checkCounts(page, before.tasks)
    await request.post('/__test/release', { data: { outcome: 'reject' } })
    await expect(dialog.getByRole('alert')).toContainText('Shranjevanje ni uspelo')
    await expect(title).toHaveValue(raw)
    await expect(status).toHaveValue('done')
    for (const control of [title, status, save, cancel]) await expect(control).toBeEnabled()
    expect((await state(request)).tasks).toEqual(before.tasks)
    await request.post('/__test/next-save', { data: { mode: 'hold' } })
    await save.click()
    await expect.poll(async () => (await state(request)).pending).toBe(1)
    expect((await state(request)).saveRequests).toBe(2)
    await checkCounts(page, before.tasks)
    await request.post('/__test/release', { data: { outcome: 'success' } })
    await expect(title).toBeHidden()
    await expect(dialog.getByRole('alert')).toHaveCount(0)
    await expect(dialog.getByRole('heading', { name: 'Ponovni poskus' })).toBeVisible()
    const expected: Task[] = before.tasks.map((t) => t.id === 'web-02' ? { ...t, title: 'Ponovni  poskus', status: 'done' } : t)
    expect((await state(request)).tasks).toEqual(expected)
    await checkCounts(page, expected)
    if (view === 'board') await expect(page.locator('.board-done [data-task-id="web-02"]')).toHaveCount(1)
    await dialog.getByRole('button', { name: 'Zapri podrobnosti' }).click()
    await page.getByRole('button', { name: view === 'board' ? 'Preglednica' : 'Tabla', exact: true }).click()
    await page.getByRole('navigation').getByRole('link', { name: 'Jesenska kampanja' }).click()
    await page.locator('[data-task-id="launch-01"]').getByRole('link').click()
    await dialog.getByRole('button', { name: 'Uredi', exact: true }).click()
    await expect(title).toHaveValue('Pregled vsebine')
    await expect(status).toHaveValue('todo')
    await expect(dialog.getByRole('alert')).toHaveCount(0)
  })
}

test('A06: preklic po zavrnitvi ne prenese napake na drugo opravilo', async ({ page, request }) => {
  await open(page)
  const { dialog, title, save, cancel } = fields(page)
  await title.fill('Neuspešen osnutek')
  await request.post('/__test/next-save', { data: { mode: 'reject' } })
  await save.click()
  await expect(dialog.getByRole('alert')).toBeVisible()
  await cancel.click()
  await dialog.getByRole('button', { name: 'Zapri podrobnosti' }).click()
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  await page.getByRole('navigation').getByRole('link', { name: 'Jesenska kampanja' }).click()
  await page.locator('[data-task-id="launch-02"]').getByRole('link').click()
  await dialog.getByRole('button', { name: 'Uredi', exact: true }).click()
  await expect(title).toHaveValue('Priprava predstavitve')
  await expect(dialog.getByRole('alert')).toHaveCount(0)
  expect((await state(request)).saveRequests).toBe(1)
})

test('A07: obrazec pri ozki širini ohrani dostopne kontrole', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await open(page)
  const { title, status, save, cancel } = fields(page)
  for (const control of [title, status, save, cancel]) {
    await expect(control).toBeVisible()
    const box = await control.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(390)
  }
  await page.screenshot({ path: 'docs/agent/P01/mobile-edit.png', fullPage: true })
  await title.fill('Mobilni popravek')
  await save.click()
  await expect(title).toBeHidden()
})
