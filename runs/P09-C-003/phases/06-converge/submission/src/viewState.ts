import type { Task, TaskStatus } from '../shared/types.ts'

export type ViewState = {
  q: string
  status: 'all' | TaskStatus
  order: 'original' | 'title-asc' | 'title-desc'
}

export const defaultViewState: ViewState = { q: '', status: 'all', order: 'original' }

export function parseViewState(params: URLSearchParams): ViewState {
  const status = params.get('status')
  const order = params.get('order')
  return {
    q: params.get('q') ?? '',
    status: status === 'todo' || status === 'in_progress' || status === 'done' ? status : 'all',
    order: order === 'title-asc' || order === 'title-desc' ? order : 'original',
  }
}

export function normalizeText(value: string) {
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function selectTasks(tasks: Task[], state: ViewState) {
  const phrase = normalizeText(state.q)
  const selected = tasks.filter((task) =>
    (state.status === 'all' || state.status === task.status) &&
    [task.title, task.description, task.assignee, task.id].some((field) => normalizeText(field).includes(phrase)),
  )
  if (state.order === 'original') return selected
  // Array.sort is stable: ties retain the API order in either direction.
  return selected.sort((a, b) => {
    const left = normalizeText(a.title)
    const right = normalizeText(b.title)
    const comparison = left < right ? -1 : left > right ? 1 : 0
    return state.order === 'title-desc' ? -comparison : comparison
  })
}
