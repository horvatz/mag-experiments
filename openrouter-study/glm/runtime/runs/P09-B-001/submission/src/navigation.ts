import { useMemo, useSyncExternalStore } from 'react'
import type { Task } from '../shared/types.ts'

export type TaskView = 'table' | 'board'
export type ViewStatus = 'all' | 'todo' | 'in_progress' | 'done'
export type ViewOrder = 'original' | 'title-asc' | 'title-desc'

export interface ViewFilter {
  q: string
  status: ViewStatus
  order: ViewOrder
}

export const defaultViewFilter: ViewFilter = { q: '', status: 'all', order: 'original' }

export function normalizeText(value: string) {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '')
    .toLowerCase()
}

export function filterTasks(tasks: Task[], filter: ViewFilter) {
  const query = normalizeText(filter.q)
  return tasks
    .filter((task) => {
      const matchesQuery = !query || [task.title, task.description, task.assignee, task.id]
        .some((field) => normalizeText(field).includes(query))
      const matchesStatus = filter.status === 'all' || task.status === filter.status
      return matchesQuery && matchesStatus
    })
    .sort((first, second) => {
      if (filter.order === 'original') return 0
      const firstTitle = normalizeText(first.title)
      const secondTitle = normalizeText(second.title)
      if (firstTitle === secondTitle) return 0
      if (filter.order === 'title-asc') return firstTitle < secondTitle ? -1 : 1
      return firstTitle > secondTitle ? -1 : 1
    })
}

export function viewFilterUrl(filter: ViewFilter) {
  const params = new URLSearchParams()
  if (filter.q.trim()) params.set('q', filter.q.trim())
  if (filter.status !== 'all') params.set('status', filter.status)
  if (filter.order !== 'original') params.set('order', filter.order)
  return params
}

function withQuery(path: string, view: TaskView, filter: ViewFilter = defaultViewFilter) {
  const params = viewFilterUrl(filter)
  if (view === 'board') params.set('view', 'board')
  const query = params.toString()
  return query ? `${path}?${query}` : path
}

export function projectUrl(projectId: string, view: TaskView = 'table', filter: ViewFilter = defaultViewFilter) {
  return withQuery(`#/projects/${encodeURIComponent(projectId)}`, view, filter)
}

export function taskUrl(projectId: string, taskId: string, view: TaskView = 'table', filter: ViewFilter = defaultViewFilter) {
  return withQuery(`#/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}`, view, filter)
}

function readFilter(params: URLSearchParams): ViewFilter {
  const q = params.get('q') ?? ''
  const status = params.get('status')
  const order = params.get('order')
  return {
    q,
    status: status === 'todo' || status === 'in_progress' || status === 'done' ? status : 'all',
    order: order === 'title-asc' || order === 'title-desc' ? order : 'original',
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  return useMemo(() => {
    const queryStart = hash.indexOf('?')
    const path = queryStart === -1 ? hash : hash.slice(0, queryStart)
    const params = new URLSearchParams(queryStart === -1 ? '' : hash.slice(queryStart + 1))
    const view: TaskView = params.get('view') === 'board' ? 'board' : 'table'
    const filter = readFilter(params)
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
  }, [hash])
}
