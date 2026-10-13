import type { TaskStatus } from '../shared/types.ts'

export type PageSize = 'all' | '2' | '5' | '10'
export type PageFilter = 'all' | TaskStatus

export const PAGE_SIZE_OPTIONS: { value: PageSize; label: string }[] = [
  { value: 'all', label: 'Vse' },
  { value: '2', label: '2' },
  { value: '5', label: '5' },
  { value: '10', label: '10' },
]

export const PAGE_FILTER_OPTIONS: { value: PageFilter; label: string }[] = [
  { value: 'all', label: 'Vse' },
  { value: 'todo', label: 'Pripravljeno' },
  { value: 'in_progress', label: 'V delu' },
  { value: 'done', label: 'Končano' },
]

export interface PageSlice<T> {
  items: T[]
  page: number
  pageCount: number
  from: number
  to: number
  total: number
}

export function paginate<T>(items: T[], size: PageSize, requestedPage: number): PageSlice<T> {
  const total = items.length
  const pageCount = total === 0 ? 0 : size === 'all' ? 1 : Math.ceil(total / Number(size))
  const page = pageCount === 0 ? 0 : Math.min(Math.max(requestedPage, 1), pageCount)
  const step = size === 'all' ? total : Number(size)
  const from = total === 0 ? 0 : (page - 1) * step + 1
  const to = total === 0 ? 0 : Math.min(page * step, total)
  return { items: items.slice(from === 0 ? 0 : from - 1, to), page, pageCount, from, to, total }
}

export function paginationStatus(slice: PageSlice<unknown>): string {
  return `Stran ${slice.page} od ${slice.pageCount}. Prikazano ${slice.from}–${slice.to} od ${slice.total}.`
}
