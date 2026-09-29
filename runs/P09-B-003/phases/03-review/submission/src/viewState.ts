import type { Task, TaskStatus } from '../shared/types.ts'

export type ViewFilters = {
  q: string
  status: 'all' | TaskStatus
  order: 'original' | 'title-asc' | 'title-desc'
}

export const defaultFilters: ViewFilters = { q: '', status: 'all', order: 'original' }

export function readFilters(params: URLSearchParams): ViewFilters {
  const status = params.get('status')
  const order = params.get('order')
  return {
    q: (params.get('q') ?? '').trim(),
    status: status === 'todo' || status === 'in_progress' || status === 'done' ? status : 'all',
    order: order === 'title-asc' || order === 'title-desc' ? order : 'original',
  }
}

export function sameFilters(a: ViewFilters, b: ViewFilters) {
  return a.q === b.q && a.status === b.status && a.order === b.order
}

export function normalizeText(value: string) {
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function visibleTasks(tasks: Task[], filters: ViewFilters): Task[] {
  const phrase = normalizeText(filters.q)
  const matches = tasks.filter((task) =>
    (filters.status === 'all' || task.status === filters.status) &&
    [task.title, task.description, task.assignee, task.id].some((field) => normalizeText(field).includes(phrase)),
  )
  if (filters.order === 'original') return matches
  // Modern Array.sort is stable; equal normalized titles retain API order in both directions.
  return matches.sort((a, b) => {
    const first = normalizeText(a.title)
    const second = normalizeText(b.title)
    const comparison = first < second ? -1 : first > second ? 1 : 0
    return filters.order === 'title-asc' ? comparison : -comparison
  })
}
