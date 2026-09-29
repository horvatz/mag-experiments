import { useSyncExternalStore } from 'react'
import type { TaskStatus } from '../shared/types.ts'

export type TaskView = 'table' | 'board'
export type StatusFilter = 'all' | TaskStatus
export type TaskOrder = 'original' | 'title-asc' | 'title-desc'
export type ViewFilters = { q: string; status: StatusFilter; order: TaskOrder }

export const DEFAULT_FILTERS: ViewFilters = { q: '', status: 'all', order: 'original' }
const statuses: StatusFilter[] = ['all', 'todo', 'in_progress', 'done']
const orders: TaskOrder[] = ['original', 'title-asc', 'title-desc']

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

function queryString(view: TaskView, filters: ViewFilters) {
  const params = new URLSearchParams()
  if (view === 'board') params.set('view', 'board')
  const q = filters.q.trim()
  if (q) params.set('q', q)
  if (filters.status !== 'all') params.set('status', filters.status)
  if (filters.order !== 'original') params.set('order', filters.order)
  const query = params.toString()
  return query ? `?${query}` : ''
}

export function projectUrl(projectId: string, view: TaskView = 'table', filters: ViewFilters = DEFAULT_FILTERS) {
  return `#/projects/${encodeURIComponent(projectId)}${queryString(view, filters)}`
}

export function taskUrl(projectId: string, taskId: string, view: TaskView = 'table', filters: ViewFilters = DEFAULT_FILTERS) {
  return `#/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}${queryString(view, filters)}`
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  const [path, query] = hash.split('?')
  const params = new URLSearchParams(query)
  const view: TaskView = params.get('view') === 'board' ? 'board' : 'table'
  const rawStatus = params.get('status')
  const rawOrder = params.get('order')
  const filters: ViewFilters = {
    q: params.get('q') ?? '',
    status: statuses.includes(rawStatus as StatusFilter) ? rawStatus as StatusFilter : 'all',
    order: orders.includes(rawOrder as TaskOrder) ? rawOrder as TaskOrder : 'original',
  }
  if (!path || path === '#' || path === '#/') return { projectId: 'web', taskId: null, view, ...filters }
  const match = path.match(/^#\/projects\/([^/]+)(?:\/tasks\/([^/]+))?$/)
  if (!match) return null
  try {
    return { projectId: decodeURIComponent(match[1]), taskId: match[2] ? decodeURIComponent(match[2]) : null, view, ...filters }
  } catch {
    return null
  }
}
