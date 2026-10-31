import { useSyncExternalStore } from 'react'
import { buildHash, defaultViewState, parseViewState, type ViewState } from './viewState.ts'

export type TaskView = 'table' | 'board'

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function projectUrl(projectId: string, view: TaskView = 'table', state: ViewState = defaultViewState) {
  return buildHash(projectId, null, view, state)
}

export function taskUrl(projectId: string, taskId: string, view: TaskView = 'table', state: ViewState = defaultViewState) {
  return buildHash(projectId, taskId, view, state)
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  const [path, query] = hash.split('?')
  const view: TaskView = new URLSearchParams(query).get('view') === 'board' ? 'board' : 'table'
  const state = parseViewState(query)
  if (!path || path === '#' || path === '#/') return { projectId: 'web', taskId: null, view, state, hash }
  const match = path.match(/^#\/projects\/([^/]+)(?:\/tasks\/([^/]+))?$/)
  if (!match) return null
  try {
    return { projectId: decodeURIComponent(match[1]), taskId: match[2] ? decodeURIComponent(match[2]) : null, view, state, hash }
  } catch {
    return null
  }
}
