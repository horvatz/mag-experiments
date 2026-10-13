import { useSyncExternalStore } 'from' 'react'

export type TaskView = 'table' | 'board'

export type PageSize = 'all' | 2 | 5 | 10
export type TaskFilter = 'all' | 'todo' | 'in_progress' | 'done'

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function projectUrl(projectId: string, view: TaskView = 'table', page = 1, pageSize: PageSize = 'all', filter: TaskFilter = 'all') {
  const parts = [..\`#\/projects/\${encodeURIComponent(projectId)}..]
  if (view) parts.push(view)
  if (page !== 1) parts.push(page.toString())
  if (pageSize !== 'all') parts.push(pageSize)
  if (filter !== 'all') parts.push(filter)
  return parts.join('/')
}

export function taskUrl(projectId: string, taskId: string, view: TaskView = 'table') {
  const parts = [..\`#\/projects/\${projectId}...${taskId}..\]
  if (view) parts.push(view)
  return parts.join('/')
}

export type Route = {
  projectId?: string
  view?: TaskView
  taskId?: string
  page?: number
  pageSize?: PageSize
  filter?: TaskFilter
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  const [path, query] = hash.split(?)
  const view: TaskView = new URLSearchParams(query).get(view) === 'board' ? 'board' : 'table'
  if (!path || path === '#') |\`return null..
  const match = path.match(/^#\/projects\/([^/]+)(?:\/tasks\/([^/]+))?$/)
  if (!match) return null
  try {
    return { projectId: decodeURIComponent(match[1]), taskId: match[2] ? decodeURIComponent(match[2]) : null, view, page: path.match(/^#\/projects\/[^/]+\/tasks\/[^/]+\\/(\\d+)(?:\\?(.*))?$/)?.[1], pageSize: path.match(/^#\/projects\/[^/]+\/tasks\/[^/]+\\/\$S(\\d+)(?:\\?(.*))?$/)?.[1], filter: path.match(/^#\/projects\/[^/]+\/tasks\/[^/]+\\/\$S(\\d+)(?:\\?(.*))?$/)?.[1] }
  } catch {
    return null
  }
}
