import { useSyncExternalStore } from 'react'

export type CalendarView = 'all' | 'overdue' | 'today' | 'week' | 'later' | 'done'

export type ReferencniDatum = string

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

function parseCalendarView(query: URLSearchParams): CalendarView {
  const view = query.get('view')
  if (view && ['all', 'overdue', 'today', 'week', 'later', 'done'].includes(view)) {
    return view as CalendarView
  }
  return 'all'
}

export function projectUrl(projectId: string, view: CalendarView = 'all' ) {
  return `#/projects/${encodeURIComponent(projectId)}?view=${encodeURIComponent(view)}`
}

export function taskUrl(projectId: string, taskId: string, view: CalendarView = 'all' ) {
  return `${projectUrl(projectId, view)}/tasks/${encodeURIComponent(taskId)}`
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  const [path, query] = hash.split('?')
  const view = parseCalendarView(new URLSearchParams(query))
  if (!path || path === '#' || path === '#/') return { projectId: 'web', taskId: null, view }
  const match = path.match(/^#\/projects\/([^/]+)(?:\/tasks\/([^/]+))?$/)
  if (!match) return null
  try {
    return { projectId: decodeURIComponent(match[1]), taskId: match[2] ? decodeURIComponent(match[2]) : null, view }
  } catch {
    return null
  }
}
