import type { Task } from '../shared/types.ts'

/**
 * Normalize a string for sorting per R02:
 * 1. NFD normalization
 * 2. Remove U+0300-U+036F diacritics  
 * 3. Convert to lowercase
 */
export function normalize(s: string): string {
  if (!s) return ''
  const nfd = s.normalize('NFD')
  const withoutDiacritics = nfd.replace(/[̀-ͯ]/g, '')
  return withoutDiacritics.toLowerCase()
}

/**
 * Compare status strings per R03: todo < in_progress < done
 */
export function compareStatus(a: string, b: string): number {
  const statusOrder = ['todo', 'in_progress', 'done'] as const
  const aIndex = statusOrder.indexOf(a.toLowerCase() as any)
  const bIndex = statusOrder.indexOf(b.toLowerCase() as any)
  if (aIndex === -1 && bIndex === -1) return 0
  if (aIndex === -1) return 1
  if (bIndex === -1) return -1
  return aIndex - bIndex
}

/**
 * Compare due dates as YYYY-MM-DD strings per R03
 */
export function compareDate(a: string, b: string): number {
  if (!a || !b) return 0
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

/**
 * Stable sort function for R06: preserves original indices
 */
export function stableSort<T>(items: T[], comparator: (a: T, b: T) => number): T[] {
  const indexed = items.map((item, index) => ({ item, originalIndex: index }))
  indexed.sort((a, b) => {
    const comparison = comparator(a.item, b.item)
    if (comparison !== 0) return comparison
    return a.originalIndex - b.originalIndex
  })
  return indexed.map(({ item }) => item)
}

export function normalizeText(a: string, b: string): number {
  a = normalize(a)
  b = normalize(b)
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export function compareDueDate(a: string, b: string, direction: 'asc' | 'desc'): number {
  if (direction === 'desc') {
    const cmp = compareDate(a, b)
    return cmp * -1
  }
  return compareDate(a, b)
}

export function compareStatusText(a: string, b: string, direction: 'asc' | 'desc'): number {
  if (direction === 'desc') {
    const cmp = compareStatus(a, b)
    return cmp * -1
  }
  return compareStatus(a, b)
}

