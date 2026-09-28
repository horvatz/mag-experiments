import type { Task, TaskStatus } from '../shared/types.ts'

export type TaskFilters = {
  query: string
  status: TaskStatus | 'all'
  assignee: string
}

function fold(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function getAssignees(tasks: Task[]) {
  return [...new Set(tasks.map((task) => task.assignee).filter((name) => name.trim() !== ''))]
}

export function filterTasks(tasks: Task[], filters: TaskFilters) {
  const words = filters.query.trim().split(/\s+/).filter(Boolean).map(fold)
  return tasks.filter((task) => {
    const searchable = fold(`${task.id} ${task.title} ${task.description} ${task.assignee}`)
    return words.every((word) => searchable.includes(word))
      && (filters.status === 'all' || task.status === filters.status)
      && (filters.assignee === 'all' || task.assignee === filters.assignee)
  })
}
