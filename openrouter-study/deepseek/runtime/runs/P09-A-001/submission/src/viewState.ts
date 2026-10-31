import type { Task, TaskStatus } from '../shared/types.ts'

export type StatusFilter = 'all' | TaskStatus
export type TaskOrder = 'original' | 'title-asc' | 'title-desc'

export interface ViewState {
  q: string
  status: StatusFilter
  order: TaskOrder
}

export const DEFAULT_VIEW_STATE: ViewState = { q: '', status: 'all', order: 'original' }

const STATUS_FILTERS: StatusFilter[] = ['all', 'todo', 'in_progress', 'done']
const TASK_ORDERS: TaskOrder[] = ['original', 'title-asc', 'title-desc']

export function normalizeText(value: string) {
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function parseViewState(query: string): ViewState {
  const params = new URLSearchParams(query)
  const status = params.get('status')
  const order = params.get('order')
  return {
    q: (params.get('q') ?? '').trim(),
    status: STATUS_FILTERS.includes(status as StatusFilter) ? (status as StatusFilter) : 'all',
    order: TASK_ORDERS.includes(order as TaskOrder) ? (order as TaskOrder) : 'original',
  }
}

export function buildViewQuery(view: 'table' | 'board', state: ViewState) {
  const params = new URLSearchParams()
  if (view === 'board') params.set('view', 'board')
  const phrase = state.q.trim()
  if (phrase) params.set('q', phrase)
  if (state.status !== 'all') params.set('status', state.status)
  if (state.order !== 'original') params.set('order', state.order)
  return params.toString()
}

export function filterTasks(tasks: Task[], state: ViewState): Task[] {
  const phrase = normalizeText(state.q)
  const matches = tasks.filter((task) => {
    if (state.status !== 'all' && task.status !== state.status) return false
    if (!phrase) return true
    return [task.title, task.description, task.assignee, task.id].some((value) => normalizeText(value).includes(phrase))
  })
  if (state.order === 'original') return matches
  const direction = state.order === 'title-asc' ? 1 : -1
  return matches.sort((left, right) => {
    const a = normalizeText(left.title)
    const b = normalizeText(right.title)
    if (a === b) return 0
    return (a < b ? -1 : 1) * direction
  })
}
