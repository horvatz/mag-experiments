import type { Task, TaskStatus } from '../shared/types.ts'

export const PAGE_SIZES = ['all', '2', '5', '10'] as const
export const TASK_FILTERS = ['all', 'todo', 'in_progress', 'done'] as const

export type PageSize = (typeof PAGE_SIZES)[number]
export type TaskFilter = (typeof TASK_FILTERS)[number]

export function filterTasks(tasks: Task[], filter: TaskFilter): Task[] {
  return filter === 'all' ? tasks : tasks.filter((task) => task.status === filter)
}

export function countByStatus(tasks: Task[], status: TaskStatus): number {
  return tasks.filter((task) => task.status === status).length
}

export function pageCount(total: number, size: PageSize): number {
  if (total === 0) return 0
  return size === 'all' ? 1 : Math.ceil(total / Number(size))
}

export function pageSlice<T>(items: T[], size: PageSize, page: number): T[] {
  if (items.length === 0 || size === 'all') return items
  const step = Number(size)
  return items.slice((page - 1) * step, page * step)
}

export function pageStatusText(total: number, size: PageSize, page: number): string {
  if (total === 0) return 'Stran 0 od 0. Prikazano 0–0 od 0.'
  const step = size === 'all' ? total : Number(size)
  const first = (page - 1) * step + 1
  const last = Math.min(page * step, total)
  return `Stran ${page} od ${pageCount(total, size)}. Prikazano ${first}–${last} od ${total}.`
}
