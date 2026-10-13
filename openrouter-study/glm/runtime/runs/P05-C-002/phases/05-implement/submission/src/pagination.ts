import type { Task, TaskStatus } from '../shared/types.ts'

export type PageSize = 'all' | '2' | '5' | '10'
export type TaskFilter = 'all' | TaskStatus

export interface Pagination {
  filteredTasks: Task[]
  visibleTasks: Task[]
  total: number
  pageCount: number
  currentPage: number
  status: string
}

export function paginateTasks(tasks: readonly Task[], filter: TaskFilter, pageSize: PageSize, pageNumber: number): Pagination {
  const filteredTasks = filter === 'all' ? [...tasks] : tasks.filter((task) => task.status === filter)
  const total = filteredTasks.length
  const numericPageSize = pageSize === 'all' ? total : Number(pageSize)
  const pageCount = total === 0 ? 0 : Math.max(1, Math.ceil(total / numericPageSize))
  const currentPage = pageCount === 0 ? 0 : Math.min(Math.max(1, pageNumber), pageCount)
  const startIndex = currentPage === 0 ? 0 : (currentPage - 1) * numericPageSize
  const endIndex = currentPage === 0 ? 0 : Math.min(startIndex + numericPageSize, total)
  const visibleTasks = filteredTasks.slice(startIndex, endIndex)
  const status = currentPage === 0
    ? `Stran 0 od 0. Prikazano 0–0 od 0.`
    : `Stran ${currentPage} od ${pageCount}. Prikazano ${startIndex + 1}–${endIndex} od ${total}.`

  return { filteredTasks, visibleTasks, total, pageCount, currentPage, status }
}
