import { useSyncExternalStore } from 'react'
export type TaskView = 'table' | 'board'
function subscribe(onChange: () => void) { window.addEventListener('hashchange', onChange); return () => window.removeEventListener('hashchange', onChange) }
function query(projectId: string, view: TaskView) {
  const [path, text] = window.location.hash.split('?'), match = /^#\/projects\/([^/]+)/.exec(path)
  let same = false; try { same = Boolean(match && decodeURIComponent(match[1]) === projectId) } catch { /* Unknown paths keep the normal recovery route. */ }
  const source = new URLSearchParams(text), out = new URLSearchParams()
  if (view === 'board') out.set('view', 'board')
  if (same) {
    const q = (source.get('q') || '').trim(), status = source.get('status') || '', order = source.get('order') || ''
    if (q) out.set('q', q)
    if (['todo', 'in_progress', 'done'].includes(status)) out.set('status', status)
    if (['title-asc', 'title-desc'].includes(order)) out.set('order', order)
  }
  return out.size ? '?' + out.toString() : ''
}
export function projectUrl(projectId: string, view: TaskView = 'table') { return `#/projects/${encodeURIComponent(projectId)}${query(projectId, view)}` }
export function taskUrl(projectId: string, taskId: string, view: TaskView = 'table') { return `#/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}${query(projectId, view)}` }
export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash), [path, text] = hash.split('?')
  const view: TaskView = new URLSearchParams(text).get('view') === 'board' ? 'board' : 'table'
  if (!path || path === '#' || path === '#/') return { projectId: 'web', taskId: null, view }
  const match = path.match(/^#\/projects\/([^/]+)(?:\/tasks\/([^/]+))?$/)
  if (!match) return null
  try { return { projectId: decodeURIComponent(match[1]), taskId: match[2] ? decodeURIComponent(match[2]) : null, view } } catch { return null }
}
