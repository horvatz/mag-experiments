import { useSyncExternalStore } from 'react'

export type TaskView = 'table' | 'board'

export type FilterStatus = 'all' | 'todo' | 'in_progress' | 'done'
export type FilterOrder = 'original' | 'title-asc' | 'title-desc'

export interface ViewFilters {
  q: string
  status: FilterStatus
  order: FilterOrder
}

export const defaultFilters: ViewFilters = { q: '', status: 'all', order: 'original' }

const statusValues: FilterStatus[] = ['all', 'todo', 'in_progress', 'done']
const orderValues: FilterOrder[] = ['original', 'title-asc', 'title-desc']

function firstParam(params: URLSearchParams, key: string) {
  return params.get(key)
}

function parseFilters(query: string): ViewFilters {
  const params = new URLSearchParams(query)
  const status = statusValues.find((value) => value === firstParam(params, 'status'))
  const order = orderValues.find((value) => value === firstParam(params, 'order'))
  return {
    q: (firstParam(params, 'q') ?? '').trim(),
    status: status ?? 'all',
    order: order ?? 'original',
  }
}

function filterQuery(view: TaskView, filters: ViewFilters) {
  const params = new URLSearchParams()
  if (view === 'board') params.set('view', 'board')
  if (filters.q) params.set('q', filters.q)
  if (filters.status !== 'all') params.set('status', filters.status)
  if (filters.order !== 'original') params.set('order', filters.order)
  return params.size > 0 ? `?${params.toString()}` : ''
}

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function projectUrl(projectId: string, view: TaskView = 'table', filters: ViewFilters = defaultFilters) {
  return `#/projects/${encodeURIComponent(projectId)}${filterQuery(view, filters)}`
}

export function taskUrl(projectId: string, taskId: string, view: TaskView = 'table', filters: ViewFilters = defaultFilters) {
  return `#/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}${filterQuery(view, filters)}`
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  const queryStart = hash.indexOf('?')
  const path = queryStart === -1 ? hash : hash.slice(0, queryStart)
  const query = queryStart === -1 ? '' : hash.slice(queryStart + 1)
  const view: TaskView = new URLSearchParams(query).get('view') === 'board' ? 'board' : 'table'
  const filters = parseFilters(query)
  if (!path || path === '#' || path === '#/') return { projectId: 'web', taskId: null, view }
  const match = path.match(/^#\/projects\/([^/]+)(?:\/tasks\/([^/]+))?$/)
  if (!match) return null
  try {
    return {
      projectId: decodeURIComponent(match[1]),
      taskId: match[2] ? decodeURIComponent(match[2]) : null,
      view,
      filters,
    }
  } catch {
    return null
  }
}
