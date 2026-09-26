import { useSyncExternalStore, type MouseEvent } from 'react'
import { defaultViewState, readViewState, type ViewState } from './viewState.ts'

export type TaskView = 'table' | 'board'

export function subscribeNavigation(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  window.addEventListener('popstate', onChange)
  window.addEventListener('folio:navigate', onChange)
  return () => {
    window.removeEventListener('hashchange', onChange)
    window.removeEventListener('popstate', onChange)
    window.removeEventListener('folio:navigate', onChange)
  }
}

export function navigate(hash: string, replace = false) {
  if (hash !== window.location.hash) {
    if (replace) window.history.replaceState(null, '', hash)
    else window.history.pushState(null, '', hash)
  }
  // Also discard drafts when the destination is the already active route.
  window.dispatchEvent(new Event('folio:navigate'))
}

export function followLink(event: MouseEvent<HTMLAnchorElement>) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  navigate(event.currentTarget.hash)
}

function viewQuery(view: TaskView, state: ViewState) {
  const params = new URLSearchParams()
  if (view === 'board') params.set('view', 'board')
  if (state.q.trim()) params.set('q', state.q.trim())
  if (state.status !== 'all') params.set('status', state.status)
  if (state.order !== 'original') params.set('order', state.order)
  return params.size ? `?${params}` : ''
}

export function projectUrl(projectId: string, view: TaskView = 'table', state = defaultViewState) {
  return `#/projects/${encodeURIComponent(projectId)}${viewQuery(view, state)}`
}

export function taskUrl(projectId: string, taskId: string, view: TaskView = 'table', state = defaultViewState) {
  return `#/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}${viewQuery(view, state)}`
}

export function readRoute(hash: string) {
  const queryIndex = hash.indexOf('?')
  const path = queryIndex < 0 ? hash : hash.slice(0, queryIndex)
  const params = new URLSearchParams(queryIndex < 0 ? '' : hash.slice(queryIndex + 1))
  const view: TaskView = params.get('view') === 'board' ? 'board' : 'table'
  const state = readViewState(params)
  if (!path || path === '#' || path === '#/') return { projectId: 'web', taskId: null, view, state }
  const match = path.match(/^#\/projects\/([^/]+)(?:\/tasks\/([^/]+))?$/)
  if (!match) return null
  try {
    return { projectId: decodeURIComponent(match[1]), taskId: match[2] ? decodeURIComponent(match[2]) : null, view, state }
  } catch {
    return null
  }
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribeNavigation, () => window.location.hash)
  return readRoute(hash)
}
