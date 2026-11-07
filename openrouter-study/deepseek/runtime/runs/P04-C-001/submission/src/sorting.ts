import type { Task, TaskStatus } from '../shared/types.ts'

export type SortKey = 'original' | 'title' | 'assignee' | 'status' | 'dueDate'
export type SecondaryKey = SortKey | 'none'
export type SortDirection = 'asc' | 'desc'

export interface SortSettings {
  primary: SortKey
  primaryDirection: SortDirection
  secondary: SecondaryKey
  secondaryDirection: SortDirection
}

export const DEFAULT_SORT_SETTINGS: SortSettings = { primary: 'original', primaryDirection: 'asc', secondary: 'none', secondaryDirection: 'asc' }

const STATUS_RANK: Record<TaskStatus, number> = { todo: 0, in_progress: 1, done: 2 }

export function normalizeLabel(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function compareStrings(a: string, b: string): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

function compareValues(key: SortKey, a: Task, b: Task): number {
  if (key === 'title') return compareStrings(normalizeLabel(a.title), normalizeLabel(b.title))
  if (key === 'assignee') return compareStrings(normalizeLabel(a.assignee), normalizeLabel(b.assignee))
  if (key === 'status') return STATUS_RANK[a.status] - STATUS_RANK[b.status]
  if (key === 'dueDate') return compareStrings(a.dueDate, b.dueDate)
  return 0
}

export function sortTasks(tasks: Task[], settings: SortSettings): Task[] {
  if (settings.primary === 'original') return [...tasks]
  const primarySign = settings.primaryDirection === 'asc' ? 1 : -1
  const secondarySign = settings.secondaryDirection === 'asc' ? 1 : -1
  return tasks
    .map((task, index) => ({ task, index }))
    .sort((a, b) => {
      const primary = compareValues(settings.primary, a.task, b.task) * primarySign
      if (primary !== 0) return primary
      if (settings.secondary !== 'none') {
        const secondary = compareValues(settings.secondary, a.task, b.task) * secondarySign
        if (secondary !== 0) return secondary
      }
      return a.index - b.index
    })
    .map((entry) => entry.task)
}
