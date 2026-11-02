import { useSyncExternalStore } from 'react'

export type TaskView = 'table' | 'board'

export interface ViewFilters {
  q?: string
  status?: string
  order?: string
}

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

function parseFilters(query: string): ViewFilters {
  return {
    q: new URLSearchParams(query).get('q'),
    status: new URLSearchParams(query).get('status'),
    order: new URLSearchParams(query).get('order'),
  }
}

export function buildUrl(hashPath: string, view: TaskView, filters: ViewFilters): string {
  const base = \`\${hashPath}\${view === 'board' ? '?view=board' : ''}\`
  const params = []
  if (filters.q) params.push(\`q=\${encodeURIComponent(filters.q)}\`)
  if (filters.status) params.push(\`status=\${encodeURIComponent(filters.status)}\`)
  if (filters.order) params.push(\`order=\${encodeURIComponent(filters.order)}\`)
  return params.length ? base + '?' + params.join('&') : base
}

function parseFiltersFromUrl(url: string): ViewFilters {
  const queryIdx = url.indexOf('?')
  const query = queryIdx === -1 ? '' : url.substring(queryIdx + 1)
  return parseFilters(query)
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  if (!hash || hash === '#' || hash === '#/') {
    return { projectId: 'web', taskId: null, view: 'table', filters: {} }
  }
  
  const [path, query] = hash.split('?')
  const params = new URLSearchParams(query || '')
  const view: TaskView = params.get('view') === 'board' ? 'board' : 'table'
  const filters = parseFilters(query || '')
  
  const match = path.match(/^#\/projects\/([^/]+)(?:\/tasks\/([^/]+))?$/)
  if (!match) return null
  
  try {
    return {
      projectId: decodeURIComponent(match[1]),
      taskId: match[2] ? decodeURIComponent(match[2]) : null,
      view,
      filters,
    }
  } catch {
    return null
  }
}
export function projectUrl(projectId: string, view: TaskView = 'table', filters: ViewFilters = {}): string {
  const filtersToRemove = []
  if (!filters.q && !filters.status && !filters.order) {
    return \`#/projects/\${encodeURIComponent(projectId)}\${view === 'board' ? '?view=board' : ''}\`
  }
  [filters.q, filters.status, filters.order].forEach((f, i) => {
    if (f && ['q', 'status', 'order'][i]) { filtersToRemove.push(i) }
  })
  
  const params = []
  if (filters.q) params.push(\`q=\${encodeURIComponent(filters.q)}\`)
  if (filters.status) params.push(\`status=\${encodeURIComponent(filters.status)}\`)
  if (filters.order) params.push(\`order=\${encodeURIComponent(filters.order)}\`)
  const query = params.length ? '?' + params.join('&') : params.every(p => p === '') ? '' : ''
  
  const viewPart = view === 'board' ? '?view=board' : ''
  return \`#/projects/\${encodeURIComponent(projectId)}\${viewPart}\${query}\`
}

export function taskUrl(projectId: string, taskId: string, view: TaskView = 'table', filters: ViewFilters = {}): string {
  const base = \`#/projects/\${encodeURIComponent(projectId)}/tasks/\${encodeURIComponent(taskId)}\${view === 'board' ? '?view=board' : ''}\`
  
  if (!filters.q && !filters.status && !filters.order) {
    return base
  }
  
  const params = []
  if (filters.q) params.push(\`q=\${encodeURIComponent(filters.q)}\`)
  if (filters.status) params.push(\`status=\${encodeURIComponent(filters.status)}\`)
  if (filters.order) params.push(\`order=\${encodeURIComponent(filters.order)}\`)
  const query = params.length ? '?' + params.join('&') : ''
  
  return base + query
}
