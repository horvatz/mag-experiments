import type { Task, TaskStatus } from '../shared/types.ts'

export type ViewStatus = 'all' | TaskStatus
export type ViewOrder = 'original' | 'title-asc' | 'title-desc'

export type ViewState = {
  q: string
  status: ViewStatus
  order: ViewOrder
}

export const DEFAULT_VIEW_STATE: ViewState = { q: '', status: 'all', order: 'original' }

const STATUSES: ViewStatus[] = ['all', 'todo', 'in_progress', 'done']
const ORDERS: ViewOrder[] = ['original', 'title-asc', 'title-desc']

export function normalize(value: string) {
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function parseViewState(query: string) {
  const params = new URLSearchParams(query)
  const status = params.get('status')
  const order = params.get('order')
  return {
    q: params.get('q') ?? '',
    status: STATUSES.find((value) => value === status) ?? 'all',
    order: ORDERS.find((value) => value === order) ?? 'original',
  } satisfies ViewState
}

export function buildViewQuery(state: ViewState, view: 'table' | 'board') {
  const params = new URLSearchParams()
  if (view === 'board') params.set('view', 'board')
  const q = state.q.trim()
  if (q !== '') params.set('q', q)
  if (state.status !== 'all') params.set('status', state.status)
  if (state.order !== 'original') params.set('order', state.order)
  const query = params.toString()
  return query === '' ? '' : `?${query}`
}

export function matchesQuery(task: Task, q: string) {
  const needle = normalize(q)
  if (needle === '') return true
  return [task.title, task.description, task.assignee, task.id].some((field) => normalize(field).includes(needle))
}

export function selectVisibleTasks(tasks: Task[], state: ViewState) {
  const visible = tasks.filter((task) => (state.status === 'all' || task.status === state.status) && matchesQuery(task, state.q))
  if (state.order === 'original') return visible
  const direction = state.order === 'title-asc' ? 1 : -1
  return visible
    .map((task, index) => ({ task, index }))
    .sort((left, right) => {
      const a = normalize(left.task.title)
      const b = normalize(right.task.title)
      const comparison = a < b ? -1 : a > b ? 1 : 0
      return comparison === 0 ? left.index - right.index : comparison * direction
    })
    .map((entry) => entry.task)
}
