import type { Task } from '../shared/types.ts'

export type StatusFilter = 'all' | 'todo' | 'in_progress' | 'done'
export type OrderFilter = 'original' | 'title-asc' | 'title-desc'
export type ViewState = { q: string; status: StatusFilter; order: OrderFilter }

export const defaultViewState: ViewState = { q: '', status: 'all', order: 'original' }

const statuses: StatusFilter[] = ['all', 'todo', 'in_progress', 'done']
const orders: OrderFilter[] = ['original', 'title-asc', 'title-desc']

export function normalize(value: string): string {
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function parseViewState(query: string | undefined): ViewState {
  const params = new URLSearchParams(query ?? '')
  const status = params.get('status')
  const order = params.get('order')
  return {
    q: params.get('q') ?? '',
    status: statuses.includes(status as StatusFilter) ? (status as StatusFilter) : 'all',
    order: orders.includes(order as OrderFilter) ? (order as OrderFilter) : 'original',
  }
}

export function buildHash(projectId: string, taskId: string | null, view: 'table' | 'board', state: ViewState): string {
  const params = new URLSearchParams()
  if (view === 'board') params.set('view', 'board')
  const q = state.q.trim()
  if (q !== '') params.set('q', q)
  if (state.status !== 'all') params.set('status', state.status)
  if (state.order !== 'original') params.set('order', state.order)
  const query = params.toString()
  const path = `#/projects/${encodeURIComponent(projectId)}${taskId ? `/tasks/${encodeURIComponent(taskId)}` : ''}`
  return query === '' ? path : `${path}?${query}`
}

export function matchesQuery(task: Task, q: string): boolean {
  const needle = normalize(q)
  if (needle === '') return true
  return [task.title, task.description, task.assignee, task.id].some((field) => normalize(field).includes(needle))
}

export function visibleTasks(tasks: Task[], state: ViewState): Task[] {
  const filtered = tasks.filter((task) => matchesQuery(task, state.q) && (state.status === 'all' || task.status === state.status))
  if (state.order === 'original') return filtered
  const direction = state.order === 'title-asc' ? 1 : -1
  return [...filtered].sort((a, b) => {
    const left = normalize(a.title)
    const right = normalize(b.title)
    if (left === right) return 0
    return (left < right ? -1 : 1) * direction
  })
}
