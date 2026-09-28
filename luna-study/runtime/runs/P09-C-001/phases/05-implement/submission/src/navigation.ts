import { useSyncExternalStore } from 'react'

export type TaskView = 'table' | 'board'
export type FilterStatus = 'all' | 'todo' | 'in_progress' | 'done'
export type TaskOrder = 'original' | 'title-asc' | 'title-desc'
export type ViewFilters = { q: string; status: FilterStatus; order: TaskOrder }
export const DEFAULT_FILTERS: ViewFilters = { q: '', status: 'all', order: 'original' }

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function parseFilters(query: string): ViewFilters {
  const params = new URLSearchParams(query)
  const status = params.get('status')
  const order = params.get('order')
  return {
    q: (params.get('q') ?? '').trim(),
    status: status === 'todo' || status === 'in_progress' || status === 'done' ? status : 'all',
    order: order === 'title-asc' || order === 'title-desc' ? order : 'original',
  }
}

function queryString(view: TaskView, filters: ViewFilters) {
  const params = new URLSearchParams()
  if (view === 'board') params.set('view', 'board')
  const q = filters.q.trim()
  if (q) params.set('q', q)
  if (filters.status !== 'all') params.set('status', filters.status)
  if (filters.order !== 'original') params.set('order', filters.order)
  const value = params.toString()
  return value ? `?${value}` : ''
}

export function projectUrl(projectId: string, view: TaskView = 'table', filters: ViewFilters = DEFAULT_FILTERS) {
  return `#/projects/${encodeURIComponent(projectId)}${queryString(view, filters)}`
}

export function taskUrl(projectId: string, taskId: string, view: TaskView = 'table', filters: ViewFilters = DEFAULT_FILTERS) {
  return `#/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}${queryString(view, filters)}`
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  const queryIndex = hash.indexOf('?')
  const path = queryIndex < 0 ? hash : hash.slice(0, queryIndex)
  const query = queryIndex < 0 ? '' : hash.slice(queryIndex + 1)
  const params = new URLSearchParams(query)
  const view: TaskView = params.get('view') === 'board' ? 'board' : 'table'
  const filters = parseFilters(query)
  if (!path || path === '#' || path === '#/') return { projectId: 'web', taskId: null, view, filters, hash }
  const match = path.match(/^#\/projects\/([^/]+)(?:\/tasks\/([^/]+))?$/)
  if (!match) return null
  try {
    return { projectId: decodeURIComponent(match[1]), taskId: match[2] ? decodeURIComponent(match[2]) : null, view, filters, hash }
  } catch {
    return null
  }
}
