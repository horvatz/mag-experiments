import type { Task, TaskStatus } from '../shared/types.ts'

export type SortKey = 'original' | 'title' | 'assignee' | 'status' | 'dueDate'
export type SecondaryKey = 'none' | 'title' | 'assignee' | 'status' | 'dueDate'
export type SortDirection = 'asc' | 'desc'

export interface SortSettings {
  primary: SortKey
  primaryDirection: SortDirection
  secondary: SecondaryKey
  secondaryDirection: SortDirection
}

export const DEFAULT_SORT: SortSettings = { primary: 'original', primaryDirection: 'asc', secondary: 'none', secondaryDirection: 'asc' }

export function norm(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

const statusRank: Record<TaskStatus, number> = { todo: 0, in_progress: 1, done: 2 }

function compareText(left: string, right: string): number {
  if (left < right) return -1
  if (left > right) return 1
  return 0
}

function compareKey(key: SecondaryKey, left: Task, right: Task): number {
  switch (key) {
    case 'title': return compareText(norm(left.title), norm(right.title))
    case 'assignee': return compareText(norm(left.assignee), norm(right.assignee))
    case 'status': return statusRank[left.status] - statusRank[right.status]
    case 'dueDate': return compareText(left.dueDate, right.dueDate)
    default: return 0
  }
}

export function sortTasks(tasks: Task[], settings: SortSettings): Task[] {
  if (settings.primary === 'original') return [...tasks]
  const primary = settings.primary
  const secondary = settings.secondary
  const primaryDirection = settings.primaryDirection === 'desc' ? -1 : 1
  const secondaryDirection = settings.secondaryDirection === 'desc' ? -1 : 1
  return [...tasks].sort((left, right) => {
    const byPrimary = primaryDirection * compareKey(primary, left, right)
    if (byPrimary !== 0) return byPrimary
    if (secondary === 'none') return 0
    return secondaryDirection * compareKey(secondary, left, right)
  })
}
