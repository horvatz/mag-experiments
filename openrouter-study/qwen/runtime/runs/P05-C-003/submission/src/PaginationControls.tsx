import type { PageSize, TaskStatus } from "../shared/types.ts"

export type PaginationControlsProps = {
  currentPage: number
  totalPages: number
  pageSize: PageSize
  filteredCount: number
  totalCount: number
  onPageChange: (page: number) => void
  onFilterChange: (filter: TaskStatus | "all") => void
  onPageSizeChange: (size: PageSize) => void
}

function PaginationControls({
  currentPage,
  totalPages,
  pageSize,
  filteredCount,
  totalCount,
  onPageChange,
  onFilterChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  const disabledPrev = currentPage === 1
  const disabledNext = currentPage === totalPages

  return (
    <div role="status" aria-label="Stanje saničenja" className="pagination-controls">
      <div className="pagination-content">
        <div className="pagination-left">
          <div className="pagination-size">
            <label htmlFor="pageSize">Veličina strani:</label>
            <select 
              id="pageSize" 
              value={pageSize === "all" ? "all" : pageSize.toString()} 
              onChange={(e) => onPageSizeChange(
                e.target.value === "all" ? "all" : parseInt(e.target.value, 10) as PageSize
              )}
              aria-label="Veličina strani"
            >
              <option value="all">all ({totalCount})</option>
              <option value="2">2 ({filteredCount})</option>
              <option value="5">5 ({filteredCount})</option>
              <option value="10">10 ({filteredCount})</option>
            </select>
          </div>
          <div className="pagination-filter">
            <label htmlFor="filter">Filter:</label>
            <select 
              id="filter" 
              value={totalCount !== filteredCount ? "all" : (totalCount === 0 ? "all" : "all")} 
              onChange={(e) => onFilterChange(e.target.value as TaskStatus | "all")}
              aria-label="Filter po stanju"
            >
              <option value="all">all</option>
              <option value="todo">todo</option>
              <option value="in_progress">in_progress</option>
              <option value="done">done</option>
            </select>
          </div>
        </div>
        <div className="pagination-right">
          <button 
            type="button" 
            className="page-link"
            onClick={() => onPageChange(1)}
            disabled={disabledPrev}
            aria-label="Prva stran"
          >
            Prva stran
          </button>
          <button 
            type="button" 
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={disabledPrev}
            aria-label="Prejsnja stran"
          >
            Prejsnja
          </button>
          <span className="page-info">
            Stran {currentPage} od {totalPages}
          </span>
          <button 
            type="button" 
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={disabledNext}
            aria-label="Naslednja stran"
          >
            Naslednja
          </button>
          <button 
            type="button" 
            className="page-link"
            onClick={() => onPageChange(totalPages)}
            disabled={disabledNext}
            aria-label="Zadnja stran"
          >
            Zadnja stran
          </button>
        </div>
      </div>
      {totalCount > 0 && (
        <div className="pagination-range">
          <strong>0</strong>–<strong>{(totalPages > 1 ? (currentPage === totalPages ? Math.min(filteredCount, totalPages * pageSize) : currentPage === 1 ? filteredCount : currentPage * pageSize) : filteredCount)}</strong> od <strong>
          {filteredCount}</strong>
        </div>
      )}
    </div>
  )
}

export default PaginationControls

