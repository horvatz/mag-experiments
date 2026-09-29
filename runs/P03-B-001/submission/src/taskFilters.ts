import type { Task, TaskStatus } from '../shared/types.ts'

export type TaskFilters = { query: string; status: TaskStatus | 'all'; assignee: string }

export const defaultTaskFilters: TaskFilters = { query: '', status: 'all', assignee: 'all' }

function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function filterTasks(tasks: Task[], filters: TaskFilters) {
  const words = normalizeSearch(filters.query).split(/\s+/).filter(Boolean)
  return tasks.filter((task) => {
    const text = normalizeSearch([task.id, task.title, task.description, task.assignee].join(' '))
    return words.every((word) => text.includes(word))
      && (filters.status === 'all' || task.status === filters.status)
      && (filters.assignee === 'all' || task.assignee === filters.assignee)
  })
}
