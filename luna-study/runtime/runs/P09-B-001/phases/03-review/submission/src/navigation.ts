import { useSyncExternalStore } from 'react'

export type TaskView = 'table' | 'board'
export type TaskFilterStatus = 'all' | 'todo' | 'in_progress' | 'done'
export type TaskOrder = 'original' | 'title-asc' | 'title-desc'
export type TaskFilters = { q: string; status: TaskFilterStatus; order: TaskOrder }

export const DEFAULT_FILTERS: TaskFilters = { q: '', status: 'all', order: 'original' }

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

function fragmentQuery(hash: string) {
  const queryIndex = hash.indexOf('?')
  return queryIndex < 0 ? '' : hash.slice(queryIndex + 1)
}

function firstParam(params: URLSearchParams, key: string) {
  return params.get(key)
}

export function filtersFromHash(hash: string): TaskFilters {
  const params = new URLSearchParams(fragmentQuery(hash))
  const q = firstParam(params, 'q') ?? ''
  const statusValue = firstParam(params, 'status')
  const orderValue = firstParam(params, 'order')
  const status: TaskFilterStatus = statusValue === 'todo' || statusValue === 'in_progress' || statusValue === 'done' ? statusValue : 'all'
  const order: TaskOrder = orderValue === 'title-asc' || orderValue === 'title-desc' ? orderValue : 'original'
  return { q, status, order }
}

export function viewFromHash(hash: string): TaskView {
  return firstParam(new URLSearchParams(fragmentQuery(hash)), 'view') === 'board' ? 'board' : 'table'
}

function fragment(path: string, view: TaskView, filters: TaskFilters) {
  const params = new URLSearchParams()
  if (view === 'board') params.set('view', 'board')
  if (filters.q !== '') params.set('q', filters.q)
  if (filters.status !== 'all') params.set('status', filters.status)
  if (filters.order !== 'original') params.set('order', filters.order)
  const query = params.toString()
  return `#${path}${query ? `?${query}` : ''}`
}

export function projectUrl(projectId: string, view: TaskView = 'table', filters: TaskFilters = DEFAULT_FILTERS) {
  return fragment(`/projects/${encodeURIComponent(projectId)}`, view, filters)
}

export function taskUrl(projectId: string, taskId: string, view: TaskView = 'table', filters: TaskFilters = DEFAULT_FILTERS) {
  return fragment(`/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}`, view, filters)
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  const queryIndex = hash.indexOf('?')
  const path = queryIndex < 0 ? hash : hash.slice(0, queryIndex)
  const view = viewFromHash(hash)
  const filters = filtersFromHash(hash)
  if (!path || path === '#' || path === '#/') return { projectId: 'web', taskId: null, view, filters, hash }
  const match = path.match(/^#\/projects\/([^/]+)(?:\/tasks\/([^/]+))?$/)
  if (!match) return null
  try {
    return { projectId: decodeURIComponent(match[1]), taskId: match[2] ? decodeURIComponent(match[2]) : null, view, filters, hash }
  } catch {
    return null
  }
}
