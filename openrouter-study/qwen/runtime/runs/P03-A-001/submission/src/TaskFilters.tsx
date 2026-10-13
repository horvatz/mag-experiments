import { Search, X } from 'lucide-react'
import type { Task, TaskStatus } from '../shared/types.ts'

export interface TaskFiltersState {
  searchQuery: string
  selectedStatus: 'all' | TaskStatus
  selectedAssignee: 'all' | string
}

export const initialFiltersState: TaskFiltersState = {
  searchQuery: '',
  selectedStatus: 'all' as TaskStatus,
  selectedAssignee: 'all',
}

const assignees = (tasks: Task[]) => [...new Set(tasks.map(t => t.assignee).filter(Boolean).sort())]

export function filterTasks(tasks: Task[], status: 'all' | TaskStatus, assignee: 'all' | string): Task[] {
  let result = [...tasks]
  if (status !== 'all') {
    result = result.filter(task => task.status === status)
  }
  if (assignee !== 'all') {
    result = result.filter(task => task.assignee === assignee)
  }
  return result
}

export function TaskFilters({ filters, onUpdateFilters, onClearFilters, showEveryone, isEveryone, totalCount }: {
  filters: TaskFiltersState,
  onUpdateFilters: (filters: TaskFiltersState) => void,
  onClearFilters: () => void,
  showEveryone?: boolean,
  isEveryone?: boolean,
  totalCount?: number,
}) {
  const assignees = showEveryone || isEveryone ? assignees([]) : []

  return (
    <div className="filters-container" role="search" aria-label="Prelogi opravil">
      <div className="filters-toolbar">
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input 
            type="search"
            placeholder="Išči opravila"
            value={filters.searchQuery}
            onChange={(e) => onUpdateFilters({ ...filters, searchQuery: e.target.value })}
            aria-label="Iskalni vnos"
          />
        </div>
        <div className="select-group">
          <span className="filter-label">Status:</span>
          <select
            value={filters.selectedStatus}
            onChange={(e) => onUpdateFilters({ ...filters, selectedStatus: e.target.value as TaskStatus })}
          >
            <option value="all">Vse</option>
            <option value="todo">Pripravljeno</option>
            <option value="in_progress">V delu</option>
            <option value="done">Končano</option>
          </select>
        </div>
        <div className="select-group">
          <span className="filter-label">Odgovorna oseba:</span>
          <select
            value={filters.selectedAssignee}
            onChange={(e) => onUpdateFilters({ ...filters, selectedAssignee: e.target.value })}
          >
            <option value="all">Vsi</option>
            {assignees.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <button type="button" onClick={onClearFilters} aria-label="Počisti filtre">
          <X size={16} />
        </button>
      </div>
      <div className="results-count">
        <strong>Prikazano: {filters.searchQuery ? totalCount : totalCount} od {totalCount}</strong>
      </div>
    </div>
  )
}
