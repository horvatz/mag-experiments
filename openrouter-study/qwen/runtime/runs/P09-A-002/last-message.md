Zdaj razširim navigation.ts:

<function=exec_command>
<parameter=cmd>
cat > src/navigation.ts << 'ENDOFFILE'
import { useSyncExternalStore } from 'react'

export type TaskView = 'table' | 'board'

export type ViewOrder = 'original' | 'title-asc' | 'title-desc'
export type ViewStatus = 'all' | 'todo' | 'in_progress' | 'done'

export interface ViewState {
  q: string
  status: ViewStatus
  order: ViewOrder
  view: TaskView
}

// History management for view state
const viewHistory: ViewState[] = []
let historyIndex = -1

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export const DEFAULT_VIEW: ViewState = {
  q: '',
  status: 'all',
  order: 'original',
  view: 'table',
}

export function projectUrl(
  projectId: string,
  view: TaskView = 'table'
): string
export function projectUrl(
  projectId: string,
  view?: TaskView | ViewState
): string {
  const viewParam = Array.isArray(view) ? view : view
    
  if (viewParam && (viewParam.status === 'all' || viewParam.status === 'todo' || viewParam.status === 'in_progress' || viewParam.status === 'done')) {
    const q = Array.isArray(viewParam) ? viewParam.q : ''
    const status = Array.isArray(viewParam) ? viewParam.status : 'all'
    const order = Array.isArray(viewParam) ? viewParam.order : 'original'
    
    const params = []
    if (q) params.push(`q=${encodeURIComponent(q)}`)
    if (status !== 'all') params.push(`status=${status}`)
    if (order !== 'original') params.push(`order=${order}`)
    if (Array.isArray(viewParam) && viewParam.view === 'board') params.push('view=board')
    
    const queryString = params.join('&')
    return `#/projects/${encodeURIComponent(projectId)}${queryString ? '?' + queryString : ''}`
  }
  
  return `#/projects/${encodeURIComponent(projectId)}${view === 'board' ? '?view=board' : ''}`
}

export function taskUrl(
  projectId: string,
  taskId: string,
  view?: TaskView | ViewState
): string {
 const viewParam = Array.isArray(view) ? view : view
    
  if (viewParam && (viewParam.status === 'all' || viewParam.status === 'todo' || viewParam.status === 'in_progress' || viewParam.status === 'done')) {
    const q = Array.isArray(viewParam) ? viewParam.q : ''
    const status = Array.isArray(viewParam) ? viewParam.status : 'all'
    const order = Array.isArray(viewParam) ? viewParam.order : 'original'
    
    const params = []
    if (q) params.push(`q=${encodeURIComponent(q)}`)
    if (status !== 'all') params.push(`status=${status}`)
    if (order !== 'original') params.push(`order=${order}`)
    if (Array.isArray(viewParam) && viewParam.view === 'board') params.push('view=board')
    
    const queryString = params.join('&')
    return `${projectUrl(projectId, view)}?view=board${queryString ? '&' + queryString : ''}`
  }
  
  return `${projectUrl(projectId)}?view=board${view === 'board' ? '' : '?' + (view === 'board' ? 'view=board' : '')}`
}

// P09: Save view state to history before navigation
export function saveViewState(startState: ViewState, changes?: Partial<ViewState>): void {
  const newState = {
    ...startState,
    ...changes,
  }
  
  // Remove all future states if we're in the middle of history
  if (historyIndex < viewHistory.length - 1) {
    viewHistory.length = historyIndex + 1
  }
  
  viewHistory.push(newState)
  
  // Limit history size
  if (viewHistory.length > 50) {
    viewHistory.shift()
  }
  
  historyIndex++
}

export function getCurrentViewFromUrl(): ViewState {
  const hash = window.location.hash
  const [path, queryAndRest] = hash.split('?')
  const query = new URLSearchParams(queryAndRest)
  
  const status = query.get('status') as ViewStatus | null
  const order = query.get('order') as ViewOrder | null
  const q = query.get('q') || ''
  const viewParam = query.get('view') as TaskView | null
  
  // Return with any unknown params
  const unknownParams: Record<string, string> = {}
  query.forEach((value, key) => {
    if (['status', 'order', 'view', 'q'].indexOf(key) === -1) {
      unknownParams[key] = value
    }
  })
  
  return {
    q,
    status: status || 'all',
    order: order || 'original',
    view: (viewParam === 'board' || viewParam === 'table') ? viewParam ?? 'table' : 'table',
    unknownParams,
  }
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  const [path, queryAndRest] = hash.split('?')
  const query = new URLSearchParams(queryAndRest)
  
  const status = query.get('status') as ViewStatus | null
  const order = query.get('order') as ViewOrder | null
  const q = query.get('q') || ''
  const viewParam = query.get('view') as TaskView | null
  
  const view: TaskView = viewParam === 'board' ? 'board' : 'table'
  
  if (!path || path === '#' || path === '#/') {
    return { projectId: 'web', taskId: null, view }
  }
  
  const match = path.match(/^#\/projects\/([^/]+)(?:\/tasks\/([^/]+))?$/)
  if (!match) return null
  
  try {
    return {
      projectId: decodeURIComponent(match[1]),
      taskId: match[2] ? decodeURIComponent(match[2]) : null,
      view,
      q,
      status: status || 'all',
      order: order || 'original',
    }
  } catch {
    return null
  }
}
ENDOFFILE
</parameter>
</function>
</tool_call>
