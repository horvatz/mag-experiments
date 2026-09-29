import type { Task } from '../shared/types.ts'
import type { TaskFilters } from './navigation.ts'

export function normalizeSearch(value: string) {
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function filterTasks(tasks: Task[], filters: TaskFilters) {
  const query = normalizeSearch(filters.q)
  const matches = tasks.map((task, index) => ({ task, index })).filter(({ task }) =>
    (filters.status === 'all' || task.status === filters.status) &&
    (!query || [task.title, task.description, task.assignee, task.id].some((value) => normalizeSearch(value).includes(query))),
  )
  if (filters.order === 'original') return matches.map(({ task }) => task)
  const direction = filters.order === 'title-asc' ? 1 : -1
  matches.sort((a, b) => {
    const left = normalizeSearch(a.task.title), right = normalizeSearch(b.task.title)
    const comparison = left < right ? -1 : left > right ? 1 : 0
    return comparison === 0 ? a.index - b.index : comparison * direction
  })
  return matches.map(({ task }) => task)
}
