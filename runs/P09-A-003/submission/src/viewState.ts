import type { Task, TaskStatus } from '../shared/types.ts'

export type ViewStatus = 'all' | TaskStatus
export type ViewOrder = 'original' | 'title-asc' | 'title-desc'
export interface ViewState { q: string; status: ViewStatus; order: ViewOrder }

export const defaultViewState: ViewState = { q: '', status: 'all', order: 'original' }

export function readViewState(params: URLSearchParams): ViewState {
  const status = params.get('status')
  const order = params.get('order')
  return {
    q: (params.get('q') ?? '').trim(),
    status: status === 'todo' || status === 'in_progress' || status === 'done' ? status : 'all',
    order: order === 'title-asc' || order === 'title-desc' ? order : 'original',
  }
}

export function sameViewState(a: ViewState, b: ViewState) {
  return a.q === b.q && a.status === b.status && a.order === b.order
}

export function normalizeSearch(value: string) {
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function visibleTasks(tasks: Task[], state: ViewState) {
  const phrase = normalizeSearch(state.q)
  const filtered = tasks.filter(task =>
    (state.status === 'all' || task.status === state.status) &&
    [task.title, task.description, task.assignee, task.id].some(value => normalizeSearch(value).includes(phrase)),
  )
  if (state.order === 'original') return filtered
  // Array.sort is stable: equal normalized titles retain API order in both directions.
  const direction = state.order === 'title-asc' ? 1 : -1
  return filtered.sort((a, b) => {
    const first = normalizeSearch(a.title), second = normalizeSearch(b.title)
    return (first < second ? -1 : first > second ? 1 : 0) * direction
  })
}
