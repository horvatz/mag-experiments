import { useSyncExternalStore } from 'react'

export type TaskView = 'table' | 'board'
export type TaskStatusFilter = 'all' | 'todo' | 'in_progress' | 'done'
export type TaskOrder = 'original' | 'title-asc' | 'title-desc'
export type TaskFilters = { q: string; status: TaskStatusFilter; order: TaskOrder }

export const defaultFilters: TaskFilters = { q: '', status: 'all', order: 'original' }

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function normalizeFilters(filters: TaskFilters): TaskFilters {
  return {
    q: filters.q.trim(),
    status: ['all', 'todo', 'in_progress', 'done'].includes(filters.status) ? filters.status : 'all',
    order: ['original', 'title-asc', 'title-desc'].includes(filters.order) ? filters.order : 'original',
  }
}

export function filtersEqual(a: TaskFilters, b: TaskFilters) {
  const left = normalizeFilters(a), right = normalizeFilters(b)
  return left.q === right.q && left.status === right.status && left.order === right.order
}

function queryFor(view: TaskView, filters: TaskFilters) {
  const params = new URLSearchParams()
  if (view === 'board') params.set('view', 'board')
  const committed = normalizeFilters(filters)
  if (committed.q) params.set('q', committed.q)
  if (committed.status !== 'all') params.set('status', committed.status)
  if (committed.order !== 'original') params.set('order', committed.order)
  const query = params.toString()
  return query ? `?${query}` : ''
}

export function projectUrl(projectId: string, view: TaskView = 'table', filters: TaskFilters = defaultFilters) {
  return `#/projects/${encodeURIComponent(projectId)}${queryFor(view, filters)}`
}

export function taskUrl(projectId: string, taskId: string, view: TaskView = 'table', filters: TaskFilters = defaultFilters) {
  return `#/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}${queryFor(view, filters)}`
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  const separator = hash.indexOf('?')
  const path = separator < 0 ? hash : hash.slice(0, separator)
  const query = separator < 0 ? '' : hash.slice(separator + 1)
  const params = new URLSearchParams(query)
  const view: TaskView = params.get('view') === 'board' ? 'board' : 'table'
  const rawStatus = params.get('status')
  const rawOrder = params.get('order')
  const filters: TaskFilters = {
    q: params.get('q') ?? '',
    status: rawStatus && ['all', 'todo', 'in_progress', 'done'].includes(rawStatus) ? rawStatus as TaskStatusFilter : 'all',
    order: rawOrder && ['original', 'title-asc', 'title-desc'].includes(rawOrder) ? rawOrder as TaskOrder : 'original',
  }
  if (!path || path === '#' || path === '#/') return { projectId: 'web', taskId: null, view, filters, hash }
  const match = path.match(/^#\/projects\/([^/]+)(?:\/tasks\/([^/]+))?$/)
  if (!match) return null
  try {
    return { projectId: decodeURIComponent(match[1]), taskId: match[2] ? decodeURIComponent(match[2]) : null, view, filters, hash }
  } catch {
    return null
  }
}
