import { useSyncExternalStore } from 'react'

export type TaskView = 'table' | 'board'
export type ViewStatus = 'all' | 'todo' | 'in_progress' | 'done'
export type ViewOrder = 'original' | 'title-asc' | 'title-desc'

export interface ViewFilters {
  q: string
  status: ViewStatus
  order: ViewOrder
}

export const defaultViewFilters: ViewFilters = { q: '', status: 'all', order: 'original' }

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function normalizeText(value: string) {
  return value.trim().normalize('NFD').replace(/[\u0300-\u036F]/g, '').toLowerCase()
}

function parseViewFilters(params: URLSearchParams): ViewFilters {
  const status = params.get('status')
  const order = params.get('order')
  return {
    q: (params.get('q') ?? '').trim(),
    status: status === 'todo' || status === 'in_progress' || status === 'done' ? status : 'all',
    order: order === 'title-asc' || order === 'title-desc' ? order : 'original',
  }
}

export function sameViewFilters(left: ViewFilters, right: ViewFilters) {
  return left.q === right.q && left.status === right.status && left.order === right.order
}

export function routeUrl(projectId: string, view: TaskView = 'table', filters: ViewFilters = defaultViewFilters, taskId: string | null = null) {
  const params = new URLSearchParams()
  if (view === 'board') params.set('view', 'board')
  if (filters.q !== '') params.set('q', filters.q)
  if (filters.status !== 'all') params.set('status', filters.status)
  if (filters.order !== 'original') params.set('order', filters.order)
  const taskPath = taskId ? `/tasks/${encodeURIComponent(taskId)}` : ''
  const query = params.size ? `?${params.toString()}` : ''
  return `#/projects/${encodeURIComponent(projectId)}${taskPath}${query}`
}

export function projectUrl(projectId: string, view: TaskView = 'table', filters: ViewFilters = defaultViewFilters) {
  return routeUrl(projectId, view, filters)
}

export function taskUrl(projectId: string, taskId: string, view: TaskView = 'table', filters: ViewFilters = defaultViewFilters) {
  return routeUrl(projectId, view, filters, taskId)
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  const queryStart = hash.indexOf('?')
  const path = queryStart === -1 ? hash : hash.slice(0, queryStart)
  const query = queryStart === -1 ? '' : hash.slice(queryStart + 1)
  const params = new URLSearchParams(query)
  const view: TaskView = params.get('view') === 'board' ? 'board' : 'table'
  const filters = parseViewFilters(params)
  if (!path || path === '#' || path === '#/') return { projectId: 'web', taskId: null, view, filters }
  const match = path.match(/^#\/projects\/([^/]+)(?:\/tasks\/([^/]+))?$/)
  if (!match) return null
  try {
    return { projectId: decodeURIComponent(match[1]), taskId: match[2] ? decodeURIComponent(match[2]) : null, view, filters }
  } catch {
    return null
  }
}
