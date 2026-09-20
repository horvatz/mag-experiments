import { expect, test, type APIRequestContext, type Page } from '@playwright/test'
import type { Task, TaskStatus } from '../../shared/types.ts'

const labels = { todo: 'Pripravljeno', in_progress: 'V delu', done: 'Končano' }
const state = async (request: APIRequestContext): Promise<{ tasks: Task[]; saveRequests: number; pending: number }> =>
  (await request.get('/__test/state')).json()
const titleField = (page: Page) => page.getByRole('textbox', { name: 'Naslov', exact: true })
const statusField = (page: Page) => page.getByRole('combobox', { name: 'Stanje', exact: true })
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true })

async function expectCounts(page: Page, tasks: Task[]) {
  for (const status of ['todo', 'in_progress', 'done'] as const) {
    const count = tasks.filter((task) => task.status === status).length
    await expect(page.locator('.summary-item').filter({ hasText: labels[status] }).locator('strong')).toHaveText(String(count))
    if (await page.locator('.task-board').count()) {
      await expect(page.locator(`.board-${status} .column-count`)).toHaveText(String(count))
      await expect(page.locator(`.board-${status} [data-task-id]`)).toHaveCount(count)
    }
  }
}

test.beforeEach(async ({ request }) => {
  expect((await request.post('/__test/reset')).ok()).toBeTruthy()
})

test('A01 R03: exact boundary whitespace, accessible validation and normalized payload', async ({ page, request }) => {
  await page.goto('/#/projects/web/tasks/web-01')
  await button(page, 'Uredi').click()
  const before = await state(request)
  for (const invalid of ['', ' \t\n\r ']) {
    await titleField(page).fill(invalid)
    await button(page, 'Shrani').click()
    await expect(titleField(page)).toHaveAttribute('aria-invalid', 'true')
    const errorId = await titleField(page).getAttribute('aria-describedby')
    expect(errorId).toBeTruthy()
    await expect(page.locator(`[id="${errorId}"][role="alert"]`)).toBeVisible()
    expect(await state(request)).toEqual(before)
  }
  for (const [input, expected] of [
    [' \tŽanov  pregled\r\n', 'Žanov  pregled'],
    ['\u00a0Naslov\u00a0', '\u00a0Naslov\u00a0'],
    ['\u00a0', '\u00a0'],
    ['\u2003Ohranjen\u2003', '\u2003Ohranjen\u2003'],
    ['  Notranji\tznaki\nin  presledki  ', 'Notranji\tznaki\nin  presledki'],
  ]) {
    await titleField(page).fill(input)
    await expect(titleField(page)).not.toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByRole('alert')).toHaveCount(0)
    const sent = page.waitForRequest((entry) => entry.method() === 'PATCH')
    await button(page, 'Shrani').click()
    expect((await sent).postDataJSON()).toEqual({ title: expected, status: 'in_progress' })
    await expect(titleField(page)).toHaveCount(0)
    expect(await (await request.get('/api/tasks/web-01')).json()).toMatchObject({ title: expected })
    await button(page, 'Uredi').click()
    await expect(titleField(page)).toHaveValue(expected)
  }
})

for (const view of ['table', 'board'] as const) {
  test(`A02 R02 R08 R09: held rejection and retry in ${view}`, async ({ page, request }) => {
    if (view === 'board') await page.setViewportSize({ width: 390, height: 844 })
    const before = await state(request)
    const selected = before.tasks.find((task) => task.id === 'web-02')!
    await page.goto(`/#/projects/web/tasks/web-02?view=${view}`)
    await button(page, 'Uredi').click()
    await titleField(page).fill('Predlog  novega naslova')
    await statusField(page).selectOption('done')
    await expect(page.locator('[data-task-id="web-02"]')).toContainText(selected.title)
    await expectCounts(page, before.tasks.filter((task) => task.projectId === 'web'))
    expect(await state(request)).toEqual(before)
    await request.post('/__test/next-save', { data: { mode: 'hold' } })
    await page.getByRole('form', { name: 'Urejanje opravila' }).evaluate((form) => {
      for (let index = 0; index < 5; index++) (form as HTMLFormElement).requestSubmit()
    })
    await expect.poll(async () => (await state(request)).pending).toBe(1)
    await expect(page.getByRole('dialog').getByRole('status')).toContainText('Shranjevanje')
    for (const control of [titleField(page), statusField(page), button(page, 'Shrani'), button(page, 'Prekliči')]) await expect(control).toBeDisabled()
    const pending = await state(request)
    expect(pending.saveRequests).toBe(1)
    expect(pending.tasks).toEqual(before.tasks)
    await expect(page.locator('[data-task-id="web-02"]')).toContainText(selected.title)
    await expectCounts(page, before.tasks.filter((task) => task.projectId === 'web'))
    if (view === 'board') await expect(page.locator('.board-todo [data-task-id="web-02"]')).toHaveCount(1)
    else await expect(page.locator('[data-task-id="web-02"]')).toContainText('Pripravljeno')
    await request.post('/__test/release', { data: { outcome: 'reject' } })
    await expect(page.getByRole('dialog').getByRole('alert')).toContainText('Shranjevanje ni uspelo')
    for (const control of [titleField(page), statusField(page), button(page, 'Shrani'), button(page, 'Prekliči')]) await expect(control).toBeEnabled()
    await expect(titleField(page)).toHaveValue('Predlog  novega naslova')
    await expect(statusField(page)).toHaveValue('done')
    expect((await state(request)).tasks).toEqual(before.tasks)
    await button(page, 'Shrani').click()
    await expect(titleField(page)).toHaveCount(0)
    await expect(page.getByRole('alert')).toHaveCount(0)
    await expect(page.getByRole('dialog').getByRole('heading', { name: 'Predlog  novega naslova' })).toBeVisible()
    await expect(page.locator('[data-task-id="web-02"]')).toContainText('Predlog  novega naslova')
    const expected = before.tasks.map((task) => task.id === selected.id ? { ...task, title: 'Predlog  novega naslova', status: 'done' as const } : task)
    expect((await state(request)).tasks).toEqual(expected)
    expect((await state(request)).saveRequests).toBe(2)
    await expectCounts(page, expected.filter((task) => task.projectId === 'web'))
    await button(page, 'Zapri podrobnosti').click()
    await button(page, 'Tabla').click()
    await expect(page.getByRole('region', { name: 'Končano', exact: true }).locator('[data-task-id="web-02"]')).toContainText('Predlog  novega naslova')
    await page.reload()
    await expect(page.locator('.board-done [data-task-id="web-02"]')).toContainText('Predlog  novega naslova')
    await expectCounts(page, expected.filter((task) => task.projectId === 'web'))
  })
}

test('A03 R01 R04 R05 R07 R10: six transitions, identity, all fields, navigation and persistence', async ({ page, request }) => {
  const before = await state(request)
  const selected = before.tasks.find((task) => task.id === 'web-02')!
  let expected: Task = selected
  await page.goto('/#/projects/web/tasks/web-02')
  const transitions: TaskStatus[] = ['in_progress', 'done', 'todo', 'done', 'in_progress', 'todo']
  for (const [index, status] of transitions.entries()) {
    await button(page, 'Uredi').click()
    await expect(titleField(page)).toHaveValue(expected.title)
    await expect(statusField(page)).toHaveValue(expected.status)
    await expect(statusField(page).locator('option')).toHaveText(['Pripravljeno', 'V delu', 'Končano'])
    const title = `Sprememba ${index} – istoimensko opravilo`
    await titleField(page).fill(title)
    await statusField(page).selectOption(status)
    await button(page, 'Shrani').click()
    await expect(titleField(page)).toHaveCount(0)
    await expect(page.getByRole('dialog').getByRole('heading', { name: title })).toBeVisible()
    await expect(page.getByRole('dialog').getByText(labels[status], { exact: true })).toBeVisible()
    await expect(page.locator('[data-task-id="web-02"]')).toContainText(title)
    await expect(page.locator('[data-task-id="web-02"]')).toContainText(labels[status])
    expected = { ...selected, title, status }
    const expectedTasks = before.tasks.map((task) => task.id === selected.id ? expected : task)
    expect((await state(request)).tasks).toEqual(expectedTasks)
    await expectCounts(page, expectedTasks.filter((task) => task.projectId === 'web'))
  }
  await page.reload()
  await expect(page.getByRole('dialog').getByRole('heading', { name: expected.title })).toBeVisible()
  await button(page, 'Zapri podrobnosti').click()
  await button(page, 'Tabla').click()
  await expect(page.locator('.board-todo [data-task-id="web-02"]')).toContainText(expected.title)
  await page.locator('[data-task-id="web-01"]').getByRole('link').click()
  await button(page, 'Uredi').click()
  await expect(titleField(page)).toHaveValue('Pregled vsebine')
  await expect(statusField(page)).toHaveValue('in_progress')
  await button(page, 'Prekliči').click()
  await button(page, 'Zapri podrobnosti').click()
  await page.getByRole('navigation').getByRole('link', { name: 'Jesenska kampanja' }).click()
  await button(page, 'Preglednica').click()
  await page.locator('[data-task-id="launch-01"]').getByRole('link').click()
  await button(page, 'Uredi').click()
  await expect(titleField(page)).toHaveValue('Pregled vsebine')
  await expect(statusField(page)).toHaveValue(before.tasks.find((task) => task.id === 'launch-01')!.status)
  await expect(page.getByRole('alert')).toHaveCount(0)
})

test('A04 R06 R10: cancellation clears drafts and validation or server errors', async ({ page, request }) => {
  const before = await state(request)
  await page.goto('/#/projects/web/tasks/web-01')
  for (const mode of ['draft', 'invalid', 'rejected']) {
    await button(page, 'Uredi').click()
    await titleField(page).fill(mode === 'invalid' ? '\t \n' : 'Zavržen osnutek')
    await statusField(page).selectOption('done')
    if (mode === 'rejected') await request.post('/__test/next-save', { data: { mode: 'reject' } })
    if (mode !== 'draft') {
      await button(page, 'Shrani').click()
      await expect(page.getByRole('alert')).toBeVisible()
    }
    const requestsBeforeCancel = (await state(request)).saveRequests
    await button(page, 'Prekliči').click()
    await expect(titleField(page)).toHaveCount(0)
    await button(page, 'Uredi').click()
    await expect(titleField(page)).toHaveValue('Pregled vsebine')
    await expect(statusField(page)).toHaveValue('in_progress')
    await expect(page.getByRole('alert')).toHaveCount(0)
    await expect(titleField(page)).not.toHaveAttribute('aria-invalid', 'true')
    expect((await state(request)).saveRequests).toBe(requestsBeforeCancel)
    expect((await state(request)).tasks).toEqual(before.tasks)
    await button(page, 'Prekliči').click()
  }
  await button(page, 'Zapri podrobnosti').click()
  await button(page, 'Tabla').click()
  await page.getByRole('navigation').getByRole('link', { name: 'Jesenska kampanja' }).click()
  await page.locator('[data-task-id="launch-01"]').getByRole('link').click()
  await button(page, 'Uredi').click()
  await expect(titleField(page)).toHaveValue('Pregled vsebine')
  await expect(page.getByRole('alert')).toHaveCount(0)
})
