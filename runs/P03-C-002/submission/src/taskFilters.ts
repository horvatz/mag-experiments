import type { Task, TaskStatus } from '../shared/types.ts'

export interface TaskFilters {
  query: string
  status: TaskStatus | 'all'
  assignee: string
}

export const defaultFilters: TaskFilters = { query: '', status: 'all', assignee: 'all' }

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function filterTasks(tasks: readonly Task[], filters: TaskFilters): Task[] {
  const words = normalize(filters.query).split(/\s+/).filter(Boolean)
  return tasks.filter((task) => {
    if (filters.status !== 'all' && task.status !== filters.status) return false
    if (filters.assignee !== 'all' && task.assignee !== filters.assignee) return false
    const text = normalize([task.id, task.title, task.description, task.assignee].join(' '))
    return words.every((word) => text.includes(word))
  })
}
