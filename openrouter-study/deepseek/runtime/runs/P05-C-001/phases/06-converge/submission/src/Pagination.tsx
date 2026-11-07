import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react'
import type { TaskStatus } from '../shared/types.ts'

export type PageSize = 'all' | '2' | '5' | '10'
export type TaskFilter = 'all' | TaskStatus

const sizeOptions: { value: PageSize; label: string }[] = [
  { value: 'all', label: 'Vse' },
  { value: '2', label: '2' },
  { value: '5', label: '5' },
  { value: '10', label: '10' },
]

const filterOptions: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: 'Vsa opravila' },
  { value: 'todo', label: 'Pripravljeno' },
  { value: 'in_progress', label: 'V delu' },
  { value: 'done', label: 'Končano' },
]

type PaginationProps = {
  pageSize: PageSize
  filter: TaskFilter
  page: number
  pageCount: number
  total: number
  firstIndex: number
  lastIndex: number
  onPageSize: (value: PageSize) => void
  onFilter: (value: TaskFilter) => void
  onPage: (value: number) => void
}

export function Pagination({ pageSize, filter, page, pageCount, total, firstIndex, lastIndex, onPageSize, onFilter, onPage }: PaginationProps) {
  const empty = total === 0
  const statusText = empty
    ? 'Stran 0 od 0. Prikazano 0–0 od 0.'
    : `Stran ${page} od ${pageCount}. Prikazano ${firstIndex}–${lastIndex} od ${total}.`

  return <div className="pagination">
    <div className="pagination-field">
      <span className="pagination-label">Velikost strani</span>
      <select aria-label="Velikost strani" value={pageSize} onChange={(event) => onPageSize(event.target.value as PageSize)}>
        {sizeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
    <div className="pagination-field">
      <span className="pagination-label">Filter strani</span>
      <select aria-label="Filter strani" value={filter} onChange={(event) => onFilter(event.target.value as TaskFilter)}>
        {filterOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
    <div className="pagination-nav" role="group" aria-label="Premikanje po straneh">
      <button type="button" className="pagination-button" disabled={empty || page <= 1} onClick={() => onPage(1)}>
        <ChevronFirst size={15} strokeWidth={1.6} aria-hidden="true" />Prva stran
      </button>
      <button type="button" className="pagination-button" disabled={empty || page <= 1} onClick={() => onPage(page - 1)}>
        <ChevronLeft size={15} strokeWidth={1.6} aria-hidden="true" />Prejšnja stran
      </button>
      <button type="button" className="pagination-button" disabled={empty || page >= pageCount} onClick={() => onPage(page + 1)}>
        <ChevronRight size={15} strokeWidth={1.6} aria-hidden="true" />Naslednja stran
      </button>
      <button type="button" className="pagination-button" disabled={empty || page >= pageCount} onClick={() => onPage(pageCount)}>
        <ChevronLast size={15} strokeWidth={1.6} aria-hidden="true" />Zadnja stran
      </button>
    </div>
    <p className="pagination-status" role="status" aria-label="Stanje straničenja">{statusText}</p>
  </div>
}
