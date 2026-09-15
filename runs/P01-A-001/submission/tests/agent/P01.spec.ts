import { expect, test, type APIRequestContext, type Page } from '@playwright/test'
import type { Task, TaskStatus } from '../../shared/types.ts'

type State = { tasks: Task[]; saveRequests: number; pending: number; nextMode: string }
const labels = { todo: 'Pripravljeno', in_progress: 'V delu', done: 'Končano' }

async function state(request: APIRequestContext): Promise<State> {
  const response = await request.get('/__test/state')
  expect(response.ok()).toBeTruthy()
  return response.json()
}

async function control(request: APIRequestContext, action: string, data: object) {
  expect((await request.post(`/__test/${action}`, { data })).ok()).toBeTruthy()
}

async function edit(page: Page) {
  await page.getByRole('dialog').getByRole('button', { name: 'Uredi', exact: true }).click()
  return {
    title: page.getByRole('textbox', { name: 'Naslov', exact: true }),
    status: page.getByRole('combobox', { name: 'Stanje', exact: true }),
    save: page.getByRole('button', { name: 'Shrani', exact: true }),
    cancel: page.getByRole('button', { name: 'Prekliči', exact: true }),
  }
}

async function counts(page: Page, tasks: Task[], projectId = 'web') {
  const projectTasks = tasks.filter((task) => task.projectId === projectId)
  await expect(page.locator('[aria-label="Pregled stanj opravil"] strong')).toHaveText(
    (['todo', 'in_progress', 'done'] as const).map((status) => String(projectTasks.filter((task) => task.status === status).length)),
  )
}

test.beforeEach(async ({ request }) => {
  expect((await request.post('/__test/reset')).ok()).toBeTruthy()
})

for (const viewport of [{ width: 1440, height: 960 }, { width: 390, height: 844 }]) {
  test.describe(`${viewport.width}px`, () => {
    test.use({ viewport })

    for (const view of ['table', 'board']) {
      test(`A01 ${view}: potrjen zapis po ID, vsi prikazi, osvežitev in druga opravila`, async ({ page, request }) => {
        const before = await state(request)
        const original = before.tasks.find((task) => task.id === 'web-02')!
        await page.goto(`/#/projects/web?view=${view}`)
        await page.locator('[data-task-id="web-02"]').getByRole('link').click()
        const fields = await edit(page)
        await expect(fields.title).toHaveValue(original.title)
        await expect(fields.status).toHaveValue(original.status)
        const rawTitle = ' \t\nŽanov  pregled vsebine\r\n '
        const title = 'Žanov  pregled vsebine'
        await fields.title.fill(rawTitle)
        await fields.status.selectOption('done')
        expect(await state(request)).toEqual(before)
        await expect(page.locator('[data-task-id="web-02"]')).toContainText(original.title)
        await counts(page, before.tasks)
        const outgoing = page.waitForRequest((req) => req.method() === 'PATCH')
        await fields.save.click()
        const patch = await outgoing
        expect(new URL(patch.url()).pathname).toBe('/api/tasks/web-02')
        expect(patch.postDataJSON()).toEqual({ title, status: 'done' })
        await expect(fields.title).toHaveCount(0)
        const dialog = page.getByRole('dialog')
        await expect(dialog.getByRole('heading', { name: title, exact: true })).toBeVisible()
        await expect(dialog.getByText('Končano', { exact: true })).toBeVisible()
        await expect(dialog.getByRole('button', { name: 'Uredi', exact: true })).toBeFocused()
        const expected = before.tasks.map((task) => task.id === original.id ? { ...task, title, status: 'done' as const } : task)
        expect((await state(request)).tasks).toEqual(expected)
        expect((await state(request)).saveRequests).toBe(1)
        await counts(page, expected)
        await page.getByRole('button', { name: 'Zapri podrobnosti' }).click()
        await page.getByRole('button', { name: 'Tabla', exact: true }).click()
        const done = page.getByRole('region', { name: 'Končano', exact: true })
        await expect(done.locator('[data-task-id="web-02"]')).toContainText(title)
        await expect(done.getByRole('link')).toHaveCount(2)
        await expect(page.getByRole('region', { name: 'Pripravljeno', exact: true }).getByRole('link')).toHaveCount(0)
        await page.reload()
        await expect(done.locator('[data-task-id="web-02"]')).toContainText(title)
        await counts(page, expected)
        await page.getByRole('button', { name: 'Preglednica', exact: true }).click()
        await expect(page.locator('[data-task-id="web-02"]')).toContainText('Končano')
        await page.locator('[data-task-id="web-02"]').getByRole('link').click()
        const reopened = await edit(page)
        await expect(reopened.title).toHaveValue(title)
        await expect(reopened.status).toHaveValue('done')
        await reopened.cancel.click()
        await page.getByRole('button', { name: 'Zapri podrobnosti' }).click()
        await page.getByRole('navigation').getByRole('link', { name: 'Jesenska kampanja' }).click()
        await page.locator('[data-task-id="launch-01"]').getByRole('link').click()
        const other = await edit(page)
        await expect(other.title).toHaveValue(before.tasks.find((task) => task.id === 'launch-01')!.title)
        await expect(other.status).toHaveValue('todo')
        await expect(page.getByRole('alert')).toHaveCount(0)
        await other.cancel.click()
        await page.getByRole('button', { name: 'Zapri podrobnosti' }).click()
        await page.getByRole('navigation').getByRole('link', { name: 'Spletna prenova' }).click()
        await expect(page.locator('[data-task-id="web-02"]')).toContainText(title)
        expect((await state(request)).tasks).toEqual(expected)
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy()
      })
    }

    test('A02: prazni vnosi, točni robni beli znaki in ohranitev drugih znakov', async ({ page, request }) => {
      const before = await state(request)
      await page.goto('/#/projects/web/tasks/web-01')
      let fields = await edit(page)
      for (const invalid of ['', ' \t\r\n ']) {
        await fields.title.fill(invalid)
        await fields.save.click()
        await expect(fields.title).toHaveAttribute('aria-invalid', 'true')
        await expect(fields.title).toBeFocused()
        const errorId = await fields.title.getAttribute('aria-describedby')
        expect(errorId).toBeTruthy()
        await expect(page.locator(`[id="${errorId}"]`)).toHaveAttribute('role', 'alert')
        await expect(page.locator(`[id="${errorId}"]`)).toContainText('Naslov ne sme biti prazen')
        expect(await state(request)).toEqual(before)
      }
      const cases = [
        { raw: ' \t\r\nŽanov  pregled\tveč\nvrstic \r\n', expected: 'Žanov  pregled\tveč\nvrstic' },
        { raw: ' \t\n\u00a0Naslov\u00a0\r\n ', expected: '\u00a0Naslov\u00a0' },
        { raw: '\u00a0', expected: '\u00a0' },
        { raw: '\u2003Naslov\u2003', expected: '\u2003Naslov\u2003' },
      ]
      for (const [index, value] of cases.entries()) {
        if (index > 0) fields = await edit(page)
        await fields.title.fill(value.raw)
        await expect(fields.title).not.toHaveAttribute('aria-invalid', 'true')
        await expect(page.getByRole('alert')).toHaveCount(0)
        const outgoing = page.waitForRequest((req) => req.method() === 'PATCH')
        await fields.save.click()
        expect((await outgoing).postDataJSON()).toEqual({ title: value.expected, status: 'in_progress' })
        await expect(fields.title).toHaveCount(0)
        expect(await (await request.get('/api/tasks/web-01')).json()).toEqual({ ...before.tasks.find((task) => task.id === 'web-01'), title: value.expected })
      }
      expect((await state(request)).saveRequests).toBe(cases.length)
    })

    test('A03: čakanje, več hitrih oddaj, zavrnitev in ponoven uspeh brez izgube vnosa', async ({ page, request }) => {
      const before = await state(request)
      await page.goto('/#/projects/web?view=board')
      await page.locator('[data-task-id="web-01"]').getByRole('link').click()
      const fields = await edit(page)
      const rawTitle = '  Ohranjen  vnos  '
      await fields.title.fill(rawTitle)
      await fields.status.selectOption('todo')
      await control(request, 'next-save', { mode: 'hold' })
      await fields.save.evaluate((button: HTMLButtonElement) => {
        button.click()
        button.click()
        button.click()
        button.form!.requestSubmit()
        button.form!.requestSubmit()
      })
      await expect.poll(async () => (await state(request)).pending).toBe(1)
      for (const field of Object.values(fields)) await expect(field).toBeDisabled()
      await expect(page.getByRole('dialog').getByRole('status')).toContainText('Shranjevanje')
      const pending = await state(request)
      expect(pending.saveRequests).toBe(1)
      expect(pending.tasks).toEqual(before.tasks)
      await counts(page, before.tasks)
      await expect(page.locator('[aria-labelledby="column-in_progress"] [data-task-id="web-01"]')).toContainText('Pregled vsebine')
      await control(request, 'release', { outcome: 'reject' })
      await expect(page.getByRole('dialog').getByRole('alert')).toContainText('Shranjevanje ni uspelo')
      for (const field of Object.values(fields)) await expect(field).toBeEnabled()
      await expect(fields.title).toHaveValue(rawTitle)
      await expect(fields.status).toHaveValue('todo')
      await expect(page.getByRole('dialog').getByRole('status')).toHaveCount(0)
      expect((await state(request)).tasks).toEqual(before.tasks)
      await counts(page, before.tasks)
      await control(request, 'next-save', { mode: 'hold' })
      await fields.save.click()
      await expect.poll(async () => (await state(request)).pending).toBe(1)
      await expect(page.getByRole('alert')).toHaveCount(0)
      for (const field of Object.values(fields)) await expect(field).toBeDisabled()
      expect((await state(request)).tasks).toEqual(before.tasks)
      await control(request, 'release', { outcome: 'success' })
      await expect(fields.title).toHaveCount(0)
      await expect(page.getByRole('dialog').getByRole('heading', { name: 'Ohranjen vnos' })).toBeVisible()
      await expect(page.getByRole('alert')).toHaveCount(0)
      const expected = before.tasks.map((task) => task.id === 'web-01' ? { ...task, title: 'Ohranjen  vnos', status: 'todo' as const } : task)
      expect((await state(request)).tasks).toEqual(expected)
      expect((await state(request)).saveRequests).toBe(2)
      await counts(page, expected)
      await expect(page.locator('[aria-labelledby="column-todo"] [data-task-id="web-01"]')).toContainText('Ohranjen  vnos')
    })

    test('A04: preklic po obeh vrstah napake in čist obrazec naslednjega opravila', async ({ page, request }) => {
      const before = await state(request)
      await page.goto('/#/projects/web/tasks/web-02')
      let fields = await edit(page)
      await fields.title.fill(' \t\n')
      await fields.status.selectOption('done')
      await fields.save.click()
      await expect(page.getByRole('alert')).toBeVisible()
      await fields.cancel.click()
      expect(await state(request)).toEqual(before)
      fields = await edit(page)
      await expect(fields.title).toHaveValue('Pregled vsebine')
      await expect(fields.status).toHaveValue('todo')
      await expect(page.getByRole('alert')).toHaveCount(0)
      await expect(fields.title).not.toHaveAttribute('aria-invalid', 'true')
      await fields.title.fill('Zavrnjeni naslov')
      await fields.status.selectOption('done')
      await control(request, 'next-save', { mode: 'reject' })
      await fields.save.click()
      await expect(page.getByRole('alert')).toContainText('Shranjevanje ni uspelo')
      await fields.cancel.click()
      fields = await edit(page)
      await expect(fields.title).toHaveValue('Pregled vsebine')
      await expect(fields.status).toHaveValue('todo')
      await expect(page.getByRole('alert')).toHaveCount(0)
      await fields.cancel.click()
      await page.getByRole('button', { name: 'Zapri podrobnosti' }).click()
      await page.locator('[data-task-id="web-01"]').getByRole('link').click()
      fields = await edit(page)
      await expect(fields.title).toHaveValue('Pregled vsebine')
      await expect(fields.status).toHaveValue('in_progress')
      await expect(page.getByRole('alert')).toHaveCount(0)
      await fields.cancel.click()
      const after = await state(request)
      expect(after.tasks).toEqual(before.tasks)
      expect(after.saveRequests).toBe(1)
    })

    test('A05: vseh šest prehodov stanj in trije nespremenjeni statusi', async ({ page, request }) => {
      const before = await state(request)
      await page.goto('/#/projects/web?view=board')
      await page.locator('[data-task-id="web-02"]').getByRole('link').click()
      // The sequence traverses each directed edge and each self-transition.
      const targets: TaskStatus[] = ['todo', 'done', 'done', 'in_progress', 'in_progress', 'done', 'todo', 'in_progress', 'todo']
      let previous: TaskStatus = 'todo'
      for (const [index, target] of targets.entries()) {
        const fields = await edit(page)
        await expect(fields.status).toHaveValue(previous)
        await expect(fields.status.locator('option')).toHaveText(['Pripravljeno', 'V delu', 'Končano'])
        const title = index === 0 ? 'Pregled vsebine' : `Prehod ${previous} → ${target}: ${index}`
        await fields.title.fill(title)
        await fields.status.selectOption(target)
        await fields.save.click()
        await expect(fields.title).toHaveCount(0)
        await expect(page.getByRole('dialog').getByText(labels[target], { exact: true })).toBeVisible()
        const expected = before.tasks.map((task) => task.id === 'web-02' ? { ...task, title, status: target } : task)
        expect((await state(request)).tasks).toEqual(expected)
        await counts(page, expected)
        for (const status of ['todo', 'in_progress', 'done'] as const) {
          const column = page.locator(`[aria-labelledby="column-${status}"]`)
          const count = expected.filter((task) => task.projectId === 'web' && task.status === status).length
          await expect(column.locator('[data-task-id]')).toHaveCount(count)
          await expect(column.locator('.column-count')).toHaveText(String(count))
        }
        await expect(page.locator(`[aria-labelledby="column-${target}"] [data-task-id="web-02"]`)).toContainText(title)
        previous = target
      }
      expect((await state(request)).saveRequests).toBe(targets.length)
      await page.getByRole('button', { name: 'Zapri podrobnosti' }).click()
      await page.getByRole('button', { name: 'Preglednica', exact: true }).click()
      await expect(page.locator('[data-task-id="web-02"]')).toContainText('Pripravljeno')
    })
  })
}

test('A06: pozni začetni seznam ne prepiše potrjenega shranjevanja', async ({ page, request }) => {
  const before = await state(request)
  let release!: () => void
  const gate = new Promise<void>((resolve) => { release = resolve })
  let captured!: () => void
  const initialResponse = new Promise<void>((resolve) => { captured = resolve })
  await page.route('**/api/projects/web/tasks', async (route) => {
    const response = await route.fetch()
    captured()
    await gate
    await route.fulfill({ response })
  })
  await page.goto('/#/projects/web/tasks/web-02')
  await initialResponse
  const fields = await edit(page)
  await fields.title.fill('Potrjeni naslov pred seznamom')
  await fields.status.selectOption('done')
  await fields.save.click()
  await expect(fields.title).toHaveCount(0)
  release()
  await expect(page.locator('[data-task-id="web-02"]')).toContainText('Potrjeni naslov pred seznamom')
  await expect(page.locator('[data-task-id="web-02"]')).toContainText('Končano')
  await counts(page, before.tasks.map((task) => task.id === 'web-02' ? { ...task, status: 'done' } : task))
})

test('A07: napaka povezave ohrani vnos in omogoča ponovitev', async ({ page, request }) => {
  const before = await state(request)
  await page.goto('/#/projects/launch/tasks/launch-03')
  const fields = await edit(page)
  await fields.title.fill('Ponovitev po napaki povezave')
  await fields.status.selectOption('in_progress')
  await page.route('**/api/tasks/launch-03', async (route) => {
    if (route.request().method() === 'PATCH') await route.abort('failed')
    else await route.continue()
  })
  await fields.save.click()
  await expect(page.getByRole('alert')).toContainText('Preveri povezavo')
  await expect(fields.title).toHaveValue('Ponovitev po napaki povezave')
  await expect(fields.status).toHaveValue('in_progress')
  for (const field of Object.values(fields)) await expect(field).toBeEnabled()
  expect(await state(request)).toEqual(before)
  await page.unroute('**/api/tasks/launch-03')
  await fields.save.click()
  await expect(fields.title).toHaveCount(0)
  await expect(page.getByRole('alert')).toHaveCount(0)
  expect((await state(request)).tasks).toEqual(before.tasks.map((task) => task.id === 'launch-03' ? { ...task, title: 'Ponovitev po napaki povezave', status: 'in_progress' } : task))
})
