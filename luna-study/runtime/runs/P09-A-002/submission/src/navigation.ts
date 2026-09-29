import { useSyncExternalStore } from 'react'

export type TaskView = 'table' | 'board'
export type StatusFilter = 'all' | 'todo' | 'in_progress' | 'done'
export type OrderFilter = 'original' | 'title-asc' | 'title-desc'
export type ViewFilters = { q: string; status: StatusFilter; order: OrderFilter }

export const DEFAULT_FILTERS: ViewFilters = { q: '', status: 'all', order: 'original' }

const statuses: StatusFilter[] = ['all', 'todo', 'in_progress', 'done']
const orders: OrderFilter[] = ['original', 'title-asc', 'title-desc']

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

function queryFor(view: TaskView, filters: ViewFilters = DEFAULT_FILTERS) {
  const params = new URLSearchParams()
  if (view === 'board') params.set('view', 'board')
  if (filters.q.trim()) params.set('q', filters.q.trim())
  if (filters.status !== 'all') params.set('status', filters.status)
  if (filters.order !== 'original') params.set('order', filters.order)
  const query = params.toString()
  return query ? `?${query}` : ''
}

export function projectUrl(projectId: string, view: TaskView = 'table', filters: ViewFilters = DEFAULT_FILTERS) {
  return `#/projects/${encodeURIComponent(projectId)}${queryFor(view, filters)}`
}

export function taskUrl(projectId: string, taskId: string, view: TaskView = 'table', filters: ViewFilters = DEFAULT_FILTERS) {
  return `#/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}${queryFor(view, filters)}`
}

function parseFilters(params: URLSearchParams): ViewFilters {
  const rawStatus = params.get('status')
  const rawOrder = params.get('order')
  return {
    q: (params.get('q') ?? '').trim(),
    status: statuses.includes(rawStatus as StatusFilter) ? rawStatus as StatusFilter : 'all',
    order: orders.includes(rawOrder as OrderFilter) ? rawOrder as OrderFilter : 'original',
  }
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  const split = hash.indexOf('?')
  const path = split === -1 ? hash : hash.slice(0, split)
  const params = new URLSearchParams(split === -1 ? '' : hash.slice(split + 1))
  const view: TaskView = params.get('view') === 'board' ? 'board' : 'table'
  const filters = parseFilters(params)
  if (!path || path === '#' || path === '#/') return { projectId: 'web', taskId: null, view, filters }
  const match = path.match(/^#\/projects\/([^/]+)(?:\/tasks\/([^/]+))?$/)
  if (!match) return null
  try {
    return { projectId: decodeURIComponent(match[1]), taskId: match[2] ? decodeURIComponent(match[2]) : null, view, filters }
  } catch {
    return null
  }
}
