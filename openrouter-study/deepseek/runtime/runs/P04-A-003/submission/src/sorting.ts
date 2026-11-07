import type { Task, TaskStatus } from '../shared/types.ts'

export type SortKey = 'original' | 'title' | 'assignee' | 'status' | 'dueDate'
export type SecondarySortKey = Exclude<SortKey, 'original'> | 'none'
export type SortDirection = 'asc' | 'desc'

export interface SortState {
  primary: SortKey
  primaryDirection: SortDirection
  secondary: SecondarySortKey
  secondaryDirection: SortDirection
}

export const defaultSortState: SortState = {
  primary: 'original',
  primaryDirection: 'asc',
  secondary: 'none',
  secondaryDirection: 'asc',
}

const statusRank: Record<TaskStatus, number> = { todo: 0, in_progress: 1, done: 2 }

// NFD, odstranitev U+0300–U+036F, male črke. Brez jezikovnega ali številskega urejanja.
export function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function compareText(left: string, right: string): number {
  const a = normalizeText(left)
  const b = normalizeText(right)
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export function compareByKey(key: Exclude<SortKey, 'original'>, a: Task, b: Task): number {
  switch (key) {
    case 'title':
      return compareText(a.title, b.title)
    case 'assignee':
      return compareText(a.assignee, b.assignee)
    case 'status':
      return statusRank[a.status] - statusRank[b.status]
    case 'dueDate':
      return a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0
  }
}

function directed(result: number, direction: SortDirection): number {
  return direction === 'desc' ? -result : result
}

// Razvrščanje je projekcija: vrne novo polje, izvornega ne spremeni.
export function sortTasks(tasks: Task[], state: SortState): Task[] {
  const { primary, primaryDirection, secondary, secondaryDirection } = state
  if (primary === 'original') return [...tasks]
  const sorted = [...tasks]
  sorted.sort((a, b) => {
    const primaryResult = directed(compareByKey(primary, a, b), primaryDirection)
    if (primaryResult !== 0) return primaryResult
    if (secondary === 'none') return 0
    return directed(compareByKey(secondary, a, b), secondaryDirection)
  })
  return sorted
}
