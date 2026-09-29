import type { Task } from '../shared/types.ts'
import type { ViewFilters } from './navigation.ts'

function norm(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function compare(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0
}

export function selectTasks(tasks: Task[], filters: ViewFilters): Task[] {
  const q = norm(filters.q.trim())
  const selected = tasks.filter((task) => {
    const searchMatch = !q || [task.title, task.description, task.assignee, task.id].some((value) => norm(value).includes(q))
    return searchMatch && (filters.status === 'all' || task.status === filters.status)
  })
  if (filters.order === 'original') return selected
  return selected.map((task, index) => ({ task, index, title: norm(task.title) }))
    .sort((a, b) => (filters.order === 'title-asc' ? compare(a.title, b.title) : compare(b.title, a.title)) || a.index - b.index)
    .map(({ task }) => task)
}
