import { useSyncExternalStore } from 'react'
import { defaultViewState, parseViewState, type ViewState } from './viewState.ts'

export type TaskView = 'table' | 'board'
export type Route = { projectId: string; taskId: string | null; view: TaskView; filters: ViewState; hash: string }

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

function queryString(view: TaskView, filters: ViewState) {
  const params = new URLSearchParams()
  if (view === 'board') params.set('view', 'board')
  if (filters.q) params.set('q', filters.q)
  if (filters.status !== 'all') params.set('status', filters.status)
  if (filters.order !== 'original') params.set('order', filters.order)
  const query = params.toString()
  return query ? `?${query}` : ''
}

export function projectUrl(projectId: string, view: TaskView = 'table', filters: ViewState = defaultViewState) {
  return `#/projects/${encodeURIComponent(projectId)}${queryString(view, filters)}`
}

export function taskUrl(projectId: string, taskId: string, view: TaskView = 'table', filters: ViewState = defaultViewState) {
  return `#/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}${queryString(view, filters)}`
}

export function commitView(route: Route, draft: ViewState) {
  const filters = { ...draft, q: draft.q.trim() }
  const url = route.taskId ? taskUrl(route.projectId, route.taskId, route.view, filters) : projectUrl(route.projectId, route.view, filters)
  const changed = filters.q !== route.filters.q || filters.status !== route.filters.status || filters.order !== route.filters.order
  if (changed) window.location.hash = url
  else if (window.location.hash !== url) {
    window.history.replaceState(window.history.state, '', url)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  }
}

export function useRoute(): Route | null {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  const separator = hash.indexOf('?')
  const path = separator < 0 ? hash : hash.slice(0, separator)
  const params = new URLSearchParams(separator < 0 ? '' : hash.slice(separator + 1))
  const view: TaskView = params.get('view') === 'board' ? 'board' : 'table'
  const filters = parseViewState(params)
  if (!path || path === '#' || path === '#/') return { projectId: 'web', taskId: null, view, filters, hash }
  const match = path.match(/^#\/projects\/([^/]+)(?:\/tasks\/([^/]+))?$/)
  if (!match) return null
  try {
    return { projectId: decodeURIComponent(match[1]), taskId: match[2] ? decodeURIComponent(match[2]) : null, view, filters, hash }
  } catch {
    return null
  }
}
