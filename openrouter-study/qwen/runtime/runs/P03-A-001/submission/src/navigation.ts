export type ProjectUrlParams = {
  projectId: string
  taskId?: string | null
  view?: 'table' | 'board'
}

export type QueryParams = {
  searchQuery?: string
  statusFilter?: 'all' | 'todo' | 'in_progress' | 'done'
  assigneeFilter?: 'all' | string
}

export function projectUrl(projectId: string, view?: 'table' | 'board'): string {
  return `/#/projects/${encodeURIComponent(projectId)}/${view ?? 'table'}`
}

export function taskUrl(projectId: string, taskId: string): string {
  return `/#/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}`
}

export function useRoute(): { projectId?: string; taskId?: string | null; view?: 'table' | 'board' } | null {
  function parseHash(hash: string): { projectId?: string; taskId?: string | null; view?: 'table' | 'board' } | null {
    const parts = hash.replace(/^#\//, '').split('/')
    if (parts.length === 0) return null
    
    let resourceId: string | null = parts[0]
    let taskId: string | null = null
    let view: 'table' | 'board' = 'table'
    
    switch (parts[1]) {
      case 'tasks':
        resourceId = parts[0]
        taskId = parts[2]
        break
      case 'board':
      case 'table':
        view = parts[1] as 'table' | 'board'
        resourceId = parts[0]
        if (parts[2]) taskId = parts[2]
        break
      default:
        return null
    }
    
    if (!resourceId) return null
    return {
      projectId: resourceId,
      taskId,
      view,
    }
  }
  
  return parseHash(window.location.hash)
}

export function useQueryParams(): QueryParams {
  function parseQuery(): QueryParams {
    const params = new URLSearchParams(window.location.search)
    return {
      searchQuery: params.get('search') ?? '',
      statusFilter: (params.get('status') as ('all' | 'todo' | 'in_progress' | 'done')) ?? 'all',
      assigneeFilter: (params.get('assignee') as ('all' | string)) ?? 'all',
    }
  }
  
  return parseQuery()
}
