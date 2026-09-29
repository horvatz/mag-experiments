import { useSyncExternalStore } from 'react'

export type TaskView = 'table' | 'board'
export type TaskStatusFilter = 'all' | 'todo' | 'in_progress' | 'done'
export type TaskOrder = 'original' | 'title-asc' | 'title-desc'
export type TaskFilters = { q: string; status: TaskStatusFilter; order: TaskOrder }

export const DEFAULT_FILTERS: TaskFilters = { q: '', status: 'all', order: 'original' }

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

function parseFilters(query: string): TaskFilters {
  const params = new URLSearchParams(query)
  const rawStatus = params.get('status')
  const rawOrder = params.get('order')
  const statuses: TaskStatusFilter[] = ['all', 'todo', 'in_progress', 'done']
  const orders: TaskOrder[] = ['original', 'title-asc', 'title-desc']
  return {
    q: params.get('q') ?? '',
    status: statuses.includes(rawStatus as TaskStatusFilter) ? rawStatus as TaskStatusFilter : 'all',
    order: orders.includes(rawOrder as TaskOrder) ? rawOrder as TaskOrder : 'original',
  }
}

function makeHash(path: string, view: TaskView, filters: TaskFilters) {
  const params = new URLSearchParams()
  if (view === 'board') params.set('view', 'board')
  if (filters.q) params.set('q', filters.q.trim())
  if (filters.status !== 'all') params.set('status', filters.status)
  if (filters.order !== 'original') params.set('order', filters.order)
  const query = params.toString()
  return query ? `${path}?${query}` : path
}

export function projectUrl(projectId: string, view: TaskView = 'table', filters: TaskFilters = DEFAULT_FILTERS) {
  return makeHash(`#/projects/${encodeURIComponent(projectId)}`, view, filters)
}

export function taskUrl(projectId: string, taskId: string, view: TaskView = 'table', filters: TaskFilters = DEFAULT_FILTERS) {
  return makeHash(`#/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}`, view, filters)
}

export function stateUrl(path: string, view: TaskView, filters: TaskFilters) {
  return makeHash(path, view, filters)
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  const [path = '', query = ''] = hash.split('?', 2)
  const view: TaskView = new URLSearchParams(query).get('view') === 'board' ? 'board' : 'table'
  const filters = parseFilters(query)
  if (!path || path === '#' || path === '#/') return { projectId: 'web', taskId: null, view, filters, path: '#/projects/web', hash }
  const match = path.match(/^#\/projects\/([^/]+)(?:\/tasks\/([^/]+))?$/)
  if (!match) return null
  try {
    return { projectId: decodeURIComponent(match[1]), taskId: match[2] ? decodeURIComponent(match[2]) : null, view, filters, path, hash }
  } catch {
    return null
  }
}
