import type { Task, TaskStatus } from '../shared/types.ts'

export type PageSize = 'all' | '2' | '5' | '10'
export type StatusFilter = 'all' | TaskStatus

const sizeNumber = (size: PageSize): number | null => (size === 'all' ? null : Number(size))

export function filterTasks(tasks: Task[], filter: StatusFilter): Task[] {
  return filter === 'all' ? tasks : tasks.filter((task) => task.status === filter)
}

export function pageCount(total: number, size: PageSize): number {
  if (total === 0) return 0
  const perPage = sizeNumber(size)
  return perPage === null ? 1 : Math.ceil(total / perPage)
}

export function clampPage(page: number, pages: number): number {
  if (pages === 0) return 0
  return Math.min(Math.max(page, 1), pages)
}

export function pageSlice(tasks: Task[], size: PageSize, page: number): Task[] {
  const perPage = sizeNumber(size)
  if (perPage === null) return tasks
  const start = (page - 1) * perPage
  return tasks.slice(start, start + perPage)
}

export function pageBounds(total: number, size: PageSize, page: number): { from: number; to: number } {
  if (total === 0) return { from: 0, to: 0 }
  const perPage = sizeNumber(size)
  if (perPage === null) return { from: 1, to: total }
  return { from: (page - 1) * perPage + 1, to: Math.min(page * perPage, total) }
}

export function statusText(total: number, size: PageSize, page: number): string {
  const pages = pageCount(total, size)
  const { from, to } = pageBounds(total, size, page)
  return "Stran " + (pages === 0 ? 0 : page) + " od " + pages + ". Prikazano " + from + "–" + to + " od " + total + "."
}
