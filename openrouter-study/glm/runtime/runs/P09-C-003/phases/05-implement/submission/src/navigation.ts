import { useSyncExternalStore } from 'react'

export type TaskView = 'table' | 'board'
export type FilterStatus = 'all' | 'todo' | 'in_progress' | 'done'
export type FilterOrder = 'original' | 'title-asc' | 'title-desc'

export type ViewFilters = {
  q: string
  status: FilterStatus
  order: FilterOrder
}

export const defaultFilters: ViewFilters = { q: '', status: 'all', order: 'original' }

const statuses: FilterStatus[] = ['all', 'todo', 'in_progress', 'done']
const orders: FilterOrder[] = ['original', 'title-asc', 'title-desc']

export function normalizeText(value: string) {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '')
    .toLowerCase()
}

export function canonicalFilters(values: Partial<ViewFilters>): ViewFilters {
  const q = (values.q ?? defaultFilters.q).trim()
  const statusValue = values.status
  const orderValue = values.order
  const status = statuses.includes(statusValue as FilterStatus) ? statusValue as FilterStatus : defaultFilters.status
  const order = orders.includes(orderValue as FilterOrder) ? orderValue as FilterOrder : defaultFilters.order
  return { q, status, order }
}

function query(view: TaskView, filters: ViewFilters) {
  const params = new URLSearchParams()
  if (view === 'board') params.set('view', 'board')
  if (filters.q) params.set('q', filters.q)
  if (filters.status !== 'all') params.set('status', filters.status)
  if (filters.order !== 'original') params.set('order', filters.order)
  const text = params.toString()
  return text ? `?${text}` : ''
}

export function projectUrl(projectId: string, view: TaskView = 'table', filters: ViewFilters = defaultFilters) {
  return `#/projects/${encodeURIComponent(projectId)}${query(view, canonicalFilters(filters))}`
}

export function taskUrl(projectId: string, taskId: string, view: TaskView = 'table', filters: ViewFilters = defaultFilters) {
  return `#/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}${query(view, canonicalFilters(filters))}`
}

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  const [path, query] = hash.split('?')
  const params = new URLSearchParams(query)
  const view: TaskView = params.get('view') === 'board' ? 'board' : 'table'
  const filters = canonicalFilters({
    q: params.get('q') ?? '',
    status: (params.get('status') ?? 'all') as FilterStatus,
    order: (params.get('order') ?? 'original') as FilterOrder,
  })
  if (!path || path === '#' || path === '#/') return { projectId: 'web', taskId: null, view, filters }
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