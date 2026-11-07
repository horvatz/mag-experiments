import type { Task, TaskStatus } from '../shared/types.ts'

export type PageSize = 'all' | 2 | 5 | 10
export type StatusFilter = 'all' | TaskStatus

export const PAGE_SIZES: PageSize[] = ['all', 2, 5, 10]
export const STATUS_FILTERS: StatusFilter[] = ['all', 'todo', 'in_progress', 'done']

export interface Page<T> {
  items: T[]
  page: number
  pageCount: number
  from: number
  to: number
  total: number
}

export function filterTasks(tasks: Task[], filter: StatusFilter): Task[] {
  return filter === 'all' ? tasks : tasks.filter((task) => task.status === filter)
}

export function paginate<T>(items: T[], size: PageSize, requestedPage: number): Page<T> {
  const total = items.length
  if (total === 0) return { items: [], page: 0, pageCount: 0, from: 0, to: 0, total }
  if (size === 'all') return { items, page: 1, pageCount: 1, from: 1, to: total, total }
  const pageCount = Math.ceil(total / size)
  const page = Math.min(Math.max(1, requestedPage), pageCount)
  const from = (page - 1) * size + 1
  const to = Math.min(page * size, total)
  return { items: items.slice(from - 1, to), page, pageCount, from, to, total }
}

export function statusText(result: Page<unknown>): string {
  if (result.total === 0) return 'Stran 0 od 0. Prikazano 0–0 od 0.'
  return `Stran ${result.page} od ${result.pageCount}. Prikazano ${result.from}–${result.to} od ${result.total}.`
}
