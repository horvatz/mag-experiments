import type { Task, TaskStatus } from '../shared/types.ts'

export type StatusFilter = 'all' | TaskStatus

export interface TaskFilters {
  query: string
  status: StatusFilter
  assignee: string
}

export function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  const words = filters.query.trim().split(/\s+/u).filter(Boolean).map(normalizeSearch)
  return tasks.filter((task) => {
    const searchable = normalizeSearch([task.id, task.title, task.description, task.assignee].join(' '))
    const matchesText = words.every((word) => searchable.includes(word))
    const matchesStatus = filters.status === 'all' || task.status === filters.status
    const matchesAssignee = filters.assignee === 'all' || task.assignee === filters.assignee
    return matchesText && matchesStatus && matchesAssignee
  })
}

export function listAssignees(tasks: Task[]): string[] {
  return ['all', ...new Set(tasks.map((task) => task.assignee).filter(Boolean))]
}
