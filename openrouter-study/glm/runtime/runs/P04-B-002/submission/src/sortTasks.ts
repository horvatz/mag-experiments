import type { Task } from '../shared/types.ts'

export const primarySortKeys = ['original', 'title', 'assignee', 'status', 'dueDate'] as const
export const secondarySortKeys = ['none', 'title', 'assignee', 'status', 'dueDate'] as const
export const sortDirections = ['asc', 'desc'] as const

export type PrimarySortKey = typeof primarySortKeys[number]
export type SecondarySortKey = typeof secondarySortKeys[number]
export type SortDirection = typeof sortDirections[number]

export interface SortSettings {
  primaryKey: PrimarySortKey
  primaryDirection: SortDirection
  secondaryKey: SecondarySortKey
  secondaryDirection: SortDirection
}

export const defaultSortSettings: SortSettings = {
  primaryKey: 'original',
  primaryDirection: 'asc',
  secondaryKey: 'none',
  secondaryDirection: 'asc',
}

const statusOrder: Record<Task['status'], number> = {
  todo: 0,
  in_progress: 1,
  done: 2,
}

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u{0300}-\u{036F}]/gu, '').toLowerCase()
}

function compareText(a: string, b: string): number {
  const first = normalize(a)
  const second = normalize(b)
  if (first < second) return -1
  if (first > second) return 1
  return 0
}

function compareDates(a: string, b: string): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

function compareKey(a: Task, b: Task, key: Exclude<SecondarySortKey, 'none'>): number {
  if (key === 'title') return compareText(a.title, b.title)
  if (key === 'assignee') return compareText(a.assignee, b.assignee)
  if (key === 'status') return statusOrder[a.status] - statusOrder[b.status]
  return compareDates(a.dueDate, b.dueDate)
}

export function sortTasks(tasks: Task[], settings: SortSettings): Task[] {
  const originalIndex = new Map(tasks.map((task, index) => [task.id, index]))
  const compareOriginal = (a: Task, b: Task) => (originalIndex.get(a.id) ?? 0) - (originalIndex.get(b.id) ?? 0)

  return tasks.toSorted((a, b) => {
    if (settings.primaryKey === 'original') return compareOriginal(a, b)

    const primaryDirection = settings.primaryDirection === 'desc' ? -1 : 1
    const primary = compareKey(a, b, settings.primaryKey) * primaryDirection
    if (primary !== 0) return primary

    if (settings.secondaryKey === 'none') return compareOriginal(a, b)

    const secondaryDirection = settings.secondaryDirection === 'desc' ? -1 : 1
    const secondary = compareKey(a, b, settings.secondaryKey) * secondaryDirection
    return secondary === 0 ? compareOriginal(a, b) : secondary
  })
}
