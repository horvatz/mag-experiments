import { expect, test } from '@playwright/test'
import type { TaskStatus } from '../../support/types.ts'
import { assertOnlyUpdate, assertPresentation, openEditor, reset, snapshot, type View } from './checks.ts'

test.beforeEach(async ({ request }) => { await reset(request) })

test('E01: istoimenska opravila se odpirajo po identifikatorju [R01]', async ({ page, request }) => {
  const before = await snapshot(request)
  for (const id of ['web-02', 'web-01', 'launch-01']) {
    const task = before.tasks.find((entry) => entry.id === id)!
    const form = await openEditor(page, task, 'board')
    await expect(form.title).toHaveValue(task.title)
    await expect(form.status).toHaveValue(task.status)
    await form.title.fill(`Preizkus ${id}`)
    await form.cancel.click()
  }
  expect(await snapshot(request)).toEqual(before)
})

test('E02: začasni vnos ne spremeni podatkov ali bralnih prikazov [R02]', async ({ page, request }) => {
  const before = await snapshot(request)
  const task = before.tasks.find((entry) => entry.id === 'web-02')!
  for (const view of ['table', 'board'] as View[]) {
    const form = await openEditor(page, task, view)
    const item = page.locator('[data-task-id="web-02"]')
    const oldItem = await item.innerText()
    const counters = page.locator('[aria-label="Pregled stanj opravil"]')
    const oldCounters = await counters.innerText()
    await form.title.fill('Začasna vsebina ČŠŽ')
    await form.status.selectOption('done')
    await expect(item).toHaveText(oldItem, { useInnerText: true })
    await expect(counters).toHaveText(oldCounters, { useInnerText: true })
    expect(await snapshot(request)).toEqual(before)
    await form.cancel.click()
  }
})

test('E03: prazni in beli vnosi ostanejo lokalni, popravek odstrani napako [R03]', async ({ page, request }) => {
  const before = await snapshot(request)
  const form = await openEditor(page, before.tasks[0])
  for (const invalid of ['', ' ', '\t', '\r\n', ' \t\r\n  ']) {
    await form.title.fill(invalid)
    await form.save.click()
    await expect(form.title).toHaveAttribute('aria-invalid', 'true')
    await expect(form.title).toHaveAttribute('aria-describedby', /\S+/)
    await expect(form.dialog.getByRole('alert')).toBeVisible()
    expect(await snapshot(request)).toEqual(before)
    await form.title.fill('Popravljen naslov Ž')
    await expect(form.title).not.toHaveAttribute('aria-invalid', 'true')
    await expect(form.dialog.getByRole('alert')).toBeHidden()
  }
})

test('E04: normalizacija ohrani notranje presledke in druge znake [R03,R05]', async ({ page, request }) => {
  for (const [input, expected] of [
    [' \tŽivjo  ČŠŽ\r\n ', 'Živjo  ČŠŽ'],
    [' \t\u00a0Šumniki  ostanejo\u00a0\t ', '\u00a0Šumniki  ostanejo\u00a0'],
  ]) {
    const before = await snapshot(request)
    const task = before.tasks.find((entry) => entry.id === 'web-02')!
    const form = await openEditor(page, task)
    await form.title.fill(input)
    await form.status.selectOption('in_progress')
    const outbound = page.waitForRequest((req) => req.method() === 'PATCH' && req.url().endsWith('/api/tasks/web-02'))
    await form.save.click()
    expect((await outbound).postDataJSON()).toEqual({ title: expected, status: 'in_progress' })
    await expect(form.title).toBeHidden()
    await assertOnlyUpdate(request, before, task.id, expected, 'in_progress')
  }
})

test('E05: vseh šest prehodov in shranjevanje brez spremembe stanja [R04,R05]', async ({ page, request }) => {
  const states: TaskStatus[] = ['todo', 'in_progress', 'done']
  for (const from of states) for (const to of states) {
    // Fixture changes happen before the app loads; concurrent external writers are out of scope.
    await page.goto('about:blank')
    await request.patch('/api/tasks/web-02', { data: { title: 'Prehodi stanj', status: from } })
    const before = await snapshot(request)
    const task = before.tasks.find((entry) => entry.id === 'web-02')!
    const form = await openEditor(page, task, 'board')
    await expect(form.status).toHaveValue(from)
    await form.status.selectOption(to)
    await form.save.click()
    await expect(form.title).toBeHidden()
    const after = await assertOnlyUpdate(request, before, task.id, task.title, to)
    expect(after.saveRequests).toBe(before.saveRequests + 1)
    await assertPresentation(page, { ...task, status: to }, after.tasks, 'board')
  }
})

test('E06: uspeh posodobi vse prikaze in preživi osvežitev [R05]', async ({ page, request }) => {
  for (const view of ['table', 'board'] as View[]) {
    const before = await snapshot(request)
    const task = before.tasks.find((entry) => entry.id === 'web-01')!
    const expected = { ...task, title: `Shranjena sprememba ${view}`, status: (view === 'table' ? 'done' : 'todo') as TaskStatus }
    const form = await openEditor(page, task, view)
    await form.title.fill(expected.title)
    await form.status.selectOption(expected.status)
    await form.save.click()
    await expect(form.title).toBeHidden()
    const after = await assertOnlyUpdate(request, before, task.id, expected.title, expected.status)
    await assertPresentation(page, expected, after.tasks, view)
    await page.reload()
    await assertPresentation(page, expected, after.tasks, view)
  }
})

test('E07: preklic po veljavnem in neveljavnem vnosu omogoči sveže urejanje [R06]', async ({ page, request }) => {
  const before = await snapshot(request)
  const task = before.tasks.find((entry) => entry.id === 'web-02')!
  const form = await openEditor(page, task)
  for (const invalid of [false, true]) {
    await form.title.fill(invalid ? ' \t ' : 'Zavržena sprememba')
    await form.status.selectOption('done')
    if (invalid) {
      await form.save.click()
      await expect(form.dialog.getByRole('alert')).toBeVisible()
    }
    await form.cancel.click()
    await expect(form.title).toBeHidden()
    expect(await snapshot(request)).toEqual(before)
    await form.dialog.getByRole('button', { name: 'Uredi', exact: true }).click()
    await expect(form.title).toHaveValue(task.title)
    await expect(form.status).toHaveValue(task.status)
    await expect(form.dialog.getByRole('alert')).toBeHidden()
  }
})

test('E08: spremeni se samo izbrani zapis in dovoljeni polji [R07]', async ({ page, request }) => {
  const before = await snapshot(request)
  const task = before.tasks.find((entry) => entry.id === 'web-02')!
  const form = await openEditor(page, task)
  await form.title.fill('Samo drugo opravilo')
  await form.status.selectOption('done')
  await form.save.click()
  await expect(form.title).toBeHidden()
  await assertOnlyUpdate(request, before, task.id, 'Samo drugo opravilo', 'done')
})

test('E09: zavrnitev ohrani vnos in podatke ter dovoli ponovni poskus [R08]', async ({ page, request }) => {
  const before = await snapshot(request)
  const task = before.tasks.find((entry) => entry.id === 'web-02')!
  const form = await openEditor(page, task, 'board')
  const title = '  Ponovni  poskus ŠŽ  '
  await form.title.fill(title)
  await form.status.selectOption('done')
  await request.post('/__test/next-save', { data: { mode: 'reject' } })
  await form.save.click()
  await expect(form.dialog.getByRole('alert')).toBeVisible()
  await expect(form.title).toHaveValue(title)
  await expect(form.status).toHaveValue('done')
  for (const control of [form.title, form.status, form.save, form.cancel]) await expect(control).toBeEnabled()
  const rejected = await snapshot(request)
  expect(rejected.tasks).toEqual(before.tasks)
  expect(rejected.saveRequests).toBe(before.saveRequests + 1)
  await expect(page.locator('[data-task-id="web-02"]')).toContainText(task.title)
  await form.save.click()
  await expect(form.title).toBeHidden()
  await expect(form.dialog.getByRole('alert')).toBeHidden()
  const after = await assertOnlyUpdate(request, before, task.id, 'Ponovni  poskus ŠŽ', 'done')
  await assertPresentation(page, { ...task, title: 'Ponovni  poskus ŠŽ', status: 'done' }, after.tasks, 'board')
})

test('E10: čakanje onemogoči kontrole in podvajanje zahteve [R09]', async ({ page, request }) => {
  for (const outcome of ['success', 'reject']) {
    await page.goto('about:blank')
    await reset(request)
    const before = await snapshot(request)
    const task = before.tasks.find((entry) => entry.id === 'web-01')!
    const form = await openEditor(page, task)
    await form.title.fill('Počakaj na odgovor')
    await form.status.selectOption('done')
    await request.post('/__test/next-save', { data: { mode: 'hold' } })
    await form.save.dblclick()
    await expect.poll(async () => (await snapshot(request)).pending).toBe(1)
    await expect(form.dialog.getByRole('status')).toBeVisible()
    for (const control of [form.title, form.status, form.save, form.cancel]) await expect(control).toBeDisabled()
    await page.keyboard.press('Enter')
    await page.keyboard.press('Enter')
    const waiting = await snapshot(request)
    expect(waiting.saveRequests).toBe(before.saveRequests + 1)
    expect(waiting.tasks).toEqual(before.tasks)
    await request.post('/__test/release', { data: { outcome } })
    if (outcome === 'success') {
      await expect(form.title).toBeHidden()
      await assertOnlyUpdate(request, before, task.id, 'Počakaj na odgovor', 'done')
    } else {
      await expect(form.dialog.getByRole('alert')).toBeVisible()
      await expect(form.title).toHaveValue('Počakaj na odgovor')
      for (const control of [form.title, form.status, form.save, form.cancel]) await expect(control).toBeEnabled()
      expect((await snapshot(request)).tasks).toEqual(before.tasks)
      await form.cancel.click()
    }
  }
})

test('E11: po uspehu in preklicu drugo opravilo dobi svež obrazec [R10]', async ({ page, request }) => {
  const before = await snapshot(request)
  const first = before.tasks.find((entry) => entry.id === 'web-01')!
  const form = await openEditor(page, first, 'board')
  await form.title.fill('Prvo opravilo po spremembi')
  await form.status.selectOption('done')
  await form.save.click()
  await expect(form.title).toBeHidden()
  await form.dialog.getByRole('button', { name: 'Zapri podrobnosti' }).click()
  await page.getByRole('navigation').getByRole('link', { name: 'Jesenska kampanja' }).click()
  await page.locator('[data-task-id="launch-01"]').getByRole('link').click()
  await form.dialog.getByRole('button', { name: 'Uredi', exact: true }).click()
  await expect(form.title).toHaveValue('Pregled vsebine')
  await expect(form.status).toHaveValue('todo')
  await form.title.fill(' ')
  await form.save.click()
  await expect(form.dialog.getByRole('alert')).toBeVisible()
  await form.cancel.click()
  await form.dialog.getByRole('button', { name: 'Zapri podrobnosti' }).click()
  await page.getByRole('navigation').getByRole('link', { name: 'Spletna prenova' }).click()
  await page.getByRole('button', { name: 'Preglednica', exact: true }).click()
  await page.locator('[data-task-id="web-02"]').getByRole('link').click()
  await form.dialog.getByRole('button', { name: 'Uredi', exact: true }).click()
  await expect(form.title).toHaveValue('Pregled vsebine')
  await expect(form.status).toHaveValue('todo')
  await expect(form.dialog.getByRole('alert')).toBeHidden()
})
