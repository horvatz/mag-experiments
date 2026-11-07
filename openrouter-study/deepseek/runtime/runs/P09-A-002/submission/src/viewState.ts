import type { Task, TaskStatus } from '../shared/types.ts'

export type StatusFilter = 'all' | TaskStatus
export type SortOrder = 'original' | 'title-asc' | 'title-desc'

export interface ViewState {
  q: string
  status: StatusFilter
  order: SortOrder
}

export const DEFAULT_VIEW_STATE: ViewState = { q: '', status: 'all', order: 'original' }

export function normalizeText(value: string) {
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function parseViewState(params: URLSearchParams): ViewState {
  const status = params.get('status')
  const order = params.get('order')
  return {
    q: params.get('q') ?? '',
    status: status === 'todo' || status === 'in_progress' || status === 'done' ? status : 'all',
    order: order === 'title-asc' || order === 'title-desc' ? order : 'original',
  }
}

export function sameViewState(left: ViewState, right: ViewState) {
  return left.q === right.q && left.status === right.status && left.order === right.order
}

export function isDefaultViewState(state: ViewState) {
  return state.q.trim() === '' && state.status === 'all' && state.order === 'original'
}

export function filterTasks(tasks: Task[], state: ViewState) {
  const phrase = normalizeText(state.q)
  const matched = tasks.filter((task) => {
    if (state.status !== 'all' && task.status !== state.status) return false
    if (phrase === '') return true
    return [task.title, task.description, task.assignee, task.id].some((field) => normalizeText(field).includes(phrase))
  })
  if (state.order === 'original') return matched
  const direction = state.order === 'title-asc' ? 1 : -1
  return [...matched].sort((left, right) => {
    const a = normalizeText(left.title)
    const b = normalizeText(right.title)
    if (a === b) return 0
    return (a < b ? -1 : 1) * direction
  })
}
