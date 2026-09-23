import type { TaskStatus } from '../shared/types.ts'

export type PageSize = 'all' | '2' | '5' | '10'
export type TaskFilter = 'all' | TaskStatus

type Props = {
  pageSize: PageSize
  filter: TaskFilter
  page: number
  pageCount: number
  total: number
  first: number
  last: number
  onPageSizeChange: (value: PageSize) => void
  onFilterChange: (value: TaskFilter) => void
  onPageChange: (value: number) => void
}

export function TaskPagination({ pageSize, filter, page, pageCount, total, first, last, onPageSizeChange, onFilterChange, onPageChange }: Props) {
  const atStart = page <= 1
  const atEnd = page >= pageCount

  return <div className="task-pagination">
    <div className="pagination-selects">
      <label>Velikost strani
        <select value={pageSize} onChange={(event) => onPageSizeChange(event.target.value as PageSize)}>
          <option value="all">Vsa opravila</option>
          <option value="2">2</option>
          <option value="5">5</option>
          <option value="10">10</option>
        </select>
      </label>
      <label>Filter strani
        <select value={filter} onChange={(event) => onFilterChange(event.target.value as TaskFilter)}>
          <option value="all">Vsa stanja</option>
          <option value="todo">Pripravljeno</option>
          <option value="in_progress">V delu</option>
          <option value="done">Končano</option>
        </select>
      </label>
    </div>
    <div className="pagination-navigation">
      <p role="status" aria-label="Stanje straničenja">Stran {page} od {pageCount}. Prikazano {first}–{last} od {total}.</p>
      <div className="pagination-buttons" role="group" aria-label="Premik po straneh">
        <button type="button" className="button" disabled={atStart} onClick={() => onPageChange(1)}>Prva stran</button>
        <button type="button" className="button" disabled={atStart} onClick={() => onPageChange(page - 1)}>Prejšnja stran</button>
        <button type="button" className="button" disabled={atEnd} onClick={() => onPageChange(page + 1)}>Naslednja stran</button>
        <button type="button" className="button" disabled={atEnd} onClick={() => onPageChange(pageCount)}>Zadnja stran</button>
      </div>
    </div>
  </div>
}
