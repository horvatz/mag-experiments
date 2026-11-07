import { PAGE_SIZES, STATUS_FILTERS, type PageSize, type StatusFilter } from './pagination.ts'

const filterLabels: Record<StatusFilter, string> = {
  all: 'Vsa stanja',
  todo: 'Pripravljeno',
  in_progress: 'V delu',
  done: 'Končano',
}

export function PaginationControls({ size, filter, page, pageCount, total, status, onSizeChange, onFilterChange, onFirst, onPrevious, onNext, onLast }: {
  size: PageSize
  filter: StatusFilter
  page: number
  pageCount: number
  total: number
  status: string
  onSizeChange: (size: PageSize) => void
  onFilterChange: (filter: StatusFilter) => void
  onFirst: () => void
  onPrevious: () => void
  onNext: () => void
  onLast: () => void
}) {
  const hasItems = total > 0
  const canGoBack = hasItems && page > 1
  const canGoForward = hasItems && page < pageCount
  return <div className="pagination-bar">
    <div className="pagination-field">
      <label htmlFor="page-size">Velikost strani</label>
      <select id="page-size" value={String(size)} onChange={(event) => onSizeChange(event.target.value === 'all' ? 'all' : Number(event.target.value) as PageSize)}>
        {PAGE_SIZES.map((value) => <option key={String(value)} value={String(value)}>{value === 'all' ? 'Vse' : value}</option>)}
      </select>
    </div>
    <div className="pagination-field">
      <label htmlFor="page-filter">Filter strani</label>
      <select id="page-filter" value={filter} onChange={(event) => onFilterChange(event.target.value as StatusFilter)}>
        {STATUS_FILTERS.map((value) => <option key={value} value={value}>{filterLabels[value]}</option>)}
      </select>
    </div>
    <div className="pagination-nav" role="group" aria-label="Premik po straneh">
      <button type="button" onClick={onFirst} disabled={!canGoBack}>Prva stran</button>
      <button type="button" onClick={onPrevious} disabled={!canGoBack}>Prejšnja stran</button>
      <button type="button" onClick={onNext} disabled={!canGoForward}>Naslednja stran</button>
      <button type="button" onClick={onLast} disabled={!canGoForward}>Zadnja stran</button>
    </div>
    <p className="pagination-status" role="status" aria-label="Stanje straničenja">{status}</p>
  </div>
}
