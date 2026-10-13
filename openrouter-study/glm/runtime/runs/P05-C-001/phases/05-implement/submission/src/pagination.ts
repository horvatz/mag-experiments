import type { Task, TaskStatus } from "../shared/types.ts"

export type StatusFilter = "all" | TaskStatus
export type PageSize = "all" | "2" | "5" | "10"

export const pageSizes: PageSize[] = ["all", "2", "5", "10"]
export const statusFilters: StatusFilter[] = ["all", "todo", "in_progress", "done"]

export function filterTasks(tasks: Task[], filter: StatusFilter): Task[] {
  return filter === "all" ? tasks : tasks.filter((task) => task.status === filter)
}

export function pageCount(filteredCount: number, pageSize: PageSize): number {
  if (filteredCount === 0) return 0
  if (pageSize === "all") return 1
  return Math.ceil(filteredCount / Number(pageSize))
}

export function currentPage(requestedPage: number, filteredCount: number, pageSize: PageSize): number {
  return Math.min(Math.max(1, requestedPage), pageCount(filteredCount, pageSize))
}

export function pageSlice(tasks: Task[], page: number, pageSize: PageSize): Task[] {
  if (tasks.length === 0) return []
  if (pageSize === "all") return tasks
  const start = (page - 1) * Number(pageSize)
  return tasks.slice(start, start + Number(pageSize))
}

export function rangeBounds(page: number, filteredCount: number, pageSize: PageSize): { first: number; last: number } {
  if (filteredCount === 0) return { first: 0, last: 0 }
  if (pageSize === "all") return { first: 1, last: filteredCount }
  return { first: (page - 1) * Number(pageSize) + 1, last: Math.min(page * Number(pageSize), filteredCount) }
}

