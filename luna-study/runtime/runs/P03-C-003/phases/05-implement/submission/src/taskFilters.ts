import type { Task, TaskStatus } from '../shared/types.ts'

export type TaskFilters = {
  query: string
  status: TaskStatus | 'all'
  assignee: string
}

export function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function getAssignees(tasks: Task[]): string[] {
  return [...new Set(tasks.map((task) => task.assignee).filter((name) => name.length > 0))]
}

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  const words = filters.query.split(/\s+/u).filter(Boolean).map(normalizeSearch)

  return tasks.filter((task) => {
    if (filters.status !== 'all' && task.status !== filters.status) return false
    if (filters.assignee !== 'all' && task.assignee !== filters.assignee) return false

    const searchableText = normalizeSearch(`${task.id} ${task.title} ${task.description} ${task.assignee}`)
    return words.every((word) => searchableText.includes(word))
  })
}
