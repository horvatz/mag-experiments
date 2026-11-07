import type { Task, TaskStatus } from '../shared/types.ts'

export type PageSize = 'all' | '2' | '5' | '10'
export type StatusFilter = 'all' | TaskStatus

export function filterTasks(tasks: Task[], filter: StatusFilter): Task[] {
  return filter === 'all' ? tasks : tasks.filter((task) => task.status === filter)
}

export function pageCount(total: number, size: PageSize): number {
  if (total === 0) return 0
  if (size === 'all') return 1
  return Math.ceil(total / Number(size))
}

export function clampPage(page: number, pages: number): number {
  return Math.min(Math.max(page, 1), Math.max(pages, 1))
}

export function pageSlice(tasks: Task[], size: PageSize, page: number): Task[] {
  if (size === 'all') return tasks
  const step = Number(size)
  return tasks.slice((page - 1) * step, page * step)
}

export function pageBounds(total: number, size: PageSize, page: number) {
  if (total === 0) return { first: 0, last: 0 }
  const step = size === 'all' ? total : Number(size)
  return { first: (page - 1) * step + 1, last: Math.min(total, page * step) }
}

export function pageStatus(page: number, pages: number, total: number, size: PageSize): string {
  const { first, last } = pageBounds(total, size, page)
  return `Stran ${total === 0 ? 0 : page} od ${pages}. Prikazano ${first}–${last} od ${total}.`
}
