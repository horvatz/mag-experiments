import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { PAGE_FILTER_OPTIONS, PAGE_SIZE_OPTIONS, paginationStatus, type PageFilter, type PageSize, type PageSlice } from './pagination.ts'

export function PaginationControls({ size, filter, slice, onSizeChange, onFilterChange, onPageChange }: {
  size: PageSize
  filter: PageFilter
  slice: PageSlice<unknown>
  onSizeChange: (size: PageSize) => void
  onFilterChange: (filter: PageFilter) => void
  onPageChange: (page: number) => void
}) {
  const canPrev = slice.page > 1
  const canNext = slice.pageCount > 0 && slice.page < slice.pageCount

  return <div className="list-controls">
    <div className="control-field">
      <label htmlFor="page-size">Velikost strani</label>
      <select id="page-size" value={size} onChange={(event) => onSizeChange(event.target.value as PageSize)}>
        {PAGE_SIZE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
    <div className="control-field">
      <label htmlFor="page-filter">Filter strani</label>
      <select id="page-filter" value={filter} onChange={(event) => onFilterChange(event.target.value as PageFilter)}>
        {PAGE_FILTER_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
    <div className="pager" role="group" aria-label="Premikanje po straneh">
      <button type="button" aria-label="Prva stran" disabled={!canPrev} onClick={() => onPageChange(1)}><ChevronsLeft size={15} aria-hidden="true" />Prva stran</button>
      <button type="button" aria-label="Prejšnja stran" disabled={!canPrev} onClick={() => onPageChange(slice.page - 1)}><ChevronLeft size={15} aria-hidden="true" />Prejšnja stran</button>
      <button type="button" aria-label="Naslednja stran" disabled={!canNext} onClick={() => onPageChange(slice.page + 1)}>Naslednja stran<ChevronRight size={15} aria-hidden="true" /></button>
      <button type="button" aria-label="Zadnja stran" disabled={!canNext} onClick={() => onPageChange(slice.pageCount)}>Zadnja stran<ChevronsRight size={15} aria-hidden="true" /></button>
    </div>
    <p className="page-status" role="status" aria-label="Stanje straničenja">{paginationStatus(slice)}</p>
  </div>
}
