import type { TaskStatus } from '../shared/types.ts'

export type PageSize = 'all' | 2 | 5 | 10
export type PageFilter = 'all' | TaskStatus

interface TaskPaginationProps {
  pageSize: PageSize
  pageFilter: PageFilter
  page: number
  pageCount: number
  total: number
  start: number
  end: number
  onPageSizeChange: (size: PageSize) => void
  onPageFilterChange: (filter: PageFilter) => void
  onPageChange: (page: number) => void
}

export function TaskPagination({ pageSize, pageFilter, page, pageCount, total, start, end, onPageSizeChange, onPageFilterChange, onPageChange }: TaskPaginationProps) {
  const atStart = pageCount === 0 || page <= 1
  const atEnd = pageCount === 0 || page >= pageCount

  return <div className="task-pagination">
    <div className="pagination-filters">
      <label>Velikost strani
        <select value={pageSize} onChange={(event) => onPageSizeChange(event.target.value === 'all' ? 'all' : Number(event.target.value) as PageSize)}>
          <option value="all">Vsa opravila</option>
          <option value="2">2</option>
          <option value="5">5</option>
          <option value="10">10</option>
        </select>
      </label>
      <label>Filter strani
        <select value={pageFilter} onChange={(event) => onPageFilterChange(event.target.value as PageFilter)}>
          <option value="all">Vsa stanja</option>
          <option value="todo">Pripravljeno</option>
          <option value="in_progress">V delu</option>
          <option value="done">Končano</option>
        </select>
      </label>
    </div>
    <p className="pagination-status" role="status" aria-label="Stanje straničenja" aria-atomic="true">Stran {pageCount === 0 ? 0 : page} od {pageCount}. Prikazano {start}–{end} od {total}.</p>
    <div className="pagination-buttons" role="group" aria-label="Premik med stranmi">
      <button className="button" type="button" disabled={atStart} onClick={() => onPageChange(1)}>Prva stran</button>
      <button className="button" type="button" disabled={atStart} onClick={() => onPageChange(Math.max(1, page - 1))}>Prejšnja stran</button>
      <button className="button" type="button" disabled={atEnd} onClick={() => onPageChange(Math.min(pageCount, page + 1))}>Naslednja stran</button>
      <button className="button" type="button" disabled={atEnd} onClick={() => onPageChange(pageCount)}>Zadnja stran</button>
    </div>
  </div>
}
