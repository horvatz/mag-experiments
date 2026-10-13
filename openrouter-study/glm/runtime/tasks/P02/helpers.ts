import { expect, test as base, type APIRequestContext, type Page } from '@playwright/test'
import type { Snapshot, TaskRecord, TaskStatus } from '../../support/types.ts'

export const labels: Record<TaskStatus, string> = { todo: 'Pripravljeno', in_progress: 'V delu', done: 'Končano' }
type Outcome = 'success' | 'reject' | 'hold-success' | 'hold-reject'

// Test-only transport: serialize next-save + the real server request to make
// per-ID outcomes deterministic even when the candidate saves concurrently.
// A held request waits BEFORE entering that queue, so other IDs may complete.
function createTransport(page: Page, request: APIRequestContext) {
  const plans = new Map<string, Outcome[]>()
  const gates = new Map<string, () => void>()
  const calls: { id: string; body: unknown }[] = []
  let order: Outcome[] = []
  let queue = Promise.resolve()
  let released = false
  const install = page.route('**/api/tasks/*', async (route) => {
    if (route.request().method() !== 'PATCH') return route.continue()
    const id = decodeURIComponent(new URL(route.request().url()).pathname.split('/').at(-1)!)
    const call = { id, body: route.request().postDataJSON() as unknown }
    calls.push(call)
    const outcome = order.shift() ?? plans.get(id)?.shift() ?? 'success'
    if (outcome.startsWith('hold-') && !released) {
      await new Promise<void>((resolve) => gates.set(`${id}:${calls.length}`, resolve))
    }
    const work = queue.then(async () => {
      const control = await request.post('/__test/next-save', { data: { mode: outcome.endsWith('reject') ? 'reject' : 'success' } })
      expect(control.status(), 'P02 test control must accept the planned outcome').toBe(200)
      const response = await route.fetch()
      await route.fulfill({ response })
    })
    queue = work.catch(() => undefined)
    await work
  })
  return {
    calls, install,
    plan(id: string, outcomes: Outcome[]) { plans.set(id, [...outcomes]) },
    inOrder(outcomes: Outcome[]) { order = [...outcomes] },
    releaseAll() { released = true; for (const release of gates.values()) release(); gates.clear() },
  }
}

export const test = base.extend<{ transport: ReturnType<typeof createTransport> }>({
  transport: async ({ page, request }, use) => {
    const transport = createTransport(page, request)
    await transport.install
    try { await use(transport) }
    finally {
      transport.releaseAll()
      await page.unrouteAll({ behavior: 'wait' })
    }
  },
})
export { expect }

export async function snapshot(request: APIRequestContext): Promise<Snapshot> {
  const response = await request.get('/__test/state')
  expect(response.status(), 'Trusted test infrastructure must be available').toBe(200)
  return response.json()
}

export async function reset(request: APIRequestContext) {
  expect((await request.post('/__test/reset')).status()).toBe(200)
}

export function controls(page: Page) {
  return {
    item: (id: string) => page.getByRole('checkbox', { name: `Izberi opravilo ${id}`, exact: true }),
    all: page.getByRole('checkbox', { name: 'Izberi vsa opravila', exact: true }),
    count: page.locator('[aria-label="Število izbranih opravil"]'),
    target: page.getByRole('combobox', { name: 'Novo stanje', exact: true }),
    apply: page.getByRole('button', { name: 'Uporabi za izbrana', exact: true }),
    retry: page.getByRole('button', { name: 'Ponovi neuspele', exact: true }),
    clear: page.getByRole('button', { name: 'Počisti izbor', exact: true }),
    result: page.getByRole('status', { name: 'Rezultat množične spremembe', exact: true }),
    progress: page.getByRole('status', { name: 'Potek množične spremembe', exact: true }),
  }
}

export async function choose(page: Page, ids: string[], target: TaskStatus) {
  const form = controls(page)
  for (const id of ids) await form.item(id).check()
  await form.target.selectOption(target)
  return form
}

export async function summary(page: Page, successful: number, failed: number) {
  await expect(controls(page).result).toHaveText(`Uspešno: ${successful}. Neuspešno: ${failed}.`)
  await expect(controls(page).progress).toBeHidden()
}

export async function onlyStatuses(request: APIRequestContext, before: Snapshot, ids: string[], status: TaskStatus) {
  const after = await snapshot(request)
  expect(after.tasks, 'Only the successful selected IDs may change, and only their status').toEqual(
    before.tasks.map((task) => ids.includes(task.id) ? { ...task, status } : task),
  )
  return after
}

export async function presentation(page: Page, tasks: TaskRecord[], projectId: string, view: 'table' | 'board') {
  const own = tasks.filter((task) => task.projectId === projectId)
  for (const task of own) {
    const item = page.locator(`[data-task-id="${task.id}"]`)
    await expect(item).toContainText(task.title)
    if (view === 'table') await expect(item).toContainText(labels[task.status])
    else await expect(page.getByRole('region', { name: labels[task.status], exact: true }).locator(`[data-task-id="${task.id}"]`)).toHaveCount(1)
  }
  for (const status of Object.keys(labels) as TaskStatus[]) {
    const count = own.filter((task) => task.status === status).length
    await expect(page.locator('[aria-label="Pregled stanj opravil"]')).toContainText(new RegExp(`${labels[status]}\\s*${count}(?:\\s|$)`), { useInnerText: true })
  }
}
