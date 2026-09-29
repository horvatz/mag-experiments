import { useSyncExternalStore } from 'react'
import type { TaskStatus } from '../shared/types.ts'

export type TaskView = 'table' | 'board'
export type FilterStatus = 'all' | TaskStatus
export type FilterOrder = 'original' | 'title-asc' | 'title-desc'

export interface TaskFilters {
  q: string
  status: FilterStatus
  order: FilterOrder
}

export interface RouteState extends TaskFilters {
  projectId: string
  taskId: string | null
  view: TaskView
  hash: string
}

export const defaultFilters: TaskFilters = { q: '', status: 'all', order: 'original' }

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

function queryString(view: TaskView, filters?: TaskFilters) {
  const params = new URLSearchParams()
  if (view === 'board') params.set('view', 'board')
  if (filters) {
    const q = filters.q.trim()
    if (q) params.set('q', q)
    if (filters.status !== 'all') params.set('status', filters.status)
    if (filters.order !== 'original') params.set('order', filters.order)
  }
  const query = params.toString()
  return query ? `?${query}` : ''
}

export function projectUrl(projectId: string, view: TaskView = 'table', filters?: TaskFilters) {
  return `#/projects/${encodeURIComponent(projectId)}${queryString(view, filters)}`
}

export function taskUrl(projectId: string, taskId: string, view: TaskView = 'table', filters?: TaskFilters) {
  return `#/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}${queryString(view, filters)}`
}

function parseFilters(params: URLSearchParams): TaskFilters {
  const rawStatus = params.get('status')
  const status: FilterStatus = rawStatus === 'todo' || rawStatus === 'in_progress' || rawStatus === 'done' ? rawStatus : 'all'
  const rawOrder = params.get('order')
  const order: FilterOrder = rawOrder === 'title-asc' || rawOrder === 'title-desc' ? rawOrder : 'original'
  return { q: params.get('q') ?? '', status, order }
}

export function parseRoute(hash: string): RouteState | null {
  const queryIndex = hash.indexOf('?')
  const path = queryIndex < 0 ? hash : hash.slice(0, queryIndex)
  const query = queryIndex < 0 ? '' : hash.slice(queryIndex + 1)
  const params = new URLSearchParams(query)
  const view: TaskView = params.get('view') === 'board' ? 'board' : 'table'
  const filters = parseFilters(params)
  if (!path || path === '#' || path === '#/') return { projectId: 'web', taskId: null, view, ...filters, hash }
  const match = path.match(/^#\/projects\/([^/]+)(?:\/tasks\/([^/]+))?$/)
  if (!match) return null
  try {
    return {
      projectId: decodeURIComponent(match[1]),
      taskId: match[2] ? decodeURIComponent(match[2]) : null,
      view,
      ...filters,
      hash,
    }
  } catch {
    return null
  }
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  return parseRoute(hash)
}
