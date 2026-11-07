import type { Task, TaskStatus } from '../shared/types.ts'

export type TaskOrder = 'original' | 'title-asc' | 'title-desc'
export type StatusFilter = TaskStatus | 'all'

export interface ViewFilters {
  q: string
  status: StatusFilter
  order: TaskOrder
}

export const DEFAULT_FILTERS: ViewFilters = { q: '', status: 'all', order: 'original' }

export function normalizeText(value: string) {
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function matchesPhrase(task: Task, phrase: string) {
  const needle = normalizeText(phrase)
  if (needle === '') return true
  return [task.title, task.description, task.assignee, task.id].some((field) => normalizeText(field).includes(needle))
}

export function matchesStatus(task: Task, status: StatusFilter) {
  return status === 'all' || task.status === status
}

export function filterTasks(tasks: Task[], filters: ViewFilters) {
  return tasks.filter((task) => matchesStatus(task, filters.status) && matchesPhrase(task, filters.q))
}

export function orderTasks(tasks: Task[], order: TaskOrder) {
  if (order === 'original') return tasks
  const direction = order === 'title-asc' ? 1 : -1
  return tasks
    .map((task, index) => ({ task, index }))
    .sort((left, right) => {
      const a = normalizeText(left.task.title)
      const b = normalizeText(right.task.title)
      if (a !== b) return a < b ? -direction : direction
      return left.index - right.index
    })
    .map((entry) => entry.task)
}

export function sameFilters(left: ViewFilters, right: ViewFilters) {
  return left.q === right.q && left.status === right.status && left.order === right.order
}
