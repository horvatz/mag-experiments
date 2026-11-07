import { useSyncExternalStore } from 'react'
import { DEFAULT_VIEW_STATE, parseViewState, sameViewState, type ViewState } from './viewState.ts'

export type TaskView = 'table' | 'board'

export interface Route {
  projectId: string
  taskId: string | null
  view: TaskView
  state: ViewState
}

const listeners = new Set<() => void>()

function notify() {
  for (const listener of listeners) listener()
}

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  window.addEventListener('hashchange', onChange)
  window.addEventListener('popstate', onChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener('hashchange', onChange)
    window.removeEventListener('popstate', onChange)
  }
}

export function parseHash(hash: string): Route | null {
  const [path, query = ''] = hash.split('?')
  const params = new URLSearchParams(query)
  const view: TaskView = params.get('view') === 'board' ? 'board' : 'table'
  const state = parseViewState(params)
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
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  return parseHash(hash)
}

function buildHash(path: string, view: TaskView, state: ViewState) {
  const params = new URLSearchParams()
  if (view === 'board') params.set('view', 'board')
  const q = state.q.trim()
  if (q !== '') params.set('q', q)
  if (state.status !== 'all') params.set('status', state.status)
  if (state.order !== 'original') params.set('order', state.order)
  const query = params.toString()
  return query ? `${path}?${query}` : path
}

export function projectUrl(projectId: string, view: TaskView = 'table', state: ViewState = DEFAULT_VIEW_STATE) {
  return buildHash(`#/projects/${encodeURIComponent(projectId)}`, view, state)
}

export function taskUrl(projectId: string, taskId: string, view: TaskView = 'table', state: ViewState = DEFAULT_VIEW_STATE) {
  return buildHash(`#/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}`, view, state)
}

export function commitView(projectId: string, view: TaskView, state: ViewState) {
  const committed = { ...state, q: state.q.trim() }
  const target = projectUrl(projectId, view, committed)
  const current = parseHash(window.location.hash)
  const sameCommitted = current !== null && current.projectId === projectId && current.taskId === null && current.view === view && sameViewState(current.state, committed)
  if (sameCommitted) {
    if (window.location.hash !== target) {
      window.history.replaceState(null, '', target)
      notify()
    }
    return
  }
  if (window.location.hash === target) return
  window.history.pushState(null, '', target)
  notify()
}
