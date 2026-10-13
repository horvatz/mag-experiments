import { expect, type APIRequestContext, type Page } from '@playwright/test'
import type { Snapshot, TaskRecord, TaskStatus } from '../../support/types.ts'

export type View = 'table' | 'board'
export const labels: Record<TaskStatus, string> = { todo: 'Pripravljeno', in_progress: 'V delu', done: 'Končano' }

export async function snapshot(request: APIRequestContext): Promise<Snapshot> {
  const response = await request.get('/__test/state')
  expect(response.status(), 'Trusted test infrastructure must be available').toBe(200)
  return response.json()
}

export async function reset(request: APIRequestContext) {
  expect((await request.post('/__test/reset')).status()).toBe(200)
}

export function controls(page: Page) {
  const dialog = page.getByRole('dialog')
  return {
    dialog,
    title: dialog.getByRole('textbox', { name: 'Naslov', exact: true }),
    status: dialog.getByRole('combobox', { name: 'Stanje', exact: true }),
    save: dialog.getByRole('button', { name: 'Shrani', exact: true }),
    cancel: dialog.getByRole('button', { name: 'Prekliči', exact: true }),
  }
}

export async function openEditor(page: Page, task: TaskRecord, view: View = 'table') {
  await page.goto(`/#/projects/${task.projectId}/tasks/${task.id}${view === 'board' ? '?view=board' : ''}`)
  await page.getByRole('dialog').getByRole('button', { name: 'Uredi', exact: true }).click()
  const form = controls(page)
  await expect(form.title).toBeVisible()
  return form
}

export async function assertOnlyUpdate(request: APIRequestContext, before: Snapshot, id: string, title: string, status: TaskStatus) {
  const after = await snapshot(request)
  const expected = before.tasks.map((task) => task.id === id ? { ...task, title, status } : task)
  expect(after.tasks).toEqual(expected)
  return after
}

export async function assertPresentation(page: Page, task: TaskRecord, all: TaskRecord[], view: View) {
  const form = controls(page)
  await expect(form.title).toBeHidden()
  await expect(form.dialog.getByRole('heading', { name: task.title, exact: true })).toBeVisible()
  await expect(form.dialog.getByText(labels[task.status], { exact: true })).toBeVisible()
  const item = page.locator(`[data-task-id="${task.id}"]`)
  await expect(item).toContainText(task.title)
  if (view === 'table') await expect(item).toContainText(labels[task.status])
  else {
    const column = page.getByRole('region', { name: labels[task.status], exact: true, includeHidden: true })
    await expect(column.locator(`[data-task-id="${task.id}"]`)).toHaveCount(1)
  }
  const counters = page.locator('[aria-label="Pregled stanj opravil"]')
  for (const status of Object.keys(labels) as TaskStatus[]) {
    const count = all.filter((entry) => entry.projectId === task.projectId && entry.status === status).length
    await expect(counters).toContainText(new RegExp(`${labels[status]}\\s*${count}(?:\\s|$)`), { useInnerText: true })
  }
}
