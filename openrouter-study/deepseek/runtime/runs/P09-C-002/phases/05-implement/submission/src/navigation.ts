import { useSyncExternalStore } from 'react'
import { DEFAULT_FILTERS, type ViewFilters } from './viewState.ts'

export type TaskView = 'table' | 'board'

export interface Route {
  projectId: string
  taskId: string | null
  view: TaskView
  filters: ViewFilters
}

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

function parseFilters(params: URLSearchParams): ViewFilters {
  const status = params.get('status')
  const order = params.get('order')
  return {
    q: params.get('q') ?? DEFAULT_FILTERS.q,
    status: status === 'todo' || status === 'in_progress' || status === 'done' ? status : DEFAULT_FILTERS.status,
    order: order === 'title-asc' || order === 'title-desc' ? order : DEFAULT_FILTERS.order,
  }
}

export function buildHash(projectId: string, options: { view?: TaskView; taskId?: string | null; filters?: ViewFilters } = {}) {
  const view = options.view ?? 'table'
  const filters = options.filters ?? DEFAULT_FILTERS
  const query: string[] = []
  if (view === 'board') query.push('view=board')
  const phrase = filters.q.trim()
  if (phrase !== '') query.push(`q=${encodeURIComponent(phrase)}`)
  if (filters.status !== 'all') query.push(`status=${encodeURIComponent(filters.status)}`)
  if (filters.order !== 'original') query.push(`order=${encodeURIComponent(filters.order)}`)
  const path = `#/projects/${encodeURIComponent(projectId)}${options.taskId ? `/tasks/${encodeURIComponent(options.taskId)}` : ''}`
  return query.length === 0 ? path : `${path}?${query.join('&')}`
}

export function projectUrl(projectId: string, view: TaskView = 'table') {
  return buildHash(projectId, { view })
}

export function taskUrl(projectId: string, taskId: string, view: TaskView = 'table', filters: ViewFilters = DEFAULT_FILTERS) {
  return buildHash(projectId, { view, taskId, filters })
}

export function useRoute(): Route | null {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  const [path, query] = hash.split('?')
  const params = new URLSearchParams(query)
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
