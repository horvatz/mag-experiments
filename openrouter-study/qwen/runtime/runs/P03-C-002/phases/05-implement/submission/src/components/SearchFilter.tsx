import { Search } from "lucide-react"

export function SearchFilter({ onChange, statusFilter = "all", assigneeFilter = "all", clearFilters }) {
  return <>
    <div className="search-filter" role="search" aria-label="Filtriranje opravil">
      <div className="search-input-wrapper">
        <Search size={16} className="search-icon" aria-hidden="true" />
        <input
          type="search"
          placeholder="Išči opravila"
          className="search-input"
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <div className="filters-row">
        <label className="filter-group">
          <select value={statusFilter} onChange={(e) => onChange(e.target.value)} aria-label="Filter stanja">
            <option value="all">Vse stanja</option>
            <option value="todo">Pripravljeno</option>
            <option value="in_progress">V delu</option>
            <option value="done">Končano</option>
          </select>
        </label>
        <label className="filter-group">
          <select value={assigneeFilter} onChange={(e) => onChange(e.target.value)} aria-label="Filter odgovorne osebe">
            <option value="all">Vse osebe</option>
            <option value="Ana Novak">Ana Novak</option>
            <option value="Luka Kovač">Luka Kovač</option>
          </select>
        </label>
        <button 
          type="button" 
          role="status" 
          aria-label="Rezultati filtriranja"
          onClick={clearFilters}
          className="clear-filters"
        >
          Poči sti filtre
        </button>
      </div>
    </div>
  </>
}
