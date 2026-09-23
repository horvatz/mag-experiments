import type { Task, TaskStatus } from '../shared/types.ts'

export type TaskFilterValues = {
  query: string
  status: TaskStatus | 'all'
  assignee: string
}

export const defaultTaskFilters: TaskFilterValues = { query: '', status: 'all', assignee: 'all' }

function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function filterTasks(tasks: Task[], filters: TaskFilterValues) {
  const words = normalizeSearch(filters.query).split(/\s+/).filter(Boolean)
  return tasks.filter((task) => {
    if (filters.status !== 'all' && task.status !== filters.status) return false
    if (filters.assignee !== 'all' && task.assignee !== filters.assignee) return false
    const text = normalizeSearch([task.id, task.title, task.description, task.assignee].join(' '))
    return words.every((word) => text.includes(word))
  })
}
