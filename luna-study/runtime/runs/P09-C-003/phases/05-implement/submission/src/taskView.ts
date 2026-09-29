import type { Task } from '../shared/types.ts'
import type { TaskFilters } from './navigation.ts'

export function normalizeSearchText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function selectTasks(tasks: Task[], filters: TaskFilters) {
  const query = normalizeSearchText(filters.q.trim())
  const selected = tasks.map((task, index) => ({ task, index })).filter(({ task }) => {
    const matchesStatus = filters.status === 'all' || task.status === filters.status
    const matchesQuery = !query || [task.title, task.description, task.assignee, task.id]
      .some(value => normalizeSearchText(value).includes(query))
    return matchesStatus && matchesQuery
  })

  if (filters.order !== 'original') {
    selected.sort((left, right) => {
      const a = normalizeSearchText(left.task.title)
      const b = normalizeSearchText(right.task.title)
      const compared = a < b ? -1 : a > b ? 1 : 0
      return (filters.order === 'title-desc' ? -compared : compared) || left.index - right.index
    })
  }
  return selected.map(({ task }) => task)
}
