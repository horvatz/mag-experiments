import { useState, useMemo, type ReactNode } from "react"
import { getAssigneesForFilter, type FilterState, type Task } from "./filter.tsx"

export interface FilterBarProps {
  tasks: Task[]
  onFilterChange: (filters: FilterState) => void
  onClearFilters: () => void
}

export function FilterBar({ tasks, onFilterChange, onClearFilters }: FilterBarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [assigneeFilter, setAssigneeFilter] = useState("all")

  return (
    <div className="filter-bar" aria-label="Rezultati filtriranja">
      <div className="filter-inputs">
        <input
          type="search"
          id="search-task"
          name="search"
          placeholder="Išči opravila"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); onFilterChange({ searchQuery: e.target.value, statusFilter, assigneeFilter })}}
          aria-label="Išči opravila"
        />
        <select
          id="filter-status"
          name="status"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); onFilterChange({ searchQuery, statusFilter: e.target.value, assigneeFilter })}}
          aria-label="Filter stanja"
        >
          <option value="all">Vsa stanja</option>
          <option value="todo">Pripravljeno</option>
          <option value="in_progress">V delu</option>
          <option value="done">Končano</option>
        </select>
        <select
          id="filter-assignee"
          name="assignee"
          value={assigneeFilter}
          onChange={(e) => { setAssigneeFilter(e.target.value); onFilterChange({ searchQuery, statusFilter, assigneeFilter: e.target.value })}}
          aria-label="Filter odgovorne osebe"
        >
          <option value="all">Vsi odgovorni</option>
          {getAssigneesForFilter(tasks.filter(t => t.assignee && t.assignee !== "Unassigned")).map((assignee, i) => (
            <option key={assignee + i} value={assignee}>{assignee}</option>
          ))}
        </select>
        <button
          type="button"
          id="clear-filters"
          name="clear"
          onClick={onClearFilters}
          role="status"
          aria-label="Počisti filtre"
        >
          Počisti filtre
        </button>
      </div>
      <span className="filter-results" aria-label="Rezultati filtriranja">
        Prikazano: {tasks.length} od {tasks.length}
      </span>
    </div>
  )
}
