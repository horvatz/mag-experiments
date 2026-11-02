import { useSyncExternalStore } from 'react'

export type TaskView = 'table' | 'board'
export type ViewFilters = {
  q: string
  status: 'all' | 'todo' | 'in_progress' | 'done'
  order: 'original' | 'title-asc' | 'title-desc'
}

export const defaultViewFilters: ViewFilters = { q: '', status: 'all', order: 'original' }

const statuses: ViewFilters['status'][] = ['all', 'todo', 'in_progress', 'done']
const orders: ViewFilters['order'][] = ['original', 'title-asc', 'title-desc']

export function normalizeSearchText(value: string) {
  return value.trim().normalize('NFD').replace(/[\u0300-\u036F]/g, '').toLowerCase()
}

export function sameViewFilters(left: ViewFilters, right: ViewFilters) {
  return left.q === right.q && left.status === right.status && left.order === right.order
}

function queryString(view: TaskView, filters: ViewFilters) {
  const params: string[] = []
  if (view === 'board') params.push('view=board')
  if (filters.q !== '') params.push(`q=${encodeURIComponent(filters.q)}`)
  if (filters.status !== 'all') params.push(`status=${filters.status}`)
  if (filters.order !== 'original') params.push(`order=${filters.order}`)
  return params.length > 0 ? `?${params.join('&')}` : ''
}

function parseFilters(query: string): ViewFilters {
  const params = new URLSearchParams(query)
  const statusValue = params.get('status')
  const orderValue = params.get('order')
  const status = statuses.includes(statusValue as ViewFilters['status']) ? statusValue as ViewFilters['status'] : 'all'
  const order = orders.includes(orderValue as ViewFilters['order']) ? orderValue as ViewFilters['order'] : 'original'
  return { q: params.get('q') ?? '', status, order }
}

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function projectUrl(projectId: string, view: TaskView = 'table', filters: ViewFilters = defaultViewFilters) {
  return `#/projects/${encodeURIComponent(projectId)}${queryString(view, filters)}`
}

export function taskUrl(projectId: string, taskId: string, view: TaskView = 'table', filters: ViewFilters = defaultViewFilters) {
  return `#/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}${queryString(view, filters)}`
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  const [path, query = ''] = hash.split('?')
  const view: TaskView = new URLSearchParams(query).get('view') === 'board' ? 'board' : 'table'
  if (!path || path === '#' || path === '#/') return { projectId: 'web', taskId: null, view }
  const match = path.match(/^#\/projects\/([^/]+)(?:\/tasks\/([^/]+))?$/)
  if (!match) return null
  try {
    return {
      projectId: decodeURIComponent(match[1]),
      taskId: match[2] ? decodeURIComponent(match[2]) : null,
      view,
      viewState: parseFilters(query),
    }
  } catch {
    return null
  }
}
