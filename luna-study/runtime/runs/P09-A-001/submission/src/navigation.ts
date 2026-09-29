import { useSyncExternalStore } from 'react'
import type { TaskStatus } from '../shared/types.ts'

export type TaskView = 'table' | 'board'
export type FilterStatus = 'all' | TaskStatus
export type TaskOrder = 'original' | 'title-asc' | 'title-desc'
export interface ViewFilters { q: string; status: FilterStatus; order: TaskOrder }

export const defaultFilters: ViewFilters = { q: '', status: 'all', order: 'original' }

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  window.addEventListener('popstate', onChange)
  return () => {
    window.removeEventListener('hashchange', onChange)
    window.removeEventListener('popstate', onChange)
  }
}

export function readRoute(hash = window.location.hash) {
  const question = hash.indexOf('?')
  const path = question < 0 ? hash : hash.slice(0, question)
  const params = new URLSearchParams(question < 0 ? '' : hash.slice(question + 1))
  const view: TaskView = params.get('view') === 'board' ? 'board' : 'table'
  const rawStatus = params.get('status')
  const status: FilterStatus = rawStatus === 'todo' || rawStatus === 'in_progress' || rawStatus === 'done' ? rawStatus : 'all'
  const rawOrder = params.get('order')
  const order: TaskOrder = rawOrder === 'title-asc' || rawOrder === 'title-desc' ? rawOrder : 'original'
  const filters: ViewFilters = { q: params.get('q') ?? '', status, order }
  if (!path || path === '#' || path === '#/') return { projectId: 'web', taskId: null, view, filters }
  const match = path.match(/^#\/projects\/([^/]+)(?:\/tasks\/([^/]+))?$/)
  if (!match) return null
  try {
    return { projectId: decodeURIComponent(match[1]), taskId: match[2] ? decodeURIComponent(match[2]) : null, view, filters }
  } catch {
    return null
  }
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  return readRoute(hash)
}

function queryFor(view: TaskView, filters: ViewFilters = defaultFilters) {
  const params = new URLSearchParams()
  if (view === 'board') params.set('view', 'board')
  const q = filters.q.trim()
  if (q) params.set('q', q)
  if (filters.status !== 'all') params.set('status', filters.status)
  if (filters.order !== 'original') params.set('order', filters.order)
  const query = params.toString()
  return query ? `?${query}` : ''
}

export function projectUrl(projectId: string, view: TaskView = 'table', filters: ViewFilters = defaultFilters) {
  return `#/projects/${encodeURIComponent(projectId)}${queryFor(view, filters)}`
}

export function taskUrl(projectId: string, taskId: string, view: TaskView = 'table', filters: ViewFilters = defaultFilters) {
  return `#/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}${queryFor(view, filters)}`
}

export function filtersEqual(left: ViewFilters, right: ViewFilters) {
  return left.q.trim() === right.q.trim() && left.status === right.status && left.order === right.order
}

export function normalizeSearch(value: string) {
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}
