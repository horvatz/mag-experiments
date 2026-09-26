import { useSyncExternalStore } from 'react'
import { defaultFilters, readFilters, type ViewFilters } from './viewState.ts'

export type TaskView = 'table' | 'board'

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

function viewQuery(view: TaskView, filters: ViewFilters) {
  const params = new URLSearchParams()
  if (view === 'board') params.set('view', 'board')
  if (filters.q.trim()) params.set('q', filters.q.trim())
  if (filters.status !== 'all') params.set('status', filters.status)
  if (filters.order !== 'original') params.set('order', filters.order)
  return params.size ? `?${params}` : ''
}

export function projectUrl(projectId: string, view: TaskView = 'table', filters: ViewFilters = defaultFilters) {
  return `#/projects/${encodeURIComponent(projectId)}${viewQuery(view, filters)}`
}

export function taskUrl(projectId: string, taskId: string, view: TaskView = 'table', filters: ViewFilters = defaultFilters) {
  return `${projectUrl(projectId)}/tasks/${encodeURIComponent(taskId)}${viewQuery(view, filters)}`
}

export function commitUrl(url: string, replace: boolean) {
  if (window.location.hash === url) return
  if (replace) window.history.replaceState(null, '', url)
  else window.history.pushState(null, '', url)
  window.dispatchEvent(new Event('hashchange'))
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  const separator = hash.indexOf('?')
  const path = separator < 0 ? hash : hash.slice(0, separator)
  const params = new URLSearchParams(separator < 0 ? '' : hash.slice(separator + 1))
  const view: TaskView = params.get('view') === 'board' ? 'board' : 'table'
  const filters = readFilters(params)
  if (!path || path === '#' || path === '#/') return { projectId: 'web', taskId: null, view, filters, hash }
  const match = path.match(/^#\/projects\/([^/]+)(?:\/tasks\/([^/]+))?$/)
  if (!match) return null
  try {
    return { projectId: decodeURIComponent(match[1]), taskId: match[2] ? decodeURIComponent(match[2]) : null, view, filters, hash }
  } catch {
    return null
  }
}
