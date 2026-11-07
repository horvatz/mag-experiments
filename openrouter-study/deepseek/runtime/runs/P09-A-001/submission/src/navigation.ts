import { useSyncExternalStore } from 'react'
import { DEFAULT_VIEW_STATE, buildViewQuery, parseViewState, type ViewState } from './viewState.ts'

export type TaskView = 'table' | 'board'

let navSequence = 0

function subscribe(onChange: () => void) {
  const handler = () => { navSequence += 1; onChange() }
  window.addEventListener('hashchange', handler)
  return () => window.removeEventListener('hashchange', handler)
}

function snapshot() {
  return `${navSequence}\u0000${window.location.hash}`
}

export function projectUrl(projectId: string, view: TaskView = 'table', state: ViewState = DEFAULT_VIEW_STATE) {
  const query = buildViewQuery(view, state)
  return `#/projects/${encodeURIComponent(projectId)}${query ? `?${query}` : ''}`
}

export function taskUrl(projectId: string, taskId: string, view: TaskView = 'table', state: ViewState = DEFAULT_VIEW_STATE) {
  const query = buildViewQuery(view, state)
  return `#/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}${query ? `?${query}` : ''}`
}

function splitHash(hash: string) {
  const index = hash.indexOf('?')
  return index < 0 ? { path: hash, query: '' } : { path: hash.slice(0, index), query: hash.slice(index + 1) }
}

export function useRoute() {
  const key = useSyncExternalStore(subscribe, snapshot)
  const hash = key.slice(key.indexOf('\u0000') + 1)
  const { path, query } = splitHash(hash)
  const view: TaskView = new URLSearchParams(query).get('view') === 'board' ? 'board' : 'table'
  const viewState = parseViewState(query)
  const shared = { view, viewState, key, hash }
  if (!path || path === '#' || path === '#/') return { ...shared, projectId: 'web', taskId: null }
  const match = path.match(/^#\/projects\/([^/]+)(?:\/tasks\/([^/]+))?$/)
  if (!match) return null
  try {
    return { ...shared, projectId: decodeURIComponent(match[1]), taskId: match[2] ? decodeURIComponent(match[2]) : null }
  } catch {
    return null
  }
}
