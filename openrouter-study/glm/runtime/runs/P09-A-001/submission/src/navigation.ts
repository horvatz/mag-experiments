import { useMemo, useSyncExternalStore } from 'react'
import type { Task, TaskStatus } from '../shared/types.ts'

export type TaskView = 'table' | 'board'
export type TaskStatusFilter = 'all' | TaskStatus
export type TaskOrder = 'original' | 'title-asc' | 'title-desc'
export interface TaskFilter {
  q: string
  status: TaskStatusFilter
  order: TaskOrder
}

export const defaultTaskFilter: TaskFilter = { q: '', status: 'all', order: 'original' }

const statusFilters: TaskStatusFilter[] = ['all', 'todo', 'in_progress', 'done']
const orders: TaskOrder[] = ['original', 'title-asc', 'title-desc']

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function normalizeText(value: string) {
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function filterTasks(tasks: Task[], filter: TaskFilter) {
  const query = normalizeText(filter.q)
  const matches = tasks.filter((task) => {
    if (filter.status !== 'all' && task.status !== filter.status) return false
    if (!query) return true
    return [task.title, task.description, task.assignee, task.id]
      .some((field) => normalizeText(field).includes(query))
  })

  if (filter.order === 'original') return matches
  return [...matches].sort((left, right) => {
    const leftTitle = normalizeText(left.title)
    const rightTitle = normalizeText(right.title)
    if (leftTitle === rightTitle) return 0
    const comparison = leftTitle < rightTitle ? -1 : 1
    return filter.order === 'title-asc' ? comparison : -comparison
  })
}

function parseFilter(query: string): TaskFilter {
  const params = new URLSearchParams(query)
  const status = params.get('status')
  const order = params.get('order')
  return {
    q: (params.get('q') ?? '').trim(),
    status: statusFilters.includes(status as TaskStatusFilter) ? status as TaskStatusFilter : 'all',
    order: orders.includes(order as TaskOrder) ? order as TaskOrder : 'original',
  }
}

function queryString(view: TaskView, filter: TaskFilter) {
  const params = new URLSearchParams()
  if (view === 'board') params.set('view', 'board')
  const q = filter.q.trim()
  if (q) params.set('q', q)
  if (filter.status !== 'all') params.set('status', filter.status)
  if (filter.order !== 'original') params.set('order', filter.order)
  const query = params.toString()
  return query ? `?${query}` : ''
}

export function projectUrl(projectId: string, view: TaskView = 'table', filter: TaskFilter = defaultTaskFilter) {
  return `#/projects/${encodeURIComponent(projectId)}${queryString(view, filter)}`
}

export function taskUrl(projectId: string, taskId: string, view: TaskView = 'table', filter: TaskFilter = defaultTaskFilter) {
  return `#/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}${queryString(view, filter)}`
}

export function navigateToHash(url: string) {
  if (window.location.hash === url) return
  window.history.pushState(null, '', url)
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}

function parseRoute(hash: string) {
  const [path, query = ''] = hash.split('?')
  const params = new URLSearchParams(query)
  const view: TaskView = params.get('view') === 'board' ? 'board' : 'table'
  const filter = parseFilter(query)
  if (!path || path === '#' || path === '#/') return { projectId: 'web', taskId: null, view, filter }
  const match = path.match(/^#\/projects\/([^/]+)(?:\/tasks\/([^/]+))?$/)
  if (!match) return null
  try {
    return {
      projectId: decodeURIComponent(match[1]),
      taskId: match[2] ? decodeURIComponent(match[2]) : null,
      view,
      filter,
    }
  } catch {
    return null
  }
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  return useMemo(() => parseRoute(hash), [hash])
}
