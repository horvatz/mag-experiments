import { test, expect, type Page } from '@playwright/test'
import { board, click, columnIds, expectIds, makeTask, mount, project, readonly, summary, table } from '../development/helpers.ts'
import { createOrder, orderReducer, type OrderAction, type OrderState } from '../../src/taskOrder.ts'

const records = Array.from({ length: 25 }, (_, i) => makeTask(`naloga-${41 - i}`, {
  title: i % 2 ? 'Enak naslov čšž, "citat"' : 'Opravilo <b>besedilo</b>',
  description: `Opis ${i}; \nDruga vrstica — Ž`,
  status: (['todo', 'done', 'in_progress'] as const)[i % 3],
  assignee: `Oseba ${i} Žagar`,
  dueDate: `2028-02-${String(i + 1).padStart(2, '0')}`,
}))
const initial = records.map(task => task.id)
const history = async (page: Page, undo: number, redo: number) => {
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText(`Razveljavitve: ${undo}. Ponovitve: ${redo}.`)
  await expect(page.getByRole('button', { name: 'Razveljavi premik', exact: true })).toBeEnabled({ enabled: undo > 0 })
  await expect(page.getByRole('button', { name: 'Ponovi premik', exact: true })).toBeEnabled({ enabled: redo > 0 })
}
const positions = async (page: Page, ids: readonly string[]) => {
  for (const [index, id] of ids.entries()) await expect(page.getByLabel(`Mesto opravila ${id}`, { exact: true })).toHaveText(String(index + 1))
}
const row = (page: Page, id: string) => page.locator('[data-task-id]').filter({ has: page.getByLabel(`Mesto opravila ${id}`, { exact: true }) })

test('A01: arbitrary IDs, 25 tasks, duplicate titles and unchanged task details', async ({ page }) => {
  const special = makeTask('č / " ?#[]', { title: records[1].title, assignee: 'Živa Čop', description: '<script>navadno besedilo</script>\nČšž', dueDate: '2028-02-29' })
  const input = [special, ...records]
  const ids = input.map(task => task.id)
  const writes = await mount(page, input)
  await expectIds(page, ids)
  await positions(page, ids)
  await history(page, 0, 0)
  await expect(page.getByRole('button', { name: `Premakni ${ids[0]} gor`, exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: `Premakni ${ids.at(-1)} dol`, exact: true })).toBeDisabled()
  await click(page, `Premakni ${special.id} dol`)
  const moved = [ids[1], ids[0], ...ids.slice(2)]
  await expectIds(page, moved)
  await positions(page, moved)
  await summary(page, [10, 8, 8])
  await board(page)
  const link = row(page, special.id).getByRole('link', { name: `${special.title} ${special.id}`, exact: true })
  await link.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: special.title, exact: true })).toBeVisible()
  await expect(dialog.getByText(special.assignee, { exact: true })).toBeVisible()
  await expect(dialog.locator('.description p')).toHaveText(special.description)
  await expect(dialog.locator('time')).toHaveAttribute('datetime', special.dueDate)
  await page.keyboard.press('Escape')
  await expect(link).toBeFocused()
  await history(page, 1, 0)
  await readonly(page, writes)
})

test('A02: reset is undoable; boundary and initial reset preserve redo', async ({ page }) => {
  await mount(page, records.slice(0, 3))
  await click(page, `Premakni ${initial[1]} gor`)
  await click(page, `Premakni ${initial[2]} gor`)
  await click(page, 'Razveljavi premik')
  await history(page, 1, 1)
  await click(page, 'Začetni vrstni red')
  await expectIds(page, initial.slice(0, 3))
  await history(page, 2, 0)
  await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
  await click(page, 'Razveljavi premik')
  await expectIds(page, [initial[1], initial[0], initial[2]])
  await history(page, 1, 1)
  await click(page, 'Ponovi premik')
  await expectIds(page, initial.slice(0, 3))
  await click(page, 'Razveljavi premik')
  await click(page, 'Razveljavi premik')
  await history(page, 0, 2)
  for (const name of [`Premakni ${initial[0]} gor`, `Premakni ${initial[2]} dol`, 'Začetni vrstni red', 'Razveljavi premik']) {
    const button = page.getByRole('button', { name, exact: true })
    await expect(button).toBeDisabled()
    await button.evaluate((element: HTMLButtonElement) => { element.click(); element.click() })
  }
  await history(page, 0, 2)
  await expectIds(page, initial.slice(0, 3))
  await click(page, `Premakni ${initial[1]} dol`)
  await expectIds(page, [initial[0], initial[2], initial[1]])
  await history(page, 1, 0)
})

test('A03: 21 distinct moves retain exactly 20 complete undo and redo steps', async ({ page }) => {
  test.setTimeout(60_000)
  const writes = await mount(page, records)
  const snapshots = [initial]
  for (let i = 0; i < 21; i++) {
    await click(page, `Premakni ${initial[24]} gor`)
    const next = [...initial]
    next.splice(24, 1)
    next.splice(23 - i, 0, initial[24])
    snapshots.push(next)
    await expectIds(page, next)
    await history(page, Math.min(i + 1, 20), 0)
  }
  for (let i = 20; i >= 1; i--) {
    await click(page, 'Razveljavi premik')
    await expectIds(page, snapshots[i])
    await history(page, i - 1, 21 - i)
  }
  for (let i = 2; i <= 21; i++) {
    await click(page, 'Ponovi premik')
    await expectIds(page, snapshots[i])
    await history(page, i - 1, 21 - i)
  }
  await click(page, 'Začetni vrstni red')
  await expectIds(page, initial)
  await history(page, 20, 0)
  await click(page, 'Razveljavi premik')
  await expectIds(page, snapshots[21])
  await history(page, 19, 1)
  await readonly(page, writes)
})

test('A04: board uses global neighbors and stable status subsequences', async ({ page }) => {
  const data = records.slice(0, 6)
  const writes = await mount(page, data)
  await board(page)
  // First and second global tasks have different statuses; status columns must not change.
  await click(page, `Premakni ${initial[1]} gor`)
  let ordered = [initial[1], initial[0], ...initial.slice(2, 6)]
  await positions(page, ordered)
  await summary(page, [2, 2, 2])
  for (const [status, label] of [['todo', 'Pripravljeno'], ['in_progress', 'V delu'], ['done', 'Končano']]) {
    await columnIds(page, label, ordered.filter(id => data.find(task => task.id === id)!.status === status))
  }
  // Move a todo task across global neighbors until it precedes the other todo task.
  for (let i = 0; i < 3; i++) await click(page, `Premakni ${initial[3]} gor`)
  ordered = [initial[3], initial[1], initial[0], initial[2], initial[4], initial[5]]
  await columnIds(page, 'Pripravljeno', [initial[3], initial[0]])
  await positions(page, ordered)
  await expect(page.locator('[data-task-id] a button')).toHaveCount(0)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await table(page)
  await expectIds(page, ordered)
  await summary(page, [2, 2, 2])
  await history(page, 4, 0)
  await readonly(page, writes)
})

test('A05: both histories survive views and details, projects and refresh reset them', async ({ page }) => {
  const data = [...records.slice(0, 4), makeTask('other-project', { projectId: 'launch' })]
  const writes = await mount(page, data)
  await click(page, `Premakni ${initial[1]} gor`)
  await click(page, `Premakni ${initial[2]} gor`)
  await click(page, 'Razveljavi premik')
  const current = [initial[1], initial[0], initial[2], initial[3]]
  for (const view of ['board', 'table'] as const) {
    if (view === 'board') await board(page)
    else await table(page)
    await positions(page, current)
    await history(page, 1, 1)
    await row(page, initial[1]).getByRole('link').click()
    await expect(page.getByRole('dialog').getByText(records[1].assignee, { exact: true })).toBeVisible()
    await click(page, 'Zapri podrobnosti')
    await history(page, 1, 1)
  }
  await project(page, 'launch')
  await expectIds(page, ['other-project'])
  await history(page, 0, 0)
  await project(page, 'web')
  await expectIds(page, initial.slice(0, 4))
  await history(page, 0, 0)
  await click(page, `Premakni ${initial[0]} dol`)
  await click(page, `Premakni ${initial[2]} dol`)
  await click(page, 'Razveljavi premik')
  await board(page)
  await row(page, initial[0]).getByRole('link').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.reload()
  await expect(page.getByRole('dialog').getByText(records[0].assignee, { exact: true })).toBeVisible()
  await click(page, 'Zapri podrobnosti')
  await history(page, 0, 0)
  await positions(page, initial.slice(0, 4))
  await readonly(page, writes)
})

for (const size of [0, 1]) {
  test(`A06: project with ${size} tasks has no valid move and both projects may be empty`, async ({ page }) => {
    const writes = await mount(page, records.slice(0, size))
    for (const view of ['table', 'board'] as const) {
      if (view === 'board') await board(page)
      await history(page, 0, 0)
      await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
      await expect(page.locator('[data-task-id]')).toHaveCount(size)
      if (size) {
        await positions(page, [initial[0]])
        await expect(page.getByRole('button', { name: `Premakni ${initial[0]} gor`, exact: true })).toBeDisabled()
        await expect(page.getByRole('button', { name: `Premakni ${initial[0]} dol`, exact: true })).toBeDisabled()
      }
    }
    await project(page, 'launch')
    await history(page, 0, 0)
    await expect(page.getByText('Ni opravil v tem stanju.')).toHaveCount(3)
    await table(page)
    await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
    await readonly(page, writes)
  })
}

test('A07: 390px layout, keyboard controls, plain text and no persistent writes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page, records.slice(0, 4))
  const requests: string[] = []
  page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/__test/')) requests.push(request.url()) })
  await expectIds(page, initial.slice(0, 4))
  const button = page.getByRole('button', { name: `Premakni ${initial[1]} gor`, exact: true })
  await button.focus()
  await expect(button).toBeFocused()
  expect(await button.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe('none')
  await page.keyboard.press('Enter')
  await history(page, 1, 0)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.locator('.task-link b')).toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await board(page)
  await positions(page, [initial[1], initial[0], initial[2], initial[3]])
  await click(page, 'Razveljavi premik')
  await click(page, 'Ponovi premik')
  await click(page, 'Začetni vrstni red')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 })
  expect(requests).toEqual([])
  await readonly(page, writes)
})

test('A08: immutable reducer agrees with a bounded timeline through 600 mixed actions', () => {
  const ids = ['ž', 'same-title-2', 'x / ?#', '4', '5']
  let actual = createOrder(ids)
  // Independent oracle: one chronological timeline and a cursor, not two stacks.
  let timeline = [[...ids]]
  let cursor = 0
  let seed = 74019
  const random = (limit: number) => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % limit }
  function freeze(state: OrderState) {
    state.past.forEach(Object.freeze)
    state.future.forEach(Object.freeze)
    Object.freeze(state.initial)
    Object.freeze(state.present)
    Object.freeze(state.past)
    Object.freeze(state.future)
    Object.freeze(state)
  }
  for (let step = 0; step < 600; step++) {
    const choice = random(10)
    const action: OrderAction = choice < 6
      ? { type: 'move', id: [...ids, 'missing'][random(6)], direction: random(2) ? 1 : -1 }
      : { type: choice < 8 ? 'undo' : choice === 8 ? 'redo' : 'reset' }
    const old = JSON.stringify(actual)
    freeze(actual)
    const next = orderReducer(actual, action)
    expect(JSON.stringify(actual)).toBe(old)
    const current = timeline[cursor]
    if (action.type === 'undo') cursor = Math.max(0, cursor - 1)
    else if (action.type === 'redo') cursor = Math.min(timeline.length - 1, cursor + 1)
    else {
      let target = [...current]
      if (action.type === 'reset') target = [...ids]
      else {
        const index = target.indexOf(action.id)
        const to = index + action.direction
        if (index >= 0 && to >= 0 && to < target.length) {
          target.splice(index, 1)
          target.splice(to, 0, action.id)
        }
      }
      if (target.join('|') !== current.join('|')) {
        timeline = [...timeline.slice(0, cursor + 1), target].slice(-21)
        cursor = timeline.length - 1
      }
    }
    expect(next.present).toEqual(timeline[cursor])
    expect(next.past).toEqual(timeline.slice(0, cursor))
    expect(next.future).toEqual(timeline.slice(cursor + 1).reverse())
    for (const permutation of [next.present, ...next.past, ...next.future]) expect([...permutation].sort()).toEqual([...ids].sort())
    expect(next.past.length).toBeLessThanOrEqual(20)
    actual = next
  }
  // Specifically prove invalid actions preserve a nonempty redo stack.
  const moved = orderReducer(createOrder(ids), { type: 'move', id: ids[0], direction: 1 })
  const undone = orderReducer(moved, { type: 'undo' })
  for (const action of [{ type: 'move', id: ids[0], direction: -1 }, { type: 'move', id: ids.at(-1)!, direction: 1 }, { type: 'move', id: 'missing', direction: 1 }, { type: 'reset' }, { type: 'undo' }] as const) {
    expect(orderReducer(undone, action)).toBe(undone)
  }
})
